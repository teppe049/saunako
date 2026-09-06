import { describe, expect, it } from 'vitest';
import { buildPickPath, getPickAreaLabel, getPickBadges, parsePickIds, sanitizePickMessage } from './pick';
import type { Facility } from './types';

function facility(over: Partial<Facility> & { id: number }): Facility {
  return {
    slug: `f${over.id}`,
    name: `施設${over.id}`,
    prefecture: 'tokyo',
    prefectureLabel: '東京都',
    city: '新宿区',
    area: '新宿・神楽坂',
    address: '',
    nearestStation: '新宿駅',
    walkMinutes: 5,
    priceMin: 9000,
    duration: 60,
    capacity: 2,
    features: { waterBath: true, waterBathTemp: null, selfLoyly: true, outdoorAir: false, coupleOk: true, bluetooth: null, wifi: null },
    businessHours: '',
    holidays: '',
    website: '',
    phone: '',
    bookingUrl: null,
    amenities: [],
    note: null,
    images: [],
    lat: null,
    lng: null,
    description: '',
    seoDescription: null,
    saunakoCommentShort: '',
    saunakoCommentLong: '',
    updatedAt: '2026-01-01',
    openedAt: null,
    closedAt: null,
    plans: [{ name: 'p', price: 9000, duration: 60, capacity: 2 }],
    timeSlots: null,
    slotType: null,
    ...over,
  } as Facility;
}

describe('parsePickIds', () => {
  it('ハイフン区切りを数値配列にする', () => {
    expect(parsePickIds('85-18-84')).toEqual([85, 18, 84]);
  });
  it('旧 /compare のカンマ区切りも受ける', () => {
    expect(parsePickIds('85,18')).toEqual([85, 18]);
  });
  it('不正値・0・負数を除き、重複を落とす', () => {
    expect(parsePickIds('85-abc-0--18-85')).toEqual([85, 18]);
  });
  it('5件以上は先頭4件に切り詰める', () => {
    expect(parsePickIds('1-2-3-4-5-6')).toEqual([1, 2, 3, 4]);
  });
  it('空は空配列', () => {
    expect(parsePickIds('')).toEqual([]);
    expect(parsePickIds(undefined)).toEqual([]);
  });
});

describe('buildPickPath', () => {
  it('順序を保ってハイフンで繋ぐ', () => {
    expect(buildPickPath([84, 18, 85])).toBe('/pick/84-18-85');
  });
});

describe('sanitizePickMessage', () => {
  it('改行・制御文字を空白にして前後を詰める', () => {
    expect(sanitizePickMessage('  土曜の\n午後で\t ')).toBe('土曜の 午後で');
  });
  it('80文字で切る（サロゲートペアを壊さない）', () => {
    const s = '😀'.repeat(100);
    expect([...sanitizePickMessage(s)!].length).toBe(80);
  });
  it('空・配列は null / 先頭要素', () => {
    expect(sanitizePickMessage('')).toBeNull();
    expect(sanitizePickMessage(undefined)).toBeNull();
    expect(sanitizePickMessage(['a', 'b'])).toBe('a');
  });
});

describe('getPickBadges', () => {
  it('1人あたり最安の施設に cheapest を付ける', () => {
    const a = facility({ id: 1, plans: [{ name: 'p', price: 6900, duration: 90, capacity: 2 }] });
    // 室料は b の方が高いが 4名で割ると 1人あたりは b が安い＝バッジは室料ではなく1人あたりで決める
    const b = facility({ id: 2, plans: [{ name: 'p', price: 13500, duration: 90, capacity: 4 }] });
    expect(getPickBadges([a, b]).cheapestId).toBe(2);
  });
  it('最安がタイなら cheapest を付けない', () => {
    const a = facility({ id: 1 });
    const b = facility({ id: 2 });
    expect(getPickBadges([a, b]).cheapestId).toBeNull();
  });
  it('plans が無い施設は最安判定から除外する', () => {
    const a = facility({ id: 1, plans: null });
    const b = facility({ id: 2 });
    const c = facility({ id: 3, plans: [{ name: 'p', price: 20000, duration: 60, capacity: 2 }] });
    expect(getPickBadges([a, b, c]).cheapestId).toBe(2);
  });
  it('全候補が同じ駅のときだけ nearest を付ける', () => {
    const a = facility({ id: 1, walkMinutes: 4 });
    const b = facility({ id: 2, walkMinutes: 5 });
    expect(getPickBadges([a, b])).toMatchObject({ nearestId: 1, nearestStation: '新宿駅' });
    const c = facility({ id: 3, nearestStation: '新大久保駅', walkMinutes: 2 });
    expect(getPickBadges([a, b, c]).nearestId).toBeNull();
  });
  it('1件だけなら何も付けない', () => {
    expect(getPickBadges([facility({ id: 1 })])).toEqual({ cheapestId: null, nearestId: null, nearestStation: null });
  });
});

describe('getPickAreaLabel', () => {
  it('同一エリアならエリア名、県だけ同じなら area は null、県も違えば null', () => {
    const a = facility({ id: 1 });
    const b = facility({ id: 2 });
    expect(getPickAreaLabel([a, b])).toEqual({ prefecture: 'tokyo', prefectureLabel: '東京都', area: '新宿・神楽坂' });
    const c = facility({ id: 3, area: '池袋・赤羽' });
    expect(getPickAreaLabel([a, c])?.area).toBeNull();
    const d = facility({ id: 4, prefecture: 'osaka', prefectureLabel: '大阪府' });
    expect(getPickAreaLabel([a, d])).toBeNull();
  });
});
