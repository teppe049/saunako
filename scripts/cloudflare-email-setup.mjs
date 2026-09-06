/**
 * Cloudflare Email Routing をAPI経由で設定する
 *
 * 認証:
 *   .env.cloudflare に SAUNAKO_CF_API_TOKEN=... を置く（.env* はgitignore済み）
 *   環境変数 CLOUDFLARE_API_TOKEN は SaunaTrip本番用なので**使わない**。
 *
 * 必要なトークン権限（トークン作成画面の表記）:
 *   - Account : Email Routing Addresses : Edit  （転送先の登録）
 *   - Zone    : Email Routing Rules     : Edit  （ルール作成・有効化）
 *   - Zone    : Zone                    : Read  （ゾーンIDの解決）
 *   Zone Resources は saunako.jp のみ、Account Resources は個人アカウントのみに限定する。
 *   ※ enable でDNS(MX/SPF)が自動追加されるが、Email Routing Rules:Edit の範囲で足りる
 *     （権限不足なら 9109 や 10000 系のエラーが出るので、その時に追加する）
 *
 * Usage:
 *   node scripts/cloudflare-email-setup.mjs status      # 現状確認のみ（無害）
 *   node scripts/cloudflare-email-setup.mjs add-dest    # 転送先Gmailを登録（確認メールが飛ぶ）
 *   node scripts/cloudflare-email-setup.mjs enable      # Email Routingを有効化（MX/SPFが入る）
 *   node scripts/cloudflare-email-setup.mjs add-rules   # info@ / owners@ のルールを作成
 *
 * 破壊的な操作はしない。削除系のコマンドは意図的に実装していない。
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const ZONE_NAME = "saunako.jp";
const DESTINATION = "konnichihunting@gmail.com";
const CUSTOM_ADDRESSES = ["info", "owners"];

// --- token ---------------------------------------------------------------

function loadToken() {
  const envPath = path.join(ROOT, ".env.cloudflare");
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, "utf-8");
    const m = raw.match(/^\s*SAUNAKO_CF_API_TOKEN\s*=\s*(.+)\s*$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  }
  if (process.env.SAUNAKO_CF_API_TOKEN) return process.env.SAUNAKO_CF_API_TOKEN;

  console.error("トークンが見つかりません。");
  console.error("プロジェクト直下に .env.cloudflare を作り、次の1行を書いてください:");
  console.error("  SAUNAKO_CF_API_TOKEN=<個人アカウントで発行したトークン>");
  console.error("");
  console.error("※ 環境変数 CLOUDFLARE_API_TOKEN は SaunaTrip本番用なので使いません。");
  process.exit(1);
}

const TOKEN = loadToken();
const API = "https://api.cloudflare.com/client/v4";

async function cf(method, pathname, body) {
  const res = await fetch(API + pathname, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!json.success) {
    const errs = (json.errors || []).map((e) => `${e.code}: ${e.message}`).join(" / ");
    throw new Error(`${method} ${pathname} -> HTTP ${res.status} ${errs || JSON.stringify(json).slice(0, 200)}`);
  }
  return json.result;
}

// --- helpers -------------------------------------------------------------

async function resolveZone() {
  const zones = await cf("GET", `/zones?name=${ZONE_NAME}`);
  if (!zones.length) {
    throw new Error(`ゾーン ${ZONE_NAME} が見つかりません。トークンのアカウントを確認してください。`);
  }
  const z = zones[0];
  return { zoneId: z.id, accountId: z.account.id, accountName: z.account.name };
}

// --- commands ------------------------------------------------------------

async function cmdStatus() {
  const { zoneId, accountId, accountName } = await resolveZone();
  console.log(`ゾーン   : ${ZONE_NAME} (${zoneId})`);
  console.log(`アカウント: ${accountName} (${accountId})`);
  console.log("");

  const settings = await cf("GET", `/zones/${zoneId}/email/routing`);
  console.log(`Email Routing: enabled=${settings.enabled} status=${settings.status}`);
  console.log("");

  const dests = await cf("GET", `/accounts/${accountId}/email/routing/addresses`);
  console.log(`転送先アドレス: ${dests.length}件`);
  for (const d of dests) {
    // verified は検証済みならタイムスタンプ、未検証なら null が入る
    console.log(`  ${d.email}  verified=${d.verified ? `YES (${d.verified})` : "NO"}`);
  }
  console.log("");

  const rules = await cf("GET", `/zones/${zoneId}/email/routing/rules`);
  console.log(`ルーティングルール: ${rules.length}件`);
  for (const r of rules) {
    const from = (r.matchers || []).map((m) => m.value).join(",");
    const to = (r.actions || []).flatMap((a) => a.value || []).join(",");
    console.log(`  ${r.enabled ? "[有効]" : "[無効]"} ${from} -> ${to}`);
  }

  // catch-all は別エンドポイント
  try {
    const ca = await cf("GET", `/zones/${zoneId}/email/routing/rules/catch_all`);
    console.log("");
    console.log(`Catch-all: enabled=${ca.enabled}（スパム転送を招くため無効が望ましい）`);
  } catch {
    console.log("");
    console.log("Catch-all: 取得できず（未設定の可能性）");
  }
}

async function cmdAddDest() {
  const { accountId } = await resolveZone();
  const existing = await cf("GET", `/accounts/${accountId}/email/routing/addresses`);
  if (existing.some((d) => d.email === DESTINATION)) {
    console.log(`${DESTINATION} は登録済みです。`);
    const d = existing.find((x) => x.email === DESTINATION);
    console.log(`verified=${d.verified ? "YES" : "NO"}`);
    if (!d.verified) {
      console.log("→ Gmailに届く確認メールのリンクをクリックしてください。");
    }
    return;
  }
  const r = await cf("POST", `/accounts/${accountId}/email/routing/addresses`, { email: DESTINATION });
  console.log(`登録しました: ${r.email}`);
  console.log("→ Gmailに確認メールが届きます。リンクをクリックするまで転送は始まりません。");
}

async function cmdEnable() {
  const { zoneId } = await resolveZone();
  const before = await cf("GET", `/zones/${zoneId}/email/routing`);
  if (before.enabled) {
    console.log("既に有効です。");
    return;
  }
  try {
    const r = await cf("POST", `/zones/${zoneId}/email/routing/enable`, {});
    console.log(`有効化しました: enabled=${r.enabled} status=${r.status}`);
    console.log("→ MX / SPF レコードが自動追加されます。");
    console.log("→ zsh scripts/verify-email-routing.sh で確認してください。");
  } catch (e) {
    // enable エンドポイントは Deprecated 扱いのため、将来失敗する可能性がある
    console.error("有効化に失敗しました:", e.message);
    console.error("");
    console.error("このエンドポイントはCloudflareがDeprecatedとしているため、");
    console.error("ダッシュボードから手動で有効化してください:");
    console.error("  https://dash.cloudflare.com/ → saunako.jp → Email Routing");
    process.exit(1);
  }
}

async function cmdAddRules() {
  const { zoneId, accountId } = await resolveZone();

  const dests = await cf("GET", `/accounts/${accountId}/email/routing/addresses`);
  const dest = dests.find((d) => d.email === DESTINATION);
  if (!dest) {
    console.error(`転送先 ${DESTINATION} が未登録です。先に add-dest を実行してください。`);
    process.exit(1);
  }
  if (!dest.verified) {
    console.error(`転送先 ${DESTINATION} が未検証です。Gmailの確認メールのリンクをクリックしてください。`);
    process.exit(1);
  }

  const existing = await cf("GET", `/zones/${zoneId}/email/routing/rules`);

  for (const local of CUSTOM_ADDRESSES) {
    const addr = `${local}@${ZONE_NAME}`;
    const dup = existing.find((r) => (r.matchers || []).some((m) => m.value === addr));
    if (dup) {
      console.log(`スキップ: ${addr} のルールは既に存在します`);
      continue;
    }
    await cf("POST", `/zones/${zoneId}/email/routing/rules`, {
      name: `Forward ${addr}`,
      enabled: true,
      priority: 0,
      matchers: [{ type: "literal", field: "to", value: addr }],
      actions: [{ type: "forward", value: [DESTINATION] }],
    });
    console.log(`作成: ${addr} -> ${DESTINATION}`);
  }
}

// --- main ----------------------------------------------------------------

/** どの権限が足りないかを1件ずつ切り分ける */
async function cmdDoctor() {
  const zones = await cf("GET", `/zones?name=${ZONE_NAME}`);
  if (!zones.length) {
    console.log("  NG    ゾーンが見えない → Zone:Read が無いか、アカウントが違う");
    return;
  }
  const zoneId = zones[0].id;
  const accountId = zones[0].account.id;
  console.log(`ゾーン   : ${ZONE_NAME} (${zoneId})`);
  console.log(`アカウント: ${zones[0].account.name} (${accountId})`);
  console.log("");

  const checks = [
    ["Zone : Zone : Read", `/zones/${zoneId}`],
    ["Zone : DNS : Edit", `/zones/${zoneId}/dns_records?per_page=1`],
    ["Email Routing 設定の取得", `/zones/${zoneId}/email/routing`],
    ["Zone : Email Routing Rules : Edit", `/zones/${zoneId}/email/routing/rules`],
    ["Account : Email Routing Addresses : Edit", `/accounts/${accountId}/email/routing/addresses`],
  ];

  let missing = 0;
  for (const [label, p] of checks) {
    try {
      await cf("GET", p);
      console.log(`  OK    ${label}`);
    } catch (e) {
      missing++;
      console.log(`  NG    ${label}`);
      console.log(`        ${e.message.split("->").pop().trim()}`);
    }
  }

  if (missing) {
    console.log("");
    console.log("不足している権限をトークンに追加してください（作り直し不要・Editで足せる）:");
    console.log("  https://dash.cloudflare.com/profile/api-tokens");
    console.log("");
    console.log("※ Email Routing の設定取得と有効化は MX/SPF を書き込むため");
    console.log("   Zone : DNS : Edit が必須（2026-09-06に実測）");
  }
}

const cmd = process.argv[2];
const commands = {
  status: cmdStatus,
  doctor: cmdDoctor,
  "add-dest": cmdAddDest,
  enable: cmdEnable,
  "add-rules": cmdAddRules,
};

if (!commands[cmd]) {
  console.error("Usage: node scripts/cloudflare-email-setup.mjs <doctor|status|add-dest|enable|add-rules>");
  console.error("  doctor    : どの権限が足りないかを切り分ける");
  console.error("  status    : 現状確認（無害）");
  console.error("  add-dest  : 転送先Gmailを登録（確認メールが飛ぶ）");
  console.error("  enable    : Email Routingを有効化（MX/SPFが入る）");
  console.error("  add-rules : info@ / owners@ のルールを作成");
  process.exit(1);
}

try {
  await commands[cmd]();
} catch (e) {
  console.error("エラー:", e.message);
  process.exit(1);
}
