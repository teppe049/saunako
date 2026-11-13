/**
 * /pick/[ids]/og（候補共有の OG 画像）に埋め込む施設写真の JPEG サムネイルを作る。
 *
 * OG 画像の描画系（next/og）は webp をデコードできず、Cloudflare Workers では sharp も動かないため、
 * 変換はビルド前にここで済ませ、ランタイムは public/og-thumbs/ の JPEG を読むだけにする。
 * 生成物は .gitignore 済み。`npm run build` の prebuild から呼ばれる。
 *
 * Usage: node scripts/generate-og-thumbs.mjs [--force]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FACILITIES_JSON = path.join(ROOT, "data", "facilities.json");
const PUBLIC_DIR = path.join(ROOT, "public");
const OUTPUT_DIR = path.join(PUBLIC_DIR, "og-thumbs");

// OG 画像（1200x630）を最大4列に割ったときの1列ぶん。2列時の表示幅（約592px）を満たす
const WIDTH = 600;
const HEIGHT = 520;
const QUALITY = 78;
const CONCURRENCY = 8;

const force = process.argv.includes("--force");

/** src/lib/ogThumb.ts の ogThumbPath と同じ規則 */
function thumbPathFor(image) {
  return `/og-thumbs/${path.basename(image).replace(/\.[^.]+$/, "")}.jpg`;
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const facilities = JSON.parse(fs.readFileSync(FACILITIES_JSON, "utf-8"));
  const sources = [...new Set(facilities.map((f) => f.images?.[0]).filter(Boolean))];

  let made = 0;
  let skipped = 0;
  const failed = [];

  const queue = [...sources];
  async function worker() {
    for (let image = queue.shift(); image; image = queue.shift()) {
      const src = path.join(PUBLIC_DIR, image.replace(/^\//, ""));
      const dest = path.join(PUBLIC_DIR, thumbPathFor(image).replace(/^\//, ""));
      try {
        if (!force && fs.existsSync(dest) && fs.statSync(dest).mtimeMs >= fs.statSync(src).mtimeMs) {
          skipped++;
          continue;
        }
        await sharp(src).resize({ width: WIDTH, height: HEIGHT, fit: "cover" }).jpeg({ quality: QUALITY }).toFile(dest);
        made++;
      } catch (err) {
        failed.push(`${image}: ${err.message}`);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  console.log(`og-thumbs: ${made} generated, ${skipped} up to date, ${failed.length} failed`);
  // 1枚欠けても OG 画像はグレーの枠で出るだけなので、ビルドは止めない
  for (const f of failed) console.warn(`  ✗ ${f}`);
}

main();
