/**
 * data/facilities.json の整合性テスト
 *
 * 背景: 2026-08-29 に「京都13施設の area が空文字」「福岡10施設が文字化け」で
 * サブエリアページが1ヶ月間 0件表示になっていた（project_area-data-bug-2026-08-29）。
 * 同種の事故をデータ更新時に即検知するためのゲート。
 */
import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import facilitiesJson from '../data/facilities.json';
import { AREA_GROUPS, PREFECTURES, type Facility } from '@/lib/types';

const facilities = facilitiesJson as Facility[];
const PREFECTURE_CODES = new Set(PREFECTURES.map((p) => p.code));
const PREFECTURE_LABELS = new Map(PREFECTURES.map((p) => [p.code, p.label]));

/**
 * AREA_GROUPS にスラッグが未定義で、area がどのラベルにも一致しない既知の施設。
 * 新設要否は別途判断（memory: area-data-bug-2026-08-29 の未解決12件）。
 * ここに無い施設で不一致が出たらデータ更新ミスなので落とす。
 */
const KNOWN_AREA_GAPS = new Set([424, 430, 431, 432, 471, 472, 478, 482, 484, 486, 487, 493]);

/** 画像が3枚未満と分かっている既知の施設 */
const KNOWN_FEW_IMAGES = new Set([216, 234, 236]);

const DATE_RE = /^\d{4}-\d{2}-\d{2}/;
// openedAt は開業年しか分からない施設があるため YYYY / YYYY-MM / YYYY-MM-DD を許容（new Date() で解釈可能）
const PARTIAL_DATE_RE = /^\d{4}(-\d{2}){0,2}$/;

