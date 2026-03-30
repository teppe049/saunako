#!/usr/bin/env node
/**
   * X (Twitter) 自動投稿スクリプト
   *
   * docs/x-drafts.md から当日分のドラフトを取得し、X API v2 で投稿する。
   * GitHub Actions の cron から実行される想定。
   * Pay-per-use プラン: v1.1 uploadMedia + v2 POST /2/tweets
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
import { createHmac, randomBytes } from "node:crypto";
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

console.log(`API Key prefix: ${X_API_KEY.slice(0, 8)}...`);
console.log(`Access Token prefix: ${X_ACCESS_TOKEN.slice(0, 20)}...`);

// --- OAuth 1.0a 署名ヘルパー ---
function percentEncode(str) {
      return encodeURIComponent(str).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

function generateOAuthSignature(method, url, params, consumerSecret, tokenSecret) {
      const sortedParams = Object.keys(params).sort().map((k) => `${percentEncode(k)}=${percentEncode(params[k])}`).join("&");
      const baseString = `${method}&${percentEncode(url)}&${percentEncode(sortedParams)}`;
      const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;
      return createHmac("sha1", signingKey).update(baseString).digest("base64");
}

function buildOAuthHeader(method, url, consumerKey, consumerSecret, accessToken, tokenSecret) {
      const oauthParams = {
                oauth_consumer_key: consumerKey,
                oauth_nonce: randomBytes(16).toString("hex"),
                oauth_signature_method: "HMAC-SHA1",
                oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
                oauth_token: accessToken,
                oauth_version: "1.0",
      };
      const signature = generateOAuthSignature(method, url, oauthParams, consumerSecret, tokenSecret);
      oauthParams.oauth_signature = signature;
      const header = Object.keys(oauthParams).sort().map((k) => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`).join(", ");
      return `OAuth ${header}`;
}

async function postTweetV2(payload) {
      const url = "https://api.twitter.com/2/tweets";
      const authHeader = buildOAuthHeader("POST", url, X_API_KEY, X_API_SECRET_KEY, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET);
      console.log(`Posting to: ${url}`);
      console.log(`Auth header prefix: ${authHeader.slice(0, 60)}...`);
      const res = await fetch(url, {
                method: "POST",
                headers: {
                              Authorization: authHeader,
                              "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
      });
      const text = await res.text();
      console.log(`Response status: ${res.status}`);
      console.log(`Response headers x-access-level: ${res.headers.get("x-access-level")}`);
      if (!res.ok) {
                console.error(`Response body: ${text}`);
                throw new Error(`POST /2/tweets failed with ${res.status}: ${text}`);
      }
      return JSON.parse(text);
}

// メディアアップロード用に twitter-api-v2 を使用（v1.1 upload は引き続き動作する）
const client = new TwitterApi({
      appKey: X_API_KEY,
      appSecret: X_API_SECRET_KEY,
      accessToken: X_ACCESS_TOKEN,
      accessSecret: X_ACCESS_TOKEN_SECRET,
});

// 画像アップロード (v1.1 - Pay-per-use で許可されているエンドポイント)
const mediaIds = [];
for (const buf of pngBuffers) {
      const mediaId = await client.v1.uploadMedia(buf, { mimeType: "image/png" });
      console.log(`Uploaded media: ${mediaId}`);
      mediaIds.push(mediaId);
}

// 本文投稿 (v2 POST /2/tweets - 直接 fetch + OAuth 1.0a 署名)
console.log("Posting tweet via v2 API (direct fetch)...");
const tweetPayload = { text: body };
if (mediaIds.length > 0) {
      tweetPayload.media = { media_ids: mediaIds.map(String) };
}

console.log("Tweet payload:", JSON.stringify(tweetPayload));

try {
      const result = await postTweetV2(tweetPayload);
      const tweetId = result.data.id;
      console.log(`Tweet posted: https://x.com/i/status/${tweetId}`);

    // リプライ投稿 (v2)
    if (reply) {
              console.log("Waiting 5s before reply...");
              await new Promise((r) => setTimeout(r, 5_000));
              const replyResult = await postTweetV2({
                            text: reply,
                            reply: { in_reply_to_tweet_id: tweetId },
              });
              console.log(`Reply posted: https://x.com/i/status/${replyResult.data.id}`);
    }

    // --- Phase D: Update x-drafts.md ---
    const updated = drafts.replace(
              `## ${targetHeading}`,
              `## ~~${targetHeading}~~ ✅投稿済み`,
          );
      writeFileSync(DRAFTS_PATH, updated, "utf-8");
      console.log("Draft marked as posted.");
} catch (err) {
      console.error("Tweet failed:", err.message);
      process.exit(1);
}
