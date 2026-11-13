/**
 * Cloudflare 配信用のファイルをビルド前に作る（`npm run build` の prebuild から呼ばれる）。
 *
 * - public/_redirects: 恒久リダイレクト。静的ファイルより先に評価されるので、ページが残っていても転送が勝つ
 *   （Vercel 時代に next.config.ts の redirects() でやっていたことの置き換え。静的書き出しでは redirects() が効かない）
 * - worker/generated/go-targets.json: /go/{id} の転送先（worker/index.ts が読む）
 *
 * どちらも facilities.json から作るので .gitignore 済み。
 *
 * Usage: node scripts/generate-edge-files.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const facilities = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "facilities.json"), "utf-8"));

// Cloudflare の _redirects の上限（静的ルール）。超えると超過分が黙って無視される
const MAX_STATIC_REDIRECTS = 2000;

/** @type {[string, string][]} [source, destination] */
const rules = [];
const r = (source, destination) => rules.push([source, destination]);

// 掲載を終了した施設 → エリア一覧へ。slug 側より先に置く（_redirects は上から最初に一致したものを使う）
// 2026-09-30: hotel hisoca ikebukuro は宿泊者専用のため掲載基準外
r("/facilities/73", "/area/tokyo/ikebukuro");
r("/facilities/hotel-hisoca-ikebukuro", "/area/tokyo/ikebukuro");
// 2026-11-03: HOTEL HOQA 花色の湯はサウナ付き客室の時間貸し（予約不可・来店時の空室利用）で掲載基準外
r("/facilities/149", "/area/aichi");
r("/facilities/hotel-hoqa-hanaironoyu", "/area/aichi");
// 2026-10-04: Private Sauna 浅海店は P・SPO24 会員限定の予約制になり、検索から来た人がすぐ使えないため掲載終了
r("/facilities/360", "/area/ehime/matsuyama");
r("/facilities/pspo-asanami", "/area/ehime/matsuyama");
// 2026-10-04: ていれぎテントサウナ 湯婀はテントサウナ主体で掲載基準外（公式の予約URLも無効）のため掲載終了
r("/facilities/361", "/area/ehime/matsuyama");
r("/facilities/teiregi-tent-sauna-yua", "/area/ehime/matsuyama");

// 旧比較ページ → 候補ページ（?ids= は引き継がれ、/pick がそのまま読む）
r("/compare", "/pick");

// 施設の slug → 数値 ID。日本語 slug はリクエストのパスが percent-encode されて届くので、その形で書く
for (const f of facilities) {
  const source = `/facilities/${encodeURIComponent(f.slug)}`;
  if (rules.some(([s]) => s === source)) continue;
  r(source, `/facilities/${f.id}`);
}

// 旧エリアslug → 新エリアslug（#161 サブエリア再定義）
const area = (pref, oldSlug, newSlug) => r(`/area/${pref}/${oldSlug}`, newSlug ? `/area/${pref}/${newSlug}` : `/area/${pref}`);
// 東京: 分割されたエリア → 県ページへ
area("tokyo", "shinjuku-minato", null);
area("tokyo", "shibuya-setagaya", null);
// 長野: slug変更
area("nagano", "nagano-city", "nagano-shinano");
area("nagano", "matsumoto", "matsumoto-tateshina");
area("nagano", "tateshina", "matsumoto-tateshina");
area("nagano", "ueda", "ueda-bessho");
area("nagano", "other", null);
// 愛知: slug変更
area("aichi", "nagoya", "nagoya-sakae");
area("aichi", "other", null);
// 静岡: slug変更
area("shizuoka", "fuji", "fuji-gotemba");
area("shizuoka", "hamamatsu", "hamamatsu-kakegawa");
area("shizuoka", "numazu", "hamamatsu-kakegawa");
// 福岡: slug変更
area("fukuoka", "kitakyushu", "chikuho-kitakyushu");
area("fukuoka", "other", null);
// 栃木: slug変更
area("tochigi", "utsunomiya", "utsunomiya-oyama");
area("tochigi", "nasu", "nasu-shiobara");
area("tochigi", "nikko", "nikko-kenoh");
area("tochigi", "other", null);
// 福島: slug変更
area("fukushima", "aizu", "aizu-hamadori");
// 大阪: その他のslug変更
area("osaka", "other", "yao-hirakata");
// 群馬: 統合・slug変更
area("gunma", "takasaki", "takasaki-maebashi");
area("gunma", "maebashi", "takasaki-maebashi");
area("gunma", "other", "kanra");
// 北海道: サブエリア廃止 → 県ページへ
for (const s of ["sapporo", "douo", "donan", "dohoku", "dotou"]) area("hokkaido", s, null);
// 宮城: サブエリア廃止
for (const s of ["sendai", "other"]) area("miyagi", s, null);
// 京都: サブエリア廃止
for (const s of ["kyoto-city", "other"]) area("kyoto", s, null);
// 新潟: サブエリア廃止
for (const s of ["niigata-city", "nagaoka", "kashiwazaki", "murakami", "other"]) area("niigata", s, null);

if (rules.length > MAX_STATIC_REDIRECTS) {
  throw new Error(`_redirects が ${rules.length} 件で上限 ${MAX_STATIC_REDIRECTS} を超える。超過分は Cloudflare に無視される`);
}

const redirects = [
  "# scripts/generate-edge-files.mjs が生成（手で編集しない）",
  ...rules.map(([s, d]) => `${s} ${d} 308`),
  "",
].join("\n");
fs.writeFileSync(path.join(ROOT, "public", "_redirects"), redirects);

// /go/{id} の転送先。閉店施設も公式サイトへは送る（記事内のカードなど閉店後もリンクが残るため）
const goTargets = {};
for (const f of facilities) {
  if (f.website || f.bookingUrl) goTargets[f.id] = { w: f.website || null, b: f.bookingUrl || null };
}
const outDir = path.join(ROOT, "worker", "generated");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "go-targets.json"), JSON.stringify(goTargets));

console.log(`edge files: _redirects ${rules.length} rules, go-targets ${Object.keys(goTargets).length} facilities`);
