/**
 * 施設画像をダウンロードしてWebPに変換し、facilities.jsonを更新するスクリプト
 *
 * Usage: node scripts/download-images.mjs
 * Requires: npm install -D sharp
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const FACILITIES_JSON = path.join(ROOT, "data", "facilities.json");
const OUTPUT_DIR = path.join(ROOT, "public", "facilities");

const QUALITY = 80;
const CONCURRENCY = 2;
const TIMEOUT_MS = 60000;

async function downloadImage(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/webp,image/avif,image/apng,image/*,*/*;q=0.8",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  } finally {
    clearTimeout(timer);
  }
}

async function convertToWebP(buffer, outputPath) {
  await sharp(buffer).webp({ quality: QUALITY }).toFile(outputPath);
}

async function processImage(facilityId, index, url) {
  const filename = `${facilityId}-${index}.webp`;
  const outputPath = path.join(OUTPUT_DIR, filename);
  const localPath = `/facilities/${filename}`;

  try {
    const buffer = await downloadImage(url);
    await convertToWebP(buffer, outputPath);
    const stats = fs.statSync(outputPath);
    console.log(`  ✓ ${filename} (${(stats.size / 1024).toFixed(0)}KB)`);
    return localPath;
  } catch (err) {
    console.error(`  ✗ ${filename} FAILED: ${err.message} (${url})`);
    return null;
  }
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const facilities = JSON.parse(fs.readFileSync(FACILITIES_JSON, "utf-8"));
  console.log(`Processing ${facilities.length} facilities...\n`);

  let successCount = 0;
  let failCount = 0;
  const failed = [];

  // Build all tasks
  const allTasks = [];
  for (const facility of facilities) {
    if (!facility.images || facility.images.length === 0) continue;

    for (let i = 0; i < facility.images.length; i++) {
      const url = facility.images[i];
      // Skip already-local images
      if (url.startsWith("/")) continue;

      allTasks.push({
        facilityId: facility.id,
        index: i,
        url,
        facility,
      });
    }
  }

  console.log(`Found ${allTasks.length} images to download.\n`);

  // Process in batches
  for (let i = 0; i < allTasks.length; i += CONCURRENCY) {
    const batch = allTasks.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(async (task) => {
        const localPath = await processImage(
          task.facilityId,
          task.index,
          task.url
        );
        return { ...task, localPath };
      })
    );

    for (const result of results) {
      if (result.localPath) {
        result.facility.images[result.index] = result.localPath;
        successCount++;
      } else {
        failCount++;
        failed.push({
          id: result.facilityId,
          url: result.url,
        });
      }
    }
  }

  // Write updated facilities.json
  fs.writeFileSync(FACILITIES_JSON, JSON.stringify(facilities, null, 2) + "\n");

  console.log(`\n--- Summary ---`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  if (failed.length > 0) {
    console.log(`\nFailed images:`);
    for (const f of failed) {
      console.log(`  id=${f.id}: ${f.url}`);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
