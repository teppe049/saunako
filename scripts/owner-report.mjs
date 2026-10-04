#!/usr/bin/env node
/**
 * 施設オーナー向け送客レポート（GA4 → Markdown）
 *
 * 施設ページの閲覧数と、そこから予約ページ・公式サイト・電話へ送り出した回数を月単位で集計する。
 * 施設課金の営業資料（docs/monetization-roadmap.md）に使う。
 *
 * 使い方:
 *   node scripts/owner-report.mjs                    # 先月・予約クリック上位20施設の一覧
 *   node scripts/owner-report.mjs --month 2026-09    # 対象月を指定
 *   node scripts/owner-report.mjs --top 50
 *   node scripts/owner-report.mjs --id 147           # 1施設分の送付用レポート
 *
 * 認証: GA4 MCP と同じサービスアカウント鍵を使う。
 *   GA4_KEY_FILE（既定: ~/.secrets/mcp-keys/ga4-mcp-key.json）
 *
 * 注意: facility_id は GA4 のカスタムディメンション。登録（2026-09-02）より前の月は取れない。
 */
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const PROPERTY_ID = '524886555';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function parseArgs(argv) {
  const args = { top: 20 };
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === '--month') { args.month = value; i++; }
    else if (key === '--top') { args.top = Number(value); i++; }
    else if (key === '--id') { args.id = Number(value); i++; }
    else if (key === '--help' || key === '-h') { args.help = true; }
    else throw new Error(`不明な引数: ${key}`);
  }
  return args;
}

/** 'YYYY-MM' → 月初・月末（未指定なら先月） */
function monthRange(month) {
  let y, m;
  if (month) {
    if (!/^\d{4}-\d{2}$/.test(month)) throw new Error('--month は YYYY-MM 形式で指定してください');
    [y, m] = month.split('-').map(Number);
  } else {
    const now = new Date();
    y = now.getFullYear();
    m = now.getMonth(); // 0始まりなので「先月」の1始まりの月番号になる
    if (m === 0) { y -= 1; m = 12; }
  }
  const last = new Date(y, m, 0).getDate();
  const mm = String(m).padStart(2, '0');
  return { label: `${y}年${m}月`, startDate: `${y}-${mm}-01`, endDate: `${y}-${mm}-${last}`, y, m };
}

function prevMonth({ y, m }) {
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`;
}

function createClient() {
  const keyFile = process.env.GA4_KEY_FILE || join(homedir(), '.secrets/mcp-keys/ga4-mcp-key.json');
  const key = JSON.parse(readFileSync(keyFile, 'utf8'));
  return new BetaAnalyticsDataClient({
    credentials: { client_email: key.client_email, private_key: key.private_key },
  });
}

const EVENTS = ['view_facility', 'click_reservation_link', 'click_external_link'];

/** 施設ID → { views, viewUsers, reservation, website, phone } */
async function fetchStats(client, { startDate, endDate }, facilityId) {
  const expressions = [
    { filter: { fieldName: 'eventName', inListFilter: { values: EVENTS } } },
  ];
  if (facilityId) {
    expressions.push({ filter: { fieldName: 'customEvent:facility_id', stringFilter: { value: String(facilityId) } } });
  }
  const [res] = await client.runReport({
    property: `properties/${PROPERTY_ID}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'customEvent:facility_id' }, { name: 'eventName' }, { name: 'customEvent:link_type' }],
    metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
    dimensionFilter: { andGroup: { expressions } },
    limit: 100000,
  });

  const stats = new Map();
  for (const row of res.rows ?? []) {
    const [idStr, event, linkType] = row.dimensionValues.map((d) => d.value);
    const id = Number(idStr);
    if (!Number.isInteger(id) || id <= 0) continue; // (not set) など
    const count = Number(row.metricValues[0].value);
    const users = Number(row.metricValues[1].value);
    const s = stats.get(id) ?? { views: 0, viewUsers: 0, reservation: 0, website: 0, phone: 0 };
    if (event === 'view_facility') { s.views += count; s.viewUsers += users; }
    else if (event === 'click_reservation_link') s.reservation += count;
    else if (event === 'click_external_link' && linkType === 'phone') s.phone += count;
    else if (event === 'click_external_link') s.website += count;
    stats.set(id, s);
  }
  return stats;
}

