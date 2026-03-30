#!/usr/bin/env node
/**
 * X (Twitter) 自動投稿スクリプト
 *
 * docs/x-drafts.md から当日分のドラフトを取得し、X API v2 で投稿する。
 * GitHub Actions の cron から実行される想定。
 *
 * Usage:
 *   node scripts/x-auto-post.mjs 午前
 *   node scripts/x-auto-post.mjs 午後
 *   node scripts/x-auto-post.mjs 午前 --dry-run
 *
 * Environment variables:
 *   X_API_KEY, X_API_SECRET_KEY, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { TwitterApi } from "twitter-api-v2";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DRAFTS_PATH = resolve(ROOT, "docs/x-drafts.md");

// --- Args ---
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const slot = args.find((a) => a === "午前" || a === "午後");

if (!slot) {
  console.error("Usage: node scripts/x-auto-post.mjs [午前|午後] [--dry-run]");
  process.exit(1);
}

// JST の今日の日付 (YYYY-MM-DD)
const today = new Date().toLocaleDateString("sv-SE", {
  timeZone: "Asia/Tokyo",
});

console.log(`Date: ${today}, Slot: ${slot}, DryRun: ${dryRun}`);

// --- Phase A: Parse x-drafts.md ---
const drafts = readFileSync(DRAFTS_PATH, "utf-8");

// セクションを --- で分割
const sections = drafts.split(/^---$/m);

let targetSection = null;
let targetHeading = null;

const headingRegex = new RegExp(
  `^## (${today.replace(/-/g, "-")} ${slot} — .+)$`,
  "m"
);

for (const section of sections) {
  if (section.includes("✅投稿済み")) continue;
  const match = section.match(headingRegex);
  if (match) {
    targetHeading = match[1];
    targetSection = section;
    break;
  }
}

if (!targetSection) {
  console.log(`No draft found for ${today} ${slot}. Exiting.`);
  process.exit(0);
}

console.log(`Found draft: ${targetHeading}`);

// コードブロックの中身を抽出
function extractCodeBlock(section, heading) {
  const regex = new RegExp(
    `### ${heading}[^\\n]*\\n\`\`\`\\n([\\s\\S]*?)\`\`\``,
  );
  const m = section.match(regex);
  return m ? m[1].trim() : null;
}

const body = extractCodeBlock(targetSection, "本文");
const reply = extractCodeBlock(targetSection, "リプライ");

// 画像パスを抽出（括弧の説明を除去）
const imageLines = [...targetSection.matchAll(/^- (.+\.webp)/gm)]
  .map((m) => {
    let p = m[1].replace(/（.+?）$/, "").trim();
    // 古いエントリの絶対パスを正規化
    p = p.replace(/^\/Users\/.*?\/saunako\//, "");
    return resolve(ROOT, p);
  })
  .slice(0, 4);

if (!body) {
  console.error("No body text found in draft section");
  process.exit(1);
}

console.log(`Body: ${body.slice(0, 50)}...`);
console.log(`Reply: ${reply ? reply.slice(0, 50) + "..." : "none"}`);
console.log(`Images: ${imageLines.length} files`);

// --- Phase B: Convert images (webp → png) ---
const pngBuffers = [];
for (const imgPath of imageLines) {
  console.log(`Converting: ${imgPath}`);
  const buf = await sharp(imgPath).png().toBuffer();
  pngBuffers.push(buf);
  console.log(`  → ${(buf.length / 1024).toFixed(0)} KB`);
}

if (dryRun) {
  console.log("\n--- DRY RUN: Skipping X API calls ---");
  console.log(`Would post body (${body.length} chars) with ${pngBuffers.length} images`);
  if (reply) console.log(`Would reply (${reply.length} chars)`);
  process.exit(0);
}

// --- Phase C: Post to X API ---
const { X_API_KEY, X_API_SECRET_KEY, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET } =
  process.env;

if (!X_API_KEY || !X_API_SECRET_KEY || !X_ACCESS_TOKEN || !X_ACCESS_TOKEN_SECRET) {
  console.error("Missing X API credentials in environment variables");
  process.exit(1);
}

const client = new TwitterApi({
  appKey: X_API_KEY,
  appSecret: X_API_SECRET_KEY,
  accessToken: X_ACCESS_TOKEN,
  accessSecret: X_ACCESS_TOKEN_SECRET,
});

// 画像アップロード
const mediaIds = [];
for (const buf of pngBuffers) {
  const mediaId = await client.v1.uploadMedia(buf, { mimeType: "image/png" });
  console.log(`Uploaded media: ${mediaId}`);
  mediaIds.push(mediaId);
}

// 本文投稿（v1.1 を優先、403なら v2 にフォールバック）
let tweetId;

try {
  // v1.1 POST statuses/update
  const v1Params = { status: body };
  if (mediaIds.length > 0) {
    v1Params.media_ids = mediaIds.join(",");
  }
  const tweet = await client.v1.post("statuses/update.json", v1Params);
  tweetId = tweet.id_str;
  console.log(`Tweet posted (v1.1): https://x.com/i/status/${tweetId}`);
} catch (e) {
  console.log(`v1.1 failed (${e.code}), trying v2...`);
  const tweetPayload = { text: body };
  if (mediaIds.length > 0) {
    tweetPayload.media = { media_ids: mediaIds };
  }
  const { data: tweet } = await client.v2.tweet(tweetPayload);
  tweetId = tweet.id;
  console.log(`Tweet posted (v2): https://x.com/i/status/${tweetId}`);
}

// リプライ投稿
if (reply) {
  console.log("Waiting 120s before reply (rate limit)...");
  await new Promise((r) => setTimeout(r, 120_000));

  try {
    // v1.1 reply
    const replyTweet = await client.v1.post("statuses/update.json", {
      status: reply,
      in_reply_to_status_id: tweetId,
    });
    console.log(`Reply posted (v1.1): https://x.com/i/status/${replyTweet.id_str}`);
  } catch (e) {
    console.log(`v1.1 reply failed (${e.code}), trying v2...`);
    const { data: replyTweet } = await client.v2.tweet({
      text: reply,
      reply: { in_reply_to_tweet_id: tweetId },
    });
    console.log(`Reply posted (v2): https://x.com/i/status/${replyTweet.id}`);
  }
}

// --- Phase D: Update x-drafts.md ---
const updated = drafts.replace(
  `## ${targetHeading}`,
  `## ~~${targetHeading}~~ ✅投稿済み`,
);
writeFileSync(DRAFTS_PATH, updated, "utf-8");
console.log("Draft marked as posted.");
