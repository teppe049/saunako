#!/usr/bin/env node
/**
 * src/lib/suggest-data.json の施設名サジェストとエリア別施設数を facilities.json から作り直す。
 * 施設の追加・閉店・エリア変更のあとに実行する（`--check` なら書き込まずに差分の有無だけ返す）。
 *
 * 駅名サジェスト（stations）は表記ゆれを手で正規化した一覧なので触らない。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const facilitiesPath = path.join(root, 'data/facilities.json');
const suggestPath = path.join(root, 'src/lib/suggest-data.json');

// src/lib/facilities.ts の isOpen と同じ判定
const isOpen = (f) => !f.closedAt || new Date(f.closedAt) > new Date();

export function buildSuggestData(facilities, current) {
  const open = facilities.filter(isOpen).sort((a, b) => a.id - b.id);

  const areaCounts = {};
  for (const pref of Object.keys(current.areaCounts)) areaCounts[pref] = { total: 0, areas: {} };
  for (const f of open) {
    const counts = (areaCounts[f.prefecture] ??= { total: 0, areas: {} });
    counts.total += 1;
    if (f.area) counts.areas[f.area] = (counts.areas[f.area] ?? 0) + 1;
  }

  return {
    facilities: open.map((f) => ({ id: f.id, name: f.name, pref: f.prefecture, prefLabel: f.prefectureLabel, city: f.city })),
    stations: current.stations,
    areaCounts,
  };
}

function main() {
  const facilities = JSON.parse(fs.readFileSync(facilitiesPath, 'utf8'));
  const raw = fs.readFileSync(suggestPath, 'utf8');
  const next = JSON.stringify(buildSuggestData(facilities, JSON.parse(raw)));

  if (process.argv.includes('--check')) {
    if (next !== raw.trimEnd()) {
      console.error('suggest-data.json が facilities.json と食い違っています。node scripts/sync-suggest-data.mjs を実行してください');
      process.exit(1);
    }
    return;
  }
  fs.writeFileSync(suggestPath, next);
  console.log('suggest-data.json を更新しました');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
