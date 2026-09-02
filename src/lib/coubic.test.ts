import { describe, expect, it } from 'vitest';
import { AVAILABILITY_ENABLED, hasCoubic, isCoubicRegistered, jstDate } from './coubic';
import coubic from '../../data/coubic.json';

describe('jstDate', () => {
  it('UTC深夜でもJSTの日付を返す', () => {
    // 2026-09-02T20:00Z = 2026-09-03T05:00 JST
    expect(jstDate(0, new Date('2026-09-02T20:00:00Z'))).toBe('2026-09-03');
    expect(jstDate(1, new Date('2026-09-02T20:00:00Z'))).toBe('2026-09-04');
  });
});

describe('data/coubic.json', () => {
  it('各エントリに merchant / host / 1件以上の予約ページがある', () => {
    for (const [id, entry] of Object.entries(coubic)) {
      expect(entry.merchant, id).toBeTruthy();
      expect(entry.host, id).toMatch(/\.stores\.jp$/);
      expect(entry.bookingPages.length, id).toBeGreaterThan(0);
      for (const p of entry.bookingPages) {
        expect(p.id, id).toMatch(/^\d+$/);
        expect(p.courses.length, `${id}/${p.id}`).toBeGreaterThan(0);
      }
    }
  });

  it('isCoubicRegistered は登録済み施設で true', () => {
    const first = Number(Object.keys(coubic)[0]);
    expect(isCoubicRegistered(first)).toBe(true);
    expect(isCoubicRegistered(999999)).toBe(false);
  });

  it('hasCoubic は有効フラグに従う（規約確認までオフ）', () => {
    const first = Number(Object.keys(coubic)[0]);
    expect(hasCoubic(first)).toBe(AVAILABILITY_ENABLED);
    expect(hasCoubic(999999)).toBe(false);
  });
});
