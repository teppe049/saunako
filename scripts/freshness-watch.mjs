#!/usr/bin/env node
/**
 * 掲載施設の公式サイトを週1回取得し、料金まわりの記載が前回から変わった施設と、閉店の兆候がある施設を一覧にする。
 *
 * 背景: 434施設が2〜3月の登録から更新されておらず、10/29の裏どりだけで閉店1・料金改定2が見つかった。
 * 人が480施設を毎週見るのは無理なので、「変わったところだけ」を人に回す。直すのは人（facilities.json と verifiedAt）。
 *
 * - 取得先は priceUrl（無ければ website）。Instagram など本文が取れないドメインは飛ばす
 * - 比較するのは「円・¥ を含む行」だけ。ページ全体のハッシュは動的な要素で毎回変わり、差分が使い物にならない
 * - 予約サイト（STORES 等）は取得しない（規約上の解析禁止に触れ得るため。reference_coubic-api）
 *
 * 使い方:
 *   node scripts/freshness-watch.mjs              # 全施設。snapshot と report を更新
 *   node scripts/freshness-watch.mjs --dry-run    # 書き込まずに差分だけ出す
 *   node scripts/freshness-watch.mjs --id 147     # 1施設だけ
 *   node scripts/freshness-watch.mjs --limit 20   # 先頭20施設だけ（動作確認用）
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FACILITIES = join(ROOT, 'data/facilities.json');
const SNAPSHOT = join(ROOT, 'data/freshness/snapshot.json');
const REPORT = join(ROOT, 'docs/freshness-report.md');

// 公式サイト側の負荷を抑える（週1回・同時4本・1施設1ページ）
const CONCURRENCY = 4;
const TIMEOUT_MS = 15_000;
// 1施設あたりに保存する料金行の上限。トップページに料金一覧が全部載っている施設でも差分を読める量に抑える
const MAX_PRICE_LINES = 40;
const UA = 'Mozilla/5.0 (compatible; saunako-freshness/1.0; +https://www.saunako.jp/)';

// 本文が JS 描画で取れない、または予約サイトで取得しないドメイン
const SKIP_HOSTS = [
  'instagram.com', 'x.com', 'twitter.com', 'facebook.com', 'lin.ee', 'line.me',
  'coubic.com', 'stores.jp', 'hacomono.jp', 'airrsv.net', 'reserva.be', 'spacemarket.com',
];
const CLOSED_RE = /閉店いたしました|閉店しました|営業を終了いたしました|営業を終了しました|閉業いたしました|閉業しました/;

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const DRY_RUN = flag('--dry-run');
const ONLY_ID = opt('--id') ? Number(opt('--id')) : null;
const LIMIT = opt('--limit') ? Number(opt('--limit')) : Infinity;

export function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|tr|h[1-6]|dt|dd|section|article)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&yen;|&#165;|&#xa5;/gi, '¥')
    .replace(/&amp;/g, '&')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ');
}

/** 金額らしき記載を含む行（「3,300円」「¥3,300」「3300円〜」）を、順序を保って重複なしで返す */
export function extractPriceLines(text) {
  const lines = text
    .split(/\n|。/)
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter((l) => l.length > 0 && l.length <= 160)
    .filter((l) => /(\d[\d,]*\s*円|[¥￥]\s*\d)/.test(l));
  return [...new Set(lines)].slice(0, MAX_PRICE_LINES);
}

const sha = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16);

function targetUrl(f) {
  const url = f.priceUrl || f.website;
  if (!url || !/^https?:\/\//.test(url)) return null;
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    if (SKIP_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) return null;
  } catch {
    return null;
  }
  return url;
}

async function check(f, url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers: { 'user-agent': UA, 'accept-language': 'ja' }, signal: ctrl.signal, redirect: 'follow' });
    const html = res.ok ? await res.text() : '';
    const text = htmlToText(html);
    const priceLines = extractPriceLines(text);
    return {
      url,
      status: res.status,
      priceHash: sha(priceLines.join('\n')),
      priceLines,
      closedHint: res.status === 404 || res.status === 410 || CLOSED_RE.test(text),
    };
  } catch (e) {
    return { url, status: 0, error: String(e?.name === 'AbortError' ? 'timeout' : e?.message ?? e) };
  } finally {
    clearTimeout(timer);
  }
}

