import type { Facility } from './types';

/**
 * エリアページの「カップルで安く行ける個室サウナ」のロジック。
 *
 * 「個室サウナ 都内 カップル」「個室サウナ 都内 安い」は /area/tokyo に着地しているが、
 * ページ本文にその答え（男女で入れて、2人でいくらか）が無かった（2026-10-13 analytics-pdca）。
 *
 * price は室料（capacity 名までの料金）なので、2人で使えるのは capacity >= 2 のプラン。
 * 利用時間が施設ごとに違うため「1時間あたり」には換算せず、総額と利用時間をセットで出す。
 */

const COUPLE_PEOPLE = 2;

/** 都道府県固有のカップル記事が無いエリアからつなぐ全国版の記事 */
export const DEFAULT_COUPLE_ARTICLE_SLUG = 'couple-private-sauna';

export interface CouplePick {
  facility: Facility;
  /** 2人で入れる最安プランの室料 */
  price: number;
  /** そのプランの利用時間（分） */
  duration: number;
  /** 1人あたり（切り上げ。planPicker と同じ丸め） */
  perPerson: number;
}

/** 2人で入れる最安プラン。同額なら長い方を採る（同じ値段で長くいられる方が実態に近い） */
export function cheapestCouplePlan(facility: Facility): { price: number; duration: number } | null {
  const candidates = (facility.plans ?? [])
    .filter((p) => p.price > 0 && p.duration > 0 && p.capacity >= COUPLE_PEOPLE)
    .map((p) => ({ price: p.price, duration: p.duration }));

  // plans が未整備の施設だけ priceMin/duration/capacity で代用する。
  // plans があって2名以上のプランが無い施設（1名料金しか分からない等）で代用すると、1名料金を2人の総額として出してしまう
  if ((facility.plans ?? []).length === 0 && facility.priceMin > 0 && facility.duration > 0 && facility.capacity >= COUPLE_PEOPLE) {
    candidates.push({ price: facility.priceMin, duration: facility.duration });
  }
  if (candidates.length === 0) return null;

  return candidates.reduce((a, b) => (b.price < a.price || (b.price === a.price && b.duration > a.duration) ? b : a));
}

/** 男女で利用できる施設を、2人で入れる最安プランの安い順に返す */
export function coupleBudgetPicks(facilities: Facility[], limit: number): CouplePick[] {
  return facilities
    .filter((f) => f.features.coupleOk)
    .flatMap((facility) => {
      const plan = cheapestCouplePlan(facility);
      return plan ? [{ facility, ...plan, perPerson: Math.ceil(plan.price / COUPLE_PEOPLE) }] : [];
    })
    .sort((a, b) => a.price - b.price || b.duration - a.duration)
    .slice(0, limit);
}
