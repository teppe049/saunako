#!/usr/bin/env node
/**
 * X投稿ウェイトチェック（Claude Code hook用）
 * x-drafts.md 内の投稿文が280ウェイトを超えていたらエラーで終了
 * stdin: Claude Code PostToolUse の tool input JSON
 */
const fs = require('fs');

// stdin から tool input を読む
let stdin = '';
try {
  stdin = fs.readFileSync('/dev/stdin', 'utf8');
} catch {}

// x-drafts.md の編集でなければスキップ
try {
  const input = JSON.parse(stdin);
  const filePath = input.file_path || '';
  if (!filePath.includes('x-drafts.md')) process.exit(0);
} catch {
  process.exit(0);
}

// x-drafts.md を読んでウェイトチェック
const draftsPath = require('path').join(__dirname, '..', 'docs', 'x-drafts.md');
if (!fs.existsSync(draftsPath)) process.exit(0);

const content = fs.readFileSync(draftsPath, 'utf8');

// 「### 本文」セクション内の ``` ブロックを抽出
const blocks = [];
const lines = content.split('\n');
let inHonbun = false;
let inCode = false;
let current = '';

for (const line of lines) {
  if (line.startsWith('### 本文')) {
    inHonbun = true;
    inCode = false;
    current = '';
    continue;
  }
  if (inHonbun && line.startsWith('```') && !inCode) {
    inCode = true;
    current = '';
    continue;
  }
  if (inHonbun && line.startsWith('```') && inCode) {
    inCode = false;
    inHonbun = false;
    blocks.push(current);
    continue;
  }
  if (inCode) {
    current += (current ? '\n' : '') + line;
  }
}

// ウェイト計算
function calcWeight(text) {
  let w = 0;
  for (const ch of text) {
    if (ch === '\n') w += 1;
    else if (ch.codePointAt(0) > 0x1F000) w += 2; // emoji
    else if (ch.charCodeAt(0) > 127) w += 2;       // 日本語等
    else w += 1;                                     // ASCII
  }
  return w;
}

let hasError = false;
for (let i = 0; i < blocks.length; i++) {
  const w = calcWeight(blocks[i]);
  if (w > 280) {
    // 直近の投稿（最後の2ブロック）のみチェック
    if (i >= blocks.length - 2) {
      console.error(`❌ X投稿文ウェイト超過: ${w}/280 (${w - 280}オーバー)`);
      console.error(`対象テキスト冒頭: ${blocks[i].substring(0, 50)}...`);
      hasError = true;
    }
  }
}

if (hasError) {
  console.error('\n280ウェイト以内に短縮してから保存してください。');
  process.exit(1);
}