async function pool(items, worker) {
  const out = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (i < items.length) {
        const item = items[i++];
        out.push(await worker(item));
      }
    })
  );
  return out;
}

async function main() {
  const facilities = JSON.parse(readFileSync(FACILITIES, 'utf8'))
    .filter((f) => !f.closedAt)
    .filter((f) => ONLY_ID === null || f.id === ONLY_ID)
    .slice(0, LIMIT);
  const prev = existsSync(SNAPSHOT) ? JSON.parse(readFileSync(SNAPSHOT, 'utf8')) : {};
  // 日付は JST（UTC のままだと深夜0〜9時の実行が前日扱いになる）
  const today = new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);

  const targets = facilities.map((f) => ({ f, url: targetUrl(f) }));
  const skipped = targets.filter((t) => !t.url).length;
  console.error(`対象 ${targets.length - skipped}施設（取得しないドメイン・URLなし ${skipped}施設）`);

  const results = await pool(
    targets.filter((t) => t.url),
    async ({ f, url }) => ({ f, r: await check(f, url) })
  );

  const changed = [];
  const closed = [];
  const errors = [];
  const next = { ...prev };
  for (const { f, r } of results.sort((a, b) => a.f.id - b.f.id)) {
    const before = prev[f.id];
    if (r.error || r.status >= 400) {
      errors.push({ f, r });
      if (r.closedHint) closed.push({ f, r });
      // 一時的な失敗で前回の記録を消さない
      continue;
    }
    if (r.closedHint) closed.push({ f, r });
    // URL が変わった施設は比較の基準が違うので、今回を基準として記録し直すだけにする
    if (before && before.url === r.url && before.priceHash !== r.priceHash) {
      const old = new Set(before.priceLines);
      const now = new Set(r.priceLines);
      changed.push({
        f,
        added: r.priceLines.filter((l) => !old.has(l)),
        removed: before.priceLines.filter((l) => !now.has(l)),
      });
    }
    next[f.id] = { url: r.url, priceHash: r.priceHash, priceLines: r.priceLines, checkedAt: today };
  }

  const lines = [`## ${today}`, ''];
  lines.push(`取得 ${results.length}施設 / 料金の記載が変わった ${changed.length} / 閉店の兆候 ${closed.length} / 取得失敗 ${errors.length}`, '');
  if (closed.length > 0) {
    lines.push('### 閉店の兆候', '');
    for (const { f, r } of closed) lines.push(`- [ ] ${f.id} ${f.name}（HTTP ${r.status}） ${r.url}`);
    lines.push('');
  }
  if (changed.length > 0) {
    lines.push('### 料金の記載が変わった', '');
    for (const { f, added, removed } of changed) {
      lines.push(`- [ ] ${f.id} ${f.name}（掲載 ${f.priceMin.toLocaleString()}円/${f.duration}分） ${f.priceUrl || f.website}`);
      for (const l of removed.slice(0, 8)) lines.push(`  - 消えた: ${l}`);
      for (const l of added.slice(0, 8)) lines.push(`  - 増えた: ${l}`);
    }
    lines.push('');
  }
  if (errors.length > 0) {
    lines.push('<details><summary>取得失敗</summary>', '');
    for (const { f, r } of errors) lines.push(`- ${f.id} ${f.name}: ${r.error ?? `HTTP ${r.status}`}`);
    lines.push('', '</details>', '');
  }
  const report = lines.join('\n');
  console.log(report);

  if (DRY_RUN || ONLY_ID !== null || LIMIT !== Infinity) {
    console.error('--dry-run / --id / --limit 指定のため snapshot と report は書き込まない');
    return;
  }
  mkdirSync(dirname(SNAPSHOT), { recursive: true });
  writeFileSync(SNAPSHOT, `${JSON.stringify(next, null, 1)}\n`);
  if (!existsSync(REPORT)) {
    writeFileSync(
      REPORT,
      '# 施設情報の鮮度チェック\n\n`node scripts/freshness-watch.mjs` の結果。差分を公式で確認し、facilities.json を直したら verifiedAt を更新してチェックを付ける。\n\n'
    );
  }
  appendFileSync(REPORT, `${report}\n`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