const sendTotal = (s) => s.reservation + s.website + s.phone;

function formatDiff(cur, prev) {
  if (!prev) return '—';
  const pct = Math.round(((cur - prev) / prev) * 100);
  return `${pct >= 0 ? '+' : ''}${pct}%`;
}

function main() {
  return (async () => {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) {
      console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0]);
      return;
    }
    const facilities = JSON.parse(readFileSync(join(ROOT, 'data/facilities.json'), 'utf8'));
    const byId = new Map(facilities.map((f) => [f.id, f]));
    const range = monthRange(args.month);
    const prevRange = monthRange(prevMonth(range));
    const client = createClient();

    if (args.id) {
      const facility = byId.get(args.id);
      if (!facility) throw new Error(`施設ID ${args.id} は facilities.json にありません`);
      const [cur, prev] = await Promise.all([
        fetchStats(client, range, args.id),
        fetchStats(client, prevRange, args.id),
      ]);
      const s = cur.get(args.id) ?? { views: 0, viewUsers: 0, reservation: 0, website: 0, phone: 0 };
      const p = prev.get(args.id);
      const rate = s.viewUsers ? ((sendTotal(s) / s.viewUsers) * 100).toFixed(1) : '0.0';
      console.log(`# ${facility.name} 様 送客レポート（${range.label}）

サウナ子（https://www.saunako.jp/facilities/${facility.id}）経由の実績です。

| 項目 | ${range.label} | 前月比 |
|---|---|---|
| 施設ページの閲覧数 | ${s.views.toLocaleString()}回（${s.viewUsers.toLocaleString()}人） | ${formatDiff(s.views, p?.views)} |
| 予約ページへの送客 | ${s.reservation.toLocaleString()}回 | ${formatDiff(s.reservation, p?.reservation)} |
| 公式サイトへの送客 | ${s.website.toLocaleString()}回 | ${formatDiff(s.website, p?.website)} |
| 電話タップ | ${s.phone.toLocaleString()}回 | ${formatDiff(s.phone, p?.phone)} |
| **送客合計** | **${sendTotal(s).toLocaleString()}回** | ${formatDiff(sendTotal(s), p && sendTotal(p))} |

閲覧した人のうち送客に至った割合（回数÷閲覧人数）: ${rate}%

※ Google アナリティクス 4 の計測値です。広告ブロッカー等で計測されない閲覧があるため、実数はこれより多くなります。
※ 予約が成立したかどうかは計測していません（予約ページへ移動した回数です）。`);
      return;
    }

    const [cur, prev] = await Promise.all([fetchStats(client, range), fetchStats(client, prevRange)]);
    const rows = [...cur.entries()]
      .filter(([id]) => byId.has(id))
      .sort((a, b) => sendTotal(b[1]) - sendTotal(a[1]))
      .slice(0, args.top);
    const all = [...cur.values()];
    const total = (key) => all.reduce((sum, s) => sum + s[key], 0);

    console.log(`# 送客レポート ${range.label}（${range.startDate}〜${range.endDate}）

全体: 施設ページ閲覧 ${total('views').toLocaleString()}回 / 予約 ${total('reservation').toLocaleString()}回 / 公式サイト ${total('website').toLocaleString()}回 / 電話 ${total('phone').toLocaleString()}回（${cur.size}施設）

| # | ID | 施設 | 閲覧(人) | 予約 | 公式 | 電話 | 送客計 | 前月比 | 送客率 |
|---|---|---|---|---|---|---|---|---|---|`);
    rows.forEach(([id, s], i) => {
      const p = prev.get(id);
      const rate = s.viewUsers ? `${((sendTotal(s) / s.viewUsers) * 100).toFixed(0)}%` : '—';
      const closed = byId.get(id).closedAt ? '（掲載終了）' : '';
      console.log(
        `| ${i + 1} | ${id} | ${byId.get(id).name}${closed} | ${s.viewUsers} | ${s.reservation} | ${s.website} | ${s.phone} | ${sendTotal(s)} | ${formatDiff(sendTotal(s), p && sendTotal(p))} | ${rate} |`
      );
    });
  })();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
