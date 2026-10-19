import { describe, expect, it } from 'vitest';
import { cheapestCouplePlan, coupleBudgetPicks } from './coupleBudget';
import type { Facility, Plan } from './types';

function facility(overrides: Partial<Facility> & { coupleOk?: boolean } = {}): Facility {
  const { coupleOk = true, ...rest } = overrides;
  return {
    id: 1,
    name: 'テスト',
    priceMin: 0,
    duration: 0,
    capacity: 0,
    plans: null,
    features: { coupleOk, waterBath: false, waterBathTemp: null, selfLoyly: false, outdoorAir: false, bluetooth: null, wifi: null },
    ...rest,
  } as Facility;
}

// サウナ禅(83)の実データ相当
const ZEN: Plan[] = [
  { name: 'ひとり 60分', price: 7800, duration: 60, capacity: 1 },
  { name: 'ふたり 60分', price: 9800, duration: 60, capacity: 2 },
  { name: 'ふたり 90分', price: 14700, duration: 90, capacity: 2 },
];

describe('cheapestCouplePlan', () => {
  it('定員2名以上のプランだけから最安を選ぶ（1名プランは使わない）', () => {
    expect(cheapestCouplePlan(facility({ plans: ZEN }))).toEqual({ price: 9800, duration: 60 });
  });

  it('同額なら利用時間の長いプランを採る', () => {
    const plans = [
      { name: 'a', price: 5000, duration: 60, capacity: 2 },
      { name: 'b', price: 5000, duration: 90, capacity: 2 },
    ];
    expect(cheapestCouplePlan(facility({ plans }))).toEqual({ price: 5000, duration: 90 });
  });

  it('plans が無ければ priceMin/duration/capacity で代用する', () => {
    expect(cheapestCouplePlan(facility({ priceMin: 6000, duration: 90, capacity: 2 }))).toEqual({ price: 6000, duration: 90 });
  });

  it('plans に1名プランしか無ければ、施設の定員が2名以上でも priceMin で代用しない', () => {
    const plans = [{ name: '70分 1名', price: 3400, duration: 70, capacity: 1 }];
    expect(cheapestCouplePlan(facility({ plans, priceMin: 3400, duration: 70, capacity: 4 }))).toBeNull();
  });

  it('2人で入れない・料金不明なら null', () => {
    expect(cheapestCouplePlan(facility({ priceMin: 3000, duration: 60, capacity: 1 }))).toBeNull();
    expect(cheapestCouplePlan(facility({ priceMin: 3000, duration: 0, capacity: 2 }))).toBeNull();
  });
});

describe('coupleBudgetPicks', () => {
  it('男女で利用できる施設だけを安い順に、1人あたりつきで返す', () => {
    const picks = coupleBudgetPicks(
      [
        facility({ id: 1, plans: ZEN }),
        facility({ id: 2, priceMin: 5001, duration: 60, capacity: 2 }),
        facility({ id: 3, priceMin: 1000, duration: 60, capacity: 2, coupleOk: false }),
      ],
      5
    );
    expect(picks.map((p) => p.facility.id)).toEqual([2, 1]);
    expect(picks[0]).toMatchObject({ price: 5001, duration: 60, perPerson: 2501 });
  });

  it('件数を limit で切る', () => {
    const many = [1, 2, 3].map((id) => facility({ id, priceMin: id * 1000, duration: 60, capacity: 2 }));
    expect(coupleBudgetPicks(many, 2).map((p) => p.facility.id)).toEqual([1, 2]);
  });
});
