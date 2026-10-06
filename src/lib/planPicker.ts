import type { Plan } from './types';

/**
 * 施設詳細の「人数 × 時間 → 料金」ピッカーのロジック。
 *
 * price は室料（capacity 名までの料金）なので、N 人で使えるのは capacity >= N のプラン。
 * プラン名には平日/土日・会員/ビジターなどの区別が自由記述で混ざり、構造化されていないため、
 * 1つの金額に決めつけず、条件に合うプランをすべて安い順に返す。
 */

/** 人数の選択肢の上限。これより大人数は貸切相談になることが多く、選択肢が長くなるだけなので */
const MAX_PEOPLE_OPTION = 10;

export interface PlanOption {
  name: string;
  price: number;
  duration: number;
  capacity: number;
  /** 1人あたり（切り上げ。getPerPersonPrice と同じ丸め） */
  perPerson: number;
}

function validPlans(plans: Plan[] | null | undefined): Plan[] {
  return (plans ?? []).filter((p) => p.price > 0 && p.duration > 0 && p.capacity > 0);
}

/** 選べる人数（1〜最大定員。上限 MAX_PEOPLE_OPTION） */
export function peopleOptions(plans: Plan[] | null | undefined): number[] {
  const max = Math.min(Math.max(0, ...validPlans(plans).map((p) => p.capacity)), MAX_PEOPLE_OPTION);
  return Array.from({ length: max }, (_, i) => i + 1);
}

/** その人数で選べる利用時間（分・短い順） */
export function durationOptions(plans: Plan[] | null | undefined, people: number): number[] {
  const set = new Set(validPlans(plans).filter((p) => p.capacity >= people).map((p) => p.duration));
  return [...set].sort((a, b) => a - b);
}

/** 人数・時間に合うプラン（安い順） */
export function matchPlans(plans: Plan[] | null | undefined, people: number, duration: number): PlanOption[] {
  return validPlans(plans)
    .filter((p) => p.capacity >= people && p.duration === duration)
    .map((p) => ({ ...p, perPerson: Math.ceil(p.price / people) }))
    .sort((a, b) => a.price - b.price);
}

/** 最初に選んでおく組み合わせ（最安プランの人数・時間） */
export function defaultSelection(plans: Plan[] | null | undefined): { people: number; duration: number } | null {
  const valid = validPlans(plans);
  if (valid.length === 0) return null;
  const cheapest = valid.reduce((a, b) => (b.price < a.price ? b : a));
  return { people: Math.min(cheapest.capacity, MAX_PEOPLE_OPTION), duration: cheapest.duration };
}
