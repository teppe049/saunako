#!/usr/bin/env node
/**
 * STORES予約（旧Coubic）を使う施設の予約ページIDを採取し data/coubic.json を生成する
 * Usage: node scripts/coubic-discover.mjs
 *
 * - facilities.json の bookingUrl / website から merchant スラッグを抽出
 * - 認証不要の `api/v2/merchants/{merchant}/booking_pages` で予約ページ一覧を取得
 * - status が accepting のページのみ保存（空き状況表示 /api/availability で使う）
 * - 非公式APIのため、失敗した施設はスキップ（表示側は graceful degradation）
 */
import fs from 'fs';
import path from 'path';

const facilities = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/facilities.json'), 'utf-8'));
const OUT = path.join(process.cwd(), 'data/coubic.json');
// 同一merchantへの連続アクセスを避ける間隔（非公式APIへの配慮）
const INTERVAL_MS = 400;
// 1施設あたり保存する予約ページ上限（空き判定の呼び出し数を抑える）
const MAX_PAGES = 4;
// 1予約ページあたり保存するコース上限
const MAX_COURSES = 2;

export function extractMerchant(url) {
  if (!url) return null;
  let m = url.match(/^https?:\/\/(?:www\.)?coubic\.com\/([A-Za-z0-9_.-]+)/);
  if (m) return m[1];
  m = url.match(/^https?:\/\/([a-z0-9-]+)\.stores\.jp\/reserve\/([A-Za-z0-9_.-]+)/);
  if (m) return m[2];
  m = url.match(/^https?:\/\/([a-z0-9-]+)\.stores\.jp\/?/);
  if (m) return m[1];
  return null;
}

/** coubic.com/{merchant} の308リダイレクト先から stores.jp のホスト名を解決する（ホスト名はスラッグと一致しない） */
async function resolveHost(merchant) {
  const res = await fetch(`https://coubic.com/${merchant}`, { method: "HEAD", redirect: "manual", signal: AbortSignal.timeout(15000) });
  const loc = res.headers.get("location") || "";
  const m = loc.match(/^https:\/\/([a-z0-9-]+\.stores\.jp)\//);
  if (m) return m[1];
  return `${merchant.toLowerCase()}.stores.jp`;
}

async function fetchBookingPages(merchant, host) {
  const url = `https://${host}/reserve/api/v2/merchants/${merchant}/booking_pages`;
  const res = await fetch(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return (json.data || [])
    .filter((p) => p.status === 'accepting')
    .map((p) => ({ id: String(p.public_id), name: p.name, lowestPrice: p.lowest_price ?? null }));
}

/** 予約ページのコース一覧（course_scheme 型でないページは空配列が返る） */
async function fetchCourses(merchant, host, pageId) {
  const url = `https://${host}/reserve/api/reservation_flow/merchants/${merchant}/course_scheme/resources/${pageId}/courses`;
  const res = await fetch(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(15000) });
  if (!res.ok) return [];
  const json = await res.json();
  return (json.courses || []).slice(0, MAX_COURSES).map((c) => ({ id: String(c.canonical_id), name: c.name }));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const result = {};
const failures = [];
const targets = facilities.filter((f) => !f.closedAt && (extractMerchant(f.bookingUrl) || extractMerchant(f.website)));
console.log(`対象 ${targets.length} 施設`);

for (const f of targets) {
  const merchant = extractMerchant(f.bookingUrl) || extractMerchant(f.website);
  try {
    const host = await resolveHost(merchant);
    const accepting = await fetchBookingPages(merchant, host);
    const pages = [];
    for (const p of accepting) {
      if (pages.length >= MAX_PAGES) break;
      const courses = await fetchCourses(merchant, host, p.id);
      if (courses.length > 0) pages.push({ ...p, courses });
      await sleep(INTERVAL_MS / 2);
    }
    if (accepting.length === 0) {
      failures.push(`${f.id} ${merchant}: accepting な予約ページなし`);
    } else if (pages.length === 0) {
      failures.push(`${f.id} ${merchant}: コース情報なし（course_scheme 非対応の予約ページ ${accepting.length}件）`);
    } else {
      result[f.id] = { merchant, host, bookingPages: pages };
      console.log(`OK ${f.id} ${merchant} @${host} pages=${pages.length}`);
    }
  } catch (e) {
    failures.push(`${f.id} ${merchant}: ${e.message}`);
  }
  await sleep(INTERVAL_MS);
}

fs.writeFileSync(OUT, JSON.stringify(result, null, 2) + '\n');
console.log(`\n書き出し: ${OUT} (${Object.keys(result).length} 施設)`);
if (failures.length) {
  console.log(`\nスキップ ${failures.length} 件:`);
  for (const line of failures) console.log('  ' + line);
}
