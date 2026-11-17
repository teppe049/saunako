#!/usr/bin/env node
/**
 * saunako の SEO 計測 CLI（Search Console API + GA4 Data API）
 *
 * /analytics-pdca から呼ぶ。施策の前後比較・対照・候補出しの計算を毎回その場で書くと、
 * 回ごとに計算が変わって結論がぶれるため、ここに固定する（2026-11-17。SaunaTrip の
 * ~/.config/saunatrip-analytics.py の gsc-compare / gsc-opps を移植）。
 *
 * 認証: GA4・GSC の MCP と同じサービスアカウント鍵（ga4-mcp@saunako）。gcloud は使わない。
 *   GA4_KEY_FILE（既定: ~/.secrets/mcp-keys/ga4-mcp-key.json）
 *
 * 使い方（出力はすべて JSON）:
 *   node scripts/seo-analytics.mjs check
 *   node scripts/seo-analytics.mjs gsc-compare --release 2026-11-12 --pages /area/okayama \
 *     --control-prefix /area/ --exclude /area/chiba,/area/tokyo --queries "岡山 個室サウナ,岡山 プライベートサウナ"
 *   node scripts/seo-analytics.mjs gsc-noise --before 2026-09-07:2026-10-04 --after 2026-10-05:2026-11-01 --prefix /area/
 *   node scripts/seo-analytics.mjs gsc-opps --start 2026-10-18 --end 2026-11-14 --exclude /area/okayama
 *   node scripts/seo-analytics.mjs inspect --urls /area/okayama,/area/tokyo/shibuya-ebisu-daikanyama
 *   node scripts/seo-analytics.mjs gsc --start ... --end ... --dimensions page --query-regex "都内|東京"
 *   node scripts/seo-analytics.mjs ga4 --start 28daysAgo --end yesterday --dimensions sessionSource \
 *     --metrics sessions --filter-dimension sessionDefaultChannelGroup --filter-value "Organic Search"
 */
import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SITE = 'sc-domain:saunako.jp';
const PROPERTY_ID = '524886555';
const SITE_HOSTS = ['www.saunako.jp', 'saunako.jp'];
const BRAND_TERMS = ['サウナ子', 'さうなこ', 'saunako'];
// GSC は直近 2〜3 日ぶんが未確定
const GSC_LAG_DAYS = 3;
// 対照が小さいと数ページの増減で比が振れる。SaunaTrip と同じ下限
const CONTROL_MIN_PAGES = 3;
const CONTROL_MIN_IMP = 300;
const POSITION_BANDS = [[1, 3], [4, 6], [7, 10], [11, 15], [16, 20]];
const BAND_LEVERS = {
  '1-3': 'title・description（CTR）',
  '4-6': 'title＋本文の充実',
  '7-10': 'title＋本文の充実',
  '11-15': '本文の深さ・内部リンク・FAQ（title では動かない）',
  '16-20': '本文の深さ・内部リンク・FAQ（title では動かない）',
  '21+': '専用ページ・検索意図の見直し・被リンク（または取れない語）',
};
const DAY_MS = 86400000;

// ---- 純関数（tests/seo-analytics.test.ts） ----

/**
 * GSC の URL → パス。saunako 以外のホストと `#` 付き（サイトリンク表示）は null。
 * `#` 付きは本体の URL と同じ検索で別に数えられるので、足すと二重になる。
 */
export function toPath(url) {
  let u;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  if (!SITE_HOSTS.includes(u.hostname) || u.hash) return null;
  let path = u.pathname.replace(/\/+$/, '') || '/';
  try {
    path = decodeURI(path);
  } catch {
    // 不正なエンコードはそのまま使う
  }
  return path;
}

export function normalizePaths(csv) {
  return (csv || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.startsWith('http') ? toPath(s) : s.replace(/\/+$/, '') || '/'))
    .filter(Boolean);
}

export function parseDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) throw new Error(`日付は YYYY-MM-DD で指定してください: ${s}`);
  return Date.UTC(Number(s.slice(0, 4)), Number(s.slice(5, 7)) - 1, Number(s.slice(8, 10)));
}

