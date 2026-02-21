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
    bookingUrl,
    website,
  } = facility;

  const featureText = buildFeatureText(features);
  const area = areaHashtag(prefectureLabel);
  const officialUrl = bookingUrl || website || '';

  const lines = [];
  lines.push('【' + name + '】🧖‍♀️');
  lines.push('');
  lines.push(saunakoCommentShort || '');
  lines.push('');
  lines.push('📍 ' + nearestStation + ' 徒歩' + walkMinutes + '分');
  lines.push('💰 ' + formatPrice(priceMin) + '円～ / ' + duration + '分');
  lines.push('🔥 ' + featureText);
  lines.push('');
  lines.push('▶️ サウナ子で詳しく見る');
  lines.push('https://saunako.jp/facilities/' + id);
  if (officialUrl) {
    lines.push('');
    lines.push('🔗 公式サイト・予約はこちら');
    lines.push(officialUrl);
  }
  lines.push('');
  lines.push('#個室サウナ #サウナ #サ活 #' + area + 'サウナ');

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
