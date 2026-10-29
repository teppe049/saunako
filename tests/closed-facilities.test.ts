/**
 * 閉店した施設が記事とサジェストに残っていないかのゲート。
 *
 * 背景: getFacilityById は閉店施設も返すので、記事の <FacilityCard> は閉店後も表示され続ける。
 * 10/29 に HOTTERS24 高円寺（閉店当日）と TOTONOUCHI（3月に掲載終了）が6本の記事に残っていた。
 * suggest-data.json も手で更新していたため、閉店施設が検索候補に残り新規施設が漏れていた。
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import facilitiesJson from '../data/facilities.json';
import suggestData from '../src/lib/suggest-data.json';
import type { Facility } from '@/lib/types';
import { buildSuggestData } from '../scripts/sync-suggest-data.mjs';

const facilities = facilitiesJson as Facility[];
const isOpen = (f: Facility) => !f.closedAt || new Date(f.closedAt) > new Date();
const closed = new Map(facilities.filter((f) => !isOpen(f)).map((f) => [f.id, f.name]));

const ARTICLES_DIR = path.join(__dirname, '../content/articles');

function referencedIds(source: string): number[] {
  const ids = new Set<number>();
  for (const m of source.matchAll(/<FacilityCard\s+id=\{(\d+)\}/g)) ids.add(Number(m[1]));
  const front = source.match(/^facilityIds:\s*\[([^\]]*)\]/m);
  if (front) for (const s of front[1].split(',')) if (s.trim()) ids.add(Number(s.trim()));
  return [...ids];
}

describe('閉店施設の残り', () => {
  it('記事が閉店施設を参照していない', () => {
    const hits: string[] = [];
    for (const file of fs.readdirSync(ARTICLES_DIR).filter((f) => f.endsWith('.mdx'))) {
      const source = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf8');
      for (const id of referencedIds(source)) {
        if (closed.has(id)) hits.push(`${file}: ${id} ${closed.get(id)}`);
      }
    }
    expect(hits).toEqual([]);
  });

  it('suggest-data.json の施設名とエリア件数が facilities.json と一致する（node scripts/sync-suggest-data.mjs で更新）', () => {
    const expected = buildSuggestData(facilities, suggestData);
    expect(suggestData.facilities).toEqual(expected.facilities);
    expect(suggestData.areaCounts).toEqual(expected.areaCounts);
  });
});