export function formatDate(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(date, n) {
  return formatDate(parseDate(date) + n * DAY_MS);
}

export function parsePeriod(spec) {
  const [start, end] = (spec || '').split(':');
  parseDate(start);
  parseDate(end);
  if (parseDate(end) < parseDate(start)) throw new Error(`期間の終了が開始より前です: ${spec}`);
  return [start, end];
}

export function periodDays([start, end]) {
  return Math.round((parseDate(end) - parseDate(start)) / DAY_MS) + 1;
}

/** 本番反映日 → 反映前日までの 28 日と、反映翌日からの 28 日（反映日そのものは混ざるので使わない） */
export function periodsFromRelease(release, days = 28) {
  return {
    before: [addDays(release, -days), addDays(release, -1)],
    after: [addDays(release, 1), addDays(release, days)],
  };
}

export function aggregate(rows) {
  const impressions = rows.reduce((s, r) => s + r.impressions, 0);
  const clicks = rows.reduce((s, r) => s + r.clicks, 0);
  return {
    clicks,
    impressions,
    ctr_pct: impressions ? round((clicks / impressions) * 100, 2) : null,
    position: impressions ? round(rows.reduce((s, r) => s + r.position * r.impressions, 0) / impressions, 1) : null,
  };
}

function round(n, digits) {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

export function ratio(after, before) {
  return before ? round(after / before, 2) : null;
}

/** 1 日あたりに直した after / before。期間の長さが違っても比べられるようにする */
export function change(before, after, beforeDays, afterDays) {
  return {
    imp_ratio: ratio(after.impressions / afterDays, before.impressions / beforeDays),
    clicks_ratio: ratio(after.clicks / afterDays, before.clicks / beforeDays),
  };
}

/** 線形補間の分位点（ソート済みでなくてよい） */
export function quantile(values, q) {
  const v = [...values].sort((a, b) => a - b);
  if (!v.length) return null;
  const pos = (v.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return round(v[lo] + (v[hi] - v[lo]) * (pos - lo), 2);
}

export function band(position) {
  const pos = Math.round(position);
  for (const [lo, hi] of POSITION_BANDS) if (pos >= lo && pos <= hi) return `${lo}-${hi}`;
  return '21+';
}

function lagWarning(end, today = formatDate(Date.now() + 9 * 3600000)) {
  const days = (parseDate(today) - parseDate(end)) / DAY_MS;
  return days < GSC_LAG_DAYS ? `終了日 ${end} は ${GSC_LAG_DAYS} 日以内。GSC の値が未確定なので判定に使わない` : null;
}

/**
 * 施策の前後比較。rows は page 軸（query×page を足すと匿名化された語が抜けて小さく出るため）。
 * established は before の最初の 7 日に表示のあったパス。公開直後のページは何もしなくても伸びるので対照から外す。
 * @param {{ before: string[], after: string[], pageRows: any, established: Set<string>, targets: string[],
 *   controlPrefix?: string, exclude?: string[], queries?: string[], qpRows?: any }} opts
 * @returns {any}
 */
export function buildCompare({ before, after, pageRows, established, targets, controlPrefix, exclude = [], queries = [], qpRows }) {
  const bd = periodDays(before);
  const ad = periodDays(after);
  const pick = (name, pred) => aggregate(pageRows[name].filter((r) => pred(r.path)));
  const result = {
    before: before.join(':'),
    after: after.join(':'),
    days: { before: bd, after: ad },
    note: 'imp_ratio・clicks_ratio は 1 日あたりの after / before。net は対象の比 ÷ 対照の比',
  };
  const warnings = [lagWarning(after[1])];
  if (bd !== ad || bd % 7) warnings.push('前後の日数が違う、または 7 の倍数でない。曜日の偏りが乗るので参考値');

  result.targets = targets.map((t) => {
    const b = pick('before', (p) => p === t);
    const a = pick('after', (p) => p === t);
    return { page: t, before: b, after: a, ...change(b, a, bd, ad) };
  });
  const tb = pick('before', (p) => targets.includes(p));
  const ta = pick('after', (p) => targets.includes(p));
  result.target_total = { before: tb, after: ta, ...change(tb, ta, bd, ad) };

  if (controlPrefix) {
    const excluded = new Set([...targets, ...exclude]);
    const controlPaths = new Set([...established].filter((p) => p.startsWith(controlPrefix) && !excluded.has(p)));
    const cb = pick('before', (p) => controlPaths.has(p));
    const ca = pick('after', (p) => controlPaths.has(p));
    const control = { prefix: controlPrefix, pages: controlPaths.size, before: cb, after: ca, ...change(cb, ca, bd, ad) };
    if (controlPaths.size < CONTROL_MIN_PAGES || cb.impressions < CONTROL_MIN_IMP) {
      warnings.push(`対照が ${CONTROL_MIN_PAGES} ページ未満、または ${CONTROL_MIN_IMP} imp 未満。対照比は判定に使わない`);
    }
    result.control = control;
    for (const entry of [...result.targets, result.target_total]) {
      // 基準が 0 のページ（新規ページ等）は比が出せない。0 と返すと激減に読めるので null
      entry.net = {
        imp: entry.imp_ratio == null ? null : ratio(entry.imp_ratio, control.imp_ratio),
        clicks: entry.clicks_ratio == null ? null : ratio(entry.clicks_ratio, control.clicks_ratio),
      };
    }
  }

  if (queries.length && qpRows) {
    result.queries = queries.map((q) => {
      const entry = { query: q };
      for (const name of ['before', 'after']) {
        entry[name] = aggregate(qpRows[name].filter((r) => r.query === q && targets.includes(r.path)));
      }
      const others = qpRows.after
        .filter((r) => r.query === q && r.impressions > 0 && !targets.includes(r.path))
        .sort((x, y) => y.impressions - x.impressions)
        .slice(0, 3);
      if (others.length) {
        entry.other_pages_after = others.map((r) => ({ page: r.path, impressions: r.impressions, position: round(r.position, 1) }));
      }
      return entry;
    });
  }
  const shown = warnings.filter(Boolean);
  if (shown.length) result.warnings = shown;
  return result;
}

/**
 * 何もしていないページの 28 日どうしのぶれ。対照比のしきい値を決めるために使う。
 * net は「そのページの比 ÷ 同じ群の他のページを合わせた比」（自分を対照に入れない）。
 * @param {{ before: string[], after: string[], pageRows: any, established: Set<string>, prefix: string,
 *   exclude?: string[], minImp?: number, minClicks?: number }} opts
 * @returns {any}
 */
export function buildNoise({ before, after, pageRows, established, prefix, exclude = [], minImp = 100, minClicks = 20 }) {
  const bd = periodDays(before);
  const ad = periodDays(after);
  const excluded = new Set(exclude);
  const byPath = (rows) => {
    const m = new Map();
    for (const r of rows) {
      if (!r.path.startsWith(prefix) || excluded.has(r.path) || !established.has(r.path)) continue;
      const cur = m.get(r.path) || { impressions: 0, clicks: 0 };
      cur.impressions += r.impressions;
      cur.clicks += r.clicks;
      m.set(r.path, cur);
    }
    return m;
  };
  const b = byPath(pageRows.before);
  const a = byPath(pageRows.after);
  const group = [...b.keys()];
  const total = (side, key) => group.reduce((s, p) => s + (side.get(p)?.[key] || 0), 0);
  const totals = {
    impressions: { b: total(b, 'impressions'), a: total(a, 'impressions') },
    clicks: { b: total(b, 'clicks'), a: total(a, 'clicks') },
  };
  // own / rest。rest は同じ群の自分以外を合わせたもの（gsc-compare の対照と同じ作り）
  const netOf = (key, pb, pa) => {
    const own = ratio(pa / ad, pb / bd);
    const rest = ratio((totals[key].a - pa) / ad, (totals[key].b - pb) / bd);
    return { own, net: own != null && rest ? ratio(own, rest) : null };
  };
  const pages = group
    .filter((p) => b.get(p).impressions >= minImp)
    .map((p) => {
      const pb = b.get(p);
      const pa = a.get(p) || { impressions: 0, clicks: 0 };
      const imp = netOf('impressions', pb.impressions, pa.impressions);
      const item = { page: p, before_imp: pb.impressions, after_imp: pa.impressions, imp_ratio: imp.own, net: imp.net };
      // クリックは少ないページだと 1〜2 回で比が倍になるので、基準期間に minClicks 以上あるページだけ
      if (pb.clicks >= minClicks) {
        const c = netOf('clicks', pb.clicks, pa.clicks);
        Object.assign(item, { before_clicks: pb.clicks, after_clicks: pa.clicks, clicks_ratio: c.own, clicks_net: c.net });
      }
      return item;
    })
    .sort((x, y) => y.before_imp - x.before_imp);
  const summarize = (key) => {
    const vals = pages.map((p) => p[key]).filter((v) => v != null);
    return {
      n: vals.length,
      p10: quantile(vals, 0.1),
      p25: quantile(vals, 0.25),
      p50: quantile(vals, 0.5),
      p75: quantile(vals, 0.75),
      p90: quantile(vals, 0.9),
    };
  };
  return {
    before: before.join(':'),
    after: after.join(':'),
    prefix,
    min_imp: minImp,
    min_clicks: minClicks,
    group: {
      pages: group.length,
      ...change({ impressions: totals.impressions.b, clicks: totals.clicks.b }, { impressions: totals.impressions.a, clicks: totals.clicks.a }, bd, ad),
    },
    imp_ratio: summarize('imp_ratio'),
    net: summarize('net'),
    clicks_net: summarize('clicks_net'),
    pages,
  };
}

/**
 * 次の施策の候補。指名と施設ページを除き、4〜20 位にいる表示の多いページ順
 * @param {{ qpRows: any[], pageRows: any[], exclude?: string[], top?: number, minImp?: number }} opts
 * @returns {any}
 */
export function buildOpps({ qpRows, pageRows, exclude = [], top = 10, minImp = 50 }) {
  const excluded = new Set(exclude);
  // 施設ページは施設名検索が中心で、公式サイトと予約サイトが上にいる。打ち手が違うので候補に入れない
  const generic = qpRows.filter(
    (r) => !r.path.startsWith('/facilities/') && !BRAND_TERMS.some((t) => r.query.toLowerCase().includes(t)),
  );
  const bandOrder = [...POSITION_BANDS.map(([lo, hi]) => `${lo}-${hi}`), '21+'];
  const ctrCurve = {};
  for (const b of bandOrder) {
    const rows = generic.filter((r) => r.impressions > 0 && band(r.position) === b);
    if (!rows.length) continue;
    const agg = aggregate(rows);
    // 表示が少ない帯の CTR は数クリックで大きく振れる
    ctrCurve[b] = { ...agg, reliable: agg.impressions >= 1000 };
  }
  const pageTotals = new Map();
  for (const r of pageRows) {
    const cur = pageTotals.get(r.path) || [];
    cur.push(r);
    pageTotals.set(r.path, cur);
  }
  const byPage = new Map();
  for (const r of generic) {
    const pos = Math.round(r.position);
    if (excluded.has(r.path) || pos < 4 || pos > 20) continue;
    const cur = byPage.get(r.path) || [];
    cur.push(r);
    byPage.set(r.path, cur);
  }
  const candidates = [];
  for (const [path, rows] of byPage) {
    const reach = rows.reduce((s, r) => s + r.impressions, 0);
    if (reach < minImp) continue;
    const queries = [...rows]
      .sort((x, y) => y.impressions - x.impressions)
      .slice(0, 5)
      .map((q) => {
        const b = band(q.position);
        const item = { query: q.query, impressions: q.impressions, clicks: q.clicks, position: round(q.position, 1), band: b, lever: BAND_LEVERS[b] };
        if (Math.round(q.position) <= 10 && q.impressions >= 30 && q.clicks === 0) {
          item.flag = '10 位以内で 0 クリック。検索意図のずれを疑い、打ち手の前に検索結果を見る';
        }
        return item;
      });
    candidates.push({ page: path, reach_imp: reach, page_total: aggregate(pageTotals.get(path) || []), queries });
  }
  candidates.sort((x, y) => y.reach_imp - x.reach_imp);
  return {
    note: 'reach_imp = 指名を除く語のうち 4〜20 位にいる表示回数（匿名化された語は含まない）',
    ctr_curve: ctrCurve,
    excluded: [...excluded].sort(),
    candidates: candidates.slice(0, top),
  };
}

// ---- API ----

function b64url(buf) {
  return Buffer.from(buf).toString('base64url');
}

async function getToken() {
  const keyFile = process.env.GA4_KEY_FILE || join(homedir(), '.secrets/mcp-keys/ga4-mcp-key.json');
  const key = JSON.parse(readFileSync(keyFile, 'utf8'));
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(
    JSON.stringify({
      iss: key.client_email,
      scope: 'https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/webmasters.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    }),
  );
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${claim}`);
  const jwt = `${header}.${claim}.${b64url(signer.sign(key.private_key))}`;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`トークン取得失敗 ${res.status}: ${JSON.stringify(body)}`);
  return body.access_token;
}

async function api(token, method, url, body) {
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${url}: ${JSON.stringify(json)}`);
  return json;
}

const gscUrl = (path) => `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/${path}`;

/** searchAnalytics を全件取る（25,000 行ずつ）。toPath で null になる行は落とす */
async function gscRows(token, [start, end], dimensions, filters = []) {
  const rows = [];
  for (let startRow = 0; ; startRow += 25000) {
    const res = await api(token, 'POST', gscUrl('searchAnalytics/query'), {
      startDate: start,
      endDate: end,
      dimensions,
      rowLimit: 25000,
      startRow,
      type: 'web',
      ...(filters.length ? { dimensionFilterGroups: [{ filters }] } : {}),
    });
    for (const r of res.rows || []) {
      const item = Object.fromEntries(dimensions.map((d, i) => [d, r.keys[i]]));
      if (item.page !== undefined) {
        item.path = toPath(item.page);
        if (item.path === null) {
          // `#` 付き（サイトリンク）は imp を足すと本体と二重になるので 0 にし、クリックだけ本体のパスに寄せる
          const base = item.page.includes('#') ? toPath(item.page.split('#')[0]) : null;
          if (base === null) continue;
          rows.push({ ...item, path: base, clicks: r.clicks, impressions: 0, position: 0 });
          continue;
        }
      }
      rows.push({ ...item, clicks: r.clicks, impressions: r.impressions, position: r.position });
    }
    if (!res.rows || res.rows.length < 25000) return rows;
  }
}

async function establishedPaths(token, before) {
  const firstWeek = [before[0], addDays(before[0], 6)];
  return new Set((await gscRows(token, firstWeek, ['page'])).map((r) => r.path));
}

// ---- サブコマンド ----

function parseArgs(argv) {
  const [cmd, ...rest] = argv;
  const args = { cmd };
  for (let i = 0; i < rest.length; i++) {
    if (!rest[i].startsWith('--')) throw new Error(`不明な引数: ${rest[i]}`);
    const key = rest[i].slice(2);
    const next = rest[i + 1];
    if (next === undefined || next.startsWith('--')) args[key] = true;
    else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

function periodsFromArgs(args) {
  if (args.release) return periodsFromRelease(args.release, Number(args.days || 28));
  if (!args.before || !args.after) throw new Error('--release か、--before と --after の両方を指定してください');
  return { before: parsePeriod(args.before), after: parsePeriod(args.after) };
}

const commands = {
  async check(args, token) {
    const ga4 = await api(token, 'GET', `https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}/metadata`)
      .then(() => 'OK')
      .catch((e) => `DENIED: ${e.message}`);
    const sites = await api(token, 'GET', 'https://www.googleapis.com/webmasters/v3/sites').catch((e) => ({ error: e.message }));
    return { ga4: { property: PROPERTY_ID, status: ga4 }, gsc_sites: sites };
  },

  async gsc(args, token) {
    const dims = (args.dimensions || 'query').split(',').filter(Boolean);
    const filters = [];
    if (args['query-regex']) filters.push({ dimension: 'query', operator: 'includingRegex', expression: args['query-regex'] });
    if (args['page-regex']) filters.push({ dimension: 'page', operator: 'includingRegex', expression: args['page-regex'] });
    const rows = await gscRows(token, parsePeriod(`${args.start}:${args.end}`), dims, filters);
    // 日別は時系列で読むので日付順、それ以外は表示の多い順
    if (dims.includes('date')) rows.sort((a, b) => a.date.localeCompare(b.date));
    else rows.sort((a, b) => b.impressions - a.impressions);
    const limit = Number(args['row-limit'] || 50);
    return { total: aggregate(rows), rows: rows.slice(0, limit).map((r) => ({ ...r, ctr_pct: r.impressions ? round((r.clicks / r.impressions) * 100, 2) : null, position: round(r.position, 1) })), warning: lagWarning(args.end) || undefined };
  },

  async 'gsc-compare'(args, token) {
    const { before, after } = periodsFromArgs(args);
    const targets = normalizePaths(args.pages);
    if (!targets.length) throw new Error('--pages を指定してください');
    const pageRows = { before: await gscRows(token, before, ['page']), after: await gscRows(token, after, ['page']) };
    const established = args['control-prefix'] ? await establishedPaths(token, before) : new Set();
    const queries = (args.queries || '').split(',').map((q) => q.trim()).filter(Boolean);
    const qpRows = queries.length
      ? { before: await gscRows(token, before, ['query', 'page']), after: await gscRows(token, after, ['query', 'page']) }
      : null;
    return buildCompare({ before, after, pageRows, established, targets, controlPrefix: args['control-prefix'], exclude: normalizePaths(args.exclude), queries, qpRows });
  },

  async 'gsc-noise'(args, token) {
    const { before, after } = periodsFromArgs(args);
    if (!args.prefix) throw new Error('--prefix を指定してください（例: /area/）');
    const pageRows = { before: await gscRows(token, before, ['page']), after: await gscRows(token, after, ['page']) };
    const established = await establishedPaths(token, before);
    return buildNoise({ before, after, pageRows, established, prefix: args.prefix, exclude: normalizePaths(args.exclude), minImp: Number(args['min-imp'] || 100), minClicks: Number(args['min-clicks'] || 20) });
  },

  async 'gsc-opps'(args, token) {
    const period = parsePeriod(`${args.start}:${args.end}`);
    const result = buildOpps({
      qpRows: await gscRows(token, period, ['query', 'page']),
      pageRows: await gscRows(token, period, ['page']),
      exclude: normalizePaths(args.exclude),
      top: Number(args.top || 10),
      minImp: Number(args['min-imp'] || 50),
    });
    return { period: period.join(':'), ...result, warning: lagWarning(period[1]) || undefined };
  },

  async inspect(args, token) {
    const results = [];
    for (const raw of normalizePaths(args.urls)) {
      const url = `https://www.saunako.jp${raw === '/' ? '/' : raw}`;
      try {
        const res = await api(token, 'POST', 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
          inspectionUrl: url,
          siteUrl: SITE,
          languageCode: 'ja',
        });
        const idx = res.inspectionResult?.indexStatusResult || {};
        const item = {
          url,
          verdict: idx.verdict,
          coverageState: idx.coverageState,
          lastCrawlTime: idx.lastCrawlTime,
          googleCanonical: idx.googleCanonical,
          userCanonical: idx.userCanonical,
        };
        if (idx.googleCanonical && idx.userCanonical && idx.googleCanonical !== idx.userCanonical) item.canonical_mismatch = true;
        results.push(item);
      } catch (e) {
        results.push({ url, error: e.message });
      }
    }
    return { results };
  },

  async ga4(args, token) {
    const body = {
      dateRanges: [{ startDate: args.start, endDate: args.end }],
      dimensions: (args.dimensions || '').split(',').filter(Boolean).map((name) => ({ name })),
      metrics: (args.metrics || '').split(',').filter(Boolean).map((name) => ({ name })),
      limit: Number(args.limit || 100),
    };
    if (args['order-metric']) body.orderBys = [{ desc: true, metric: { metricName: args['order-metric'] } }];
    if (args['filter-dimension'] && args['filter-value']) {
      body.dimensionFilter = { filter: { fieldName: args['filter-dimension'], stringFilter: { value: args['filter-value'] } } };
    }
    const res = await api(token, 'POST', `https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runReport`, body);
    const dims = (res.dimensionHeaders || []).map((h) => h.name);
    const mets = (res.metricHeaders || []).map((h) => h.name);
    return {
      rowCount: res.rowCount || 0,
      rows: (res.rows || []).map((r) => ({
        ...Object.fromEntries(dims.map((d, i) => [d, r.dimensionValues[i].value])),
        ...Object.fromEntries(mets.map((m, i) => [m, Number(r.metricValues[i].value)])),
      })),
    };
  },
};

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const run = commands[args.cmd];
  if (!run) {
    console.error(`使い方: node scripts/seo-analytics.mjs <${Object.keys(commands).join('|')}> [--オプション]（詳細はファイル先頭）`);
    process.exit(1);
  }
  const token = await getToken();
  console.log(JSON.stringify(await run(args, token), null, 2));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((e) => {
    console.log(JSON.stringify({ error: e.message }, null, 2));
    process.exit(1);
  });
}