describe('facilities.json 基本整合性', () => {
  it('id と slug が一意', () => {
    const ids = facilities.map((f) => f.id);
    const slugs = facilities.map((f) => f.slug);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('prefecture は47都道府県コードのいずれかで、prefectureLabel と対応している', () => {
    const bad = facilities
      .filter((f) => !PREFECTURE_CODES.has(f.prefecture) || PREFECTURE_LABELS.get(f.prefecture) !== f.prefectureLabel)
      .map((f) => `${f.id}:${f.prefecture}/${f.prefectureLabel}`);
    expect(bad).toEqual([]);
  });

  it('必須文字列フィールドが空でない', () => {
    const bad = facilities
      .filter((f) => !f.name || !f.slug || !f.city || !f.address || !f.description)
      .map((f) => f.id);
    expect(bad).toEqual([]);
  });

  it('文字化け（U+FFFD）を含まない', () => {
    const bad = facilities.filter((f) => JSON.stringify(f).includes('�')).map((f) => f.id);
    expect(bad).toEqual([]);
  });

  it('updatedAt / closedAt / verifiedAt は YYYY-MM-DD、openedAt は YYYY[-MM[-DD]] 形式', () => {
    const bad = facilities
      .filter(
        (f) =>
          !DATE_RE.test(f.updatedAt) ||
          (f.openedAt && !PARTIAL_DATE_RE.test(f.openedAt)) ||
          (f.closedAt && !DATE_RE.test(f.closedAt)) ||
          (f.verifiedAt && !DATE_RE.test(f.verifiedAt))
      )
      .map((f) => f.id);
    expect(bad).toEqual([]);
  });

  it('数値フィールドが負でない', () => {
    const bad = facilities
      .filter((f) => f.priceMin < 0 || f.duration < 0 || f.capacity < 0 || (f.walkMinutes !== null && f.walkMinutes < 0))
      .map((f) => f.id);
    expect(bad).toEqual([]);
  });
});

describe('facilities.json サブエリア紐付け', () => {
  it('AREA_GROUPS がある都道府県の施設は area がいずれかのラベルと一致する（既知の例外を除く）', () => {
    const bad: string[] = [];
    for (const f of facilities) {
      const groups = AREA_GROUPS[f.prefecture];
      if (!groups) continue;
      if (KNOWN_AREA_GAPS.has(f.id)) continue;
      if (!groups.some((g) => g.label === f.area)) {
        bad.push(`${f.id}:${f.prefecture}:${JSON.stringify(f.area)}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it('既知の例外リストが陳腐化していない（解消済みなら KNOWN_AREA_GAPS から外す）', () => {
    const resolved = [...KNOWN_AREA_GAPS].filter((id) => {
      const f = facilities.find((x) => x.id === id);
      if (!f) return true;
      const groups = AREA_GROUPS[f.prefecture];
      return !groups || groups.some((g) => g.label === f.area);
    });
    expect(resolved).toEqual([]);
  });

  it('AREA_GROUPS のスラッグは都道府県内で一意', () => {
    for (const [pref, groups] of Object.entries(AREA_GROUPS)) {
      const slugs = groups.map((g) => g.slug);
      expect(new Set(slugs).size, pref).toBe(slugs.length);
    }
  });
});

describe('facilities.json 画像', () => {
  it('images に列挙されたファイルが public/ に存在する', () => {
    const missing: string[] = [];
    for (const f of facilities) {
      for (const img of f.images) {
        if (!fs.existsSync(path.join(process.cwd(), 'public', img))) missing.push(`${f.id}:${img}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('各施設に3枚以上の画像がある（既知の例外を除く）', () => {
    const bad = facilities.filter((f) => f.images.length < 3 && !KNOWN_FEW_IMAGES.has(f.id)).map((f) => f.id);
    expect(bad).toEqual([]);
  });
});

/**
 * 背景: 2026-09-07 に timeSlots が5件、型定義（TimeSlotGroup[]）に反する形で
 * 入っていた（文字列配列やオブジェクト）。施設詳細ページは防御的にフィルタしており、
 * 型が違うと「予約枠の目安」が黙って非表示になる＝データがあるのに見せられていなかった。
 */
describe('facilities.json 時間枠', () => {
  it('timeSlots は TimeSlotGroup[] の形をしている', () => {
    const bad: string[] = [];

    for (const f of facilities) {
      const ts = f.timeSlots;
      if (ts === null || ts === undefined) continue;

      if (!Array.isArray(ts)) {
        bad.push(`${f.id}: 配列でない (${JSON.stringify(ts).slice(0, 60)})`);
        continue;
      }
      for (const [i, group] of ts.entries()) {
        if (typeof group !== 'object' || group === null || Array.isArray(group)) {
          bad.push(`${f.id}[${i}]: オブジェクトでない (${JSON.stringify(group)})`);
          continue;
        }
        if (typeof group.label !== 'string' || group.label === '') {
          bad.push(`${f.id}[${i}]: label が無い`);
        }
        if (!Array.isArray(group.startTimes) || group.startTimes.length === 0) {
          bad.push(`${f.id}[${i}]: startTimes が無い`);
        }
      }
    }

    expect(
      bad,
      `timeSlots の型が不正:\n${bad.join('\n')}\n` +
        '施設詳細ページのフィルタで黙って非表示になるため、{ label, startTimes[] } に揃えること。'
    ).toEqual([]);
  });

  it('startTimes は HH:MM 形式', () => {
    const bad: string[] = [];
    for (const f of facilities) {
      if (!Array.isArray(f.timeSlots)) continue;
      for (const group of f.timeSlots) {
        if (!Array.isArray(group?.startTimes)) continue;
        for (const t of group.startTimes) {
          if (!/^\d{1,2}:\d{2}$/.test(t)) bad.push(`${f.id}: "${t}"`);
        }
      }
    }
    expect(bad, `startTimes の形式が不正:\n${bad.join('\n')}`).toEqual([]);
  });

  it('slotType が fixed なら timeSlots がある（既知の例外を除く）', () => {
    // id=2 KUDOCHI銀座 は24時間営業で枠情報を未取得。取得できたら例外から外す
    const KNOWN_FIXED_WITHOUT_SLOTS = new Set([2]);
    const bad = facilities
      .filter((f) => f.slotType === 'fixed' && !f.timeSlots && !KNOWN_FIXED_WITHOUT_SLOTS.has(f.id))
      .map((f) => `${f.id} ${f.name}`);
    expect(bad).toEqual([]);
  });
});
