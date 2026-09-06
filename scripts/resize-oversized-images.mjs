/**
 * 過大な施設画像をリサイズするスクリプト
 *
 * 施設画像は最大でも詳細ページのギャラリー表示（実質1600px相当）までしか使わないが、
 * 取り込み時にリサイズしていなかったため原寸（最大6273px）のまま配信されていた。
 * カード表示は幅400px程度なので、モバイルのLCPに直撃する。
 *
 * Usage:
 *   node scripts/resize-oversized-images.mjs --dry-run   # 対象の確認のみ
 *   node scripts/resize-oversized-images.mjs             # 実行
 *
 * 冪等: 既に MAX_WIDTH 以下の画像はスキップするため、何度実行しても安全。
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIR = path.join(ROOT, "public", "facilities");

// 詳細ページのギャラリーが最大表示するサイズ。Retina を考慮しても 1600px あれば足りる。
const MAX_WIDTH = 1600;
const QUALITY = 80;

const dryRun = process.argv.includes("--dry-run");

function fmtKB(bytes) {
  return `${(bytes / 1024).toFixed(0)}KB`;
}

const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".webp"));

const targets = [];
for (const f of files) {
  const p = path.join(DIR, f);
  const { size } = fs.statSync(p);
  const meta = await sharp(p).metadata();
  if (meta.width > MAX_WIDTH) {
    targets.push({ f, p, size, w: meta.width, h: meta.height });
  }
}

targets.sort((a, b) => b.size - a.size);

const totalBefore = targets.reduce((s, t) => s + t.size, 0);
console.log(`対象: ${targets.length}枚 / 全${files.length}枚`);
console.log(`現在の合計: ${(totalBefore / 1048576).toFixed(1)} MB`);
console.log(`リサイズ後の最大幅: ${MAX_WIDTH}px\n`);

if (targets.length === 0) {
  console.log("リサイズが必要な画像はありません。");
  process.exit(0);
}

if (dryRun) {
  for (const t of targets) {
    console.log(`  ${fmtKB(t.size).padStart(7)} ${String(t.w).padStart(5)}x${String(t.h).padEnd(5)} ${t.f}`);
  }
  console.log("\n--dry-run のため変更していません。");
  process.exit(0);
}

let totalAfter = 0;
for (const t of targets) {
  // 一時ファイルに書いてから置き換える（同一ファイルへの読み書き競合を避ける）
  const tmp = t.p + ".tmp";
  await sharp(t.p)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(tmp);

  const after = fs.statSync(tmp).size;

  // 稀に元より大きくなる場合は元を残す
  if (after >= t.size) {
    fs.unlinkSync(tmp);
    totalAfter += t.size;
    console.log(`  SKIP ${t.f}（リサイズ後の方が大きい）`);
    continue;
  }

  fs.renameSync(tmp, t.p);
  totalAfter += after;
  const pct = (((t.size - after) / t.size) * 100).toFixed(0);
  console.log(`  ${fmtKB(t.size).padStart(7)} -> ${fmtKB(after).padStart(7)} (-${pct}%) ${t.f}`);
}

console.log(`\n合計: ${(totalBefore / 1048576).toFixed(1)} MB -> ${(totalAfter / 1048576).toFixed(1)} MB`);
console.log(`削減: ${((totalBefore - totalAfter) / 1048576).toFixed(1)} MB`);
