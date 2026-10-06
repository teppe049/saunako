import { describe, expect, it } from 'vitest';
import { defaultSelection, durationOptions, matchPlans, peopleOptions } from './planPicker';

// サウナ禅(83)の実データ相当
const ZEN = [
  { name: 'ひとり 60分', price: 7800, duration: 60, capacity: 1 },
  { name: 'ひとり 90分', price: 11700, duration: 90, capacity: 1 },
  { name: 'ふたり 60分', price: 9800, duration: 60, capacity: 2 },
  { name: 'ふたり 90分', price: 14700, duration: 90, capacity: 2 },
  { name: 'ふたり 120分', price: 19600, duration: 120, capacity: 2 },
];

describe('planPicker', () => {
  it('人数は1〜最大定員', () => {
    expect(peopleOptions(ZEN)).toEqual([1, 2]);
    expect(peopleOptions([{ name: 'x', price: 1, duration: 60, capacity: 20 }])).toHaveLength(10);
    expect(peopleOptions(null)).toEqual([]);
  });

  it('その人数で使えるプランの時間だけ出す', () => {
    expect(durationOptions(ZEN, 1)).toEqual([60, 90, 120]);
    expect(durationOptions(ZEN, 2)).toEqual([60, 90, 120]);
  });

  it('定員が人数以上のプランを安い順に、1人あたりつきで返す', () => {
    expect(matchPlans(ZEN, 1, 60).map((p) => p.price)).toEqual([7800, 9800]);
    const two = matchPlans(ZEN, 2, 90);
    expect(two).toHaveLength(1);
    expect(two[0]).toMatchObject({ name: 'ふたり 90分', price: 14700, perPerson: 7350 });
  });

  it('平日/土日など同じ人数・時間のプランは全部並べる', () => {
    const plans = [
      { name: '90分 2名 土日', price: 12000, duration: 90, capacity: 2 },
      { name: '90分 2名 平日', price: 10000, duration: 90, capacity: 2 },
    ];
    expect(matchPlans(plans, 2, 90).map((p) => p.name)).toEqual(['90分 2名 平日', '90分 2名 土日']);
  });

  it('料金や定員が0のプランは使わない', () => {
    expect(matchPlans([{ name: 'x', price: 0, duration: 60, capacity: 2 }], 1, 60)).toEqual([]);
  });

  it('最初は最安プランの人数・時間を選ぶ', () => {
    expect(defaultSelection(ZEN)).toEqual({ people: 1, duration: 60 });
    expect(defaultSelection([])).toBeNull();
  });
});
