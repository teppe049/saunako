#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// --- 引数パース ---
const args = process.argv.slice(2);
let count = 7;
let shuffle = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--count' && args[i + 1]) {
    count = parseInt(args[i + 1], 10);
    i++;
  }
  if (args[i] === '--shuffle') {
    shuffle = true;
  }
}

// --- データ読み込み ---
const dataPath = path.resolve(__dirname, '..', 'data', 'facilities.json');
const facilities = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// --- 特徴タグ生成 ---
const featureLabels = {
  waterBath: '水風呂',
  selfLoyly: 'セルフロウリュ',
  outdoorAir: '外気浴',
  coupleOk: 'カップルOK',
  bluetooth: 'Bluetooth',
  wifi: 'Wi-Fi',
};

function buildFeatureText(features) {
  const tags = [];
  for (const [key, label] of Object.entries(featureLabels)) {
    if (features[key] === true) {
      tags.push(label);
    }
  }
  return tags.join(' / ') || 'プライベート空間';
}

// --- 価格フォーマット ---
function formatPrice(price) {
  return price.toLocaleString('ja-JP');
}

// --- エリア名からハッシュタグ用テキスト生成 ---
function areaHashtag(prefectureLabel) {
  return prefectureLabel
    .replace(/都$/, '')
    .replace(/府$/, '')
    .replace(/県$/, '');
}

// --- 投稿テンプレート生成 ---
function generatePost(facility) {
  const {
    id,
    name,
    nearestStation,
    walkMinutes,
    priceMin,
    duration,
    features,
    saunakoCommentShort,
    prefectureLabel,
  } = facility;

  const featureText = buildFeatureText(features);
  const area = areaHashtag(prefectureLabel);

  const lines = [];
  lines.push('\u3010' + name + '\u3011\uD83E\uDDD6\u200D\u2640\uFE0F');
  lines.push('');
  lines.push(saunakoCommentShort || '');
  lines.push('');
  lines.push('\uD83D\uDCCD ' + nearestStation + ' \u5F92\u6B69' + walkMinutes + '\u5206');
  lines.push('\uD83D\uDCB0 ' + formatPrice(priceMin) + '\u5186\uFF5E / ' + duration + '\u5206');
  lines.push('\uD83D\uDD25 ' + featureText);
  lines.push('');
  lines.push('\u8A73\u3057\u304F\u306F\u3053\u3061\u3089\uD83D\uDC47');
  lines.push('https://saunako.jp/facilities/' + id);
  lines.push('');
  lines.push('#\u500B\u5BA4\u30B5\u30A6\u30CA #\u30B5\u30A6\u30CA #\u30B5\u6D3B #' + area + '\u30B5\u30A6\u30CA');

  return lines.join('\n');
}

// --- メイン ---
let selected = [...facilities];

if (shuffle) {
  for (let i = selected.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [selected[i], selected[j]] = [selected[j], selected[i]];
  }
}

selected = selected.slice(0, count);

const output = selected.map(generatePost).join('\n---\n');
console.log(output);
