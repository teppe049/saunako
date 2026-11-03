import { describe, expect, it } from 'vitest';
import { formatPriceRange } from './facility-utils';
import type { Facility } from './types';

function facility(overrides: Partial<Facility>): Facility {
  return { priceMin: 4130, duration: 60, plans: null, ...overrides } as Facility;
}

describe('formatPriceRange', () => {
  it('最安プランの定員を添える（priceMin は室料で1人分ではない）', () => {
    const f = facility({
      plans: [
        { name: 'ベーシック 60分 2名', price: 4130, duration: 60, capacity: 2 },
        { name: 'プレミアム 120分 4名', price: 17360, duration: 120, capacity: 4 },
      ],
    });
    expect(formatPriceRange(f)).toBe('2名60分 ¥4,130〜');
  });

  it('最安プランが特定できないときは人数を書かない', () => {
    expect(formatPriceRange(facility({ plans: null }))).toBe('60分 ¥4,130〜');
  });

  it('料金が無いときは null', () => {
    expect(formatPriceRange(facility({ priceMin: 0 }))).toBeNull();
  });
});
