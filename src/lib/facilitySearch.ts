import { Facility, AREA_GROUPS } from './types';
import { getDistanceKm } from './distance';
import { parseBusinessHoursTags, getTimeSlotTags, getPerPersonPrice } from './facility-utils';

/**
 * 施設一覧の絞り込み・並べ替え。施設データを引数で受け取る純関数だけを置く。
 *
 * facilities.ts は data/facilities.json を直接 import するので、ブラウザ側（/search の絞り込み）から使うと
 * JSON がまるごと JS に入る。ブラウザからはこちらを使い、データは /facilities-data.json から取る。
 */

export interface FacilityFilter {
  prefecture?: string | string[];
  area?: string;
  priceMin?: number;
  priceMax?: number;
  capacity?: number;
  duration?: number;
  waterBath?: boolean;
  selfLoyly?: boolean;
  outdoorAir?: boolean;
  coupleOk?: boolean;
  open24h?: boolean;
  lateNight?: boolean;
  earlyMorning?: boolean;
  onlineBooking?: boolean;
}

export function filterFacilities(facilities: Facility[], params: FacilityFilter): Facility[] {
  let result = facilities;

  if (params.prefecture) {
    if (Array.isArray(params.prefecture)) {
      const prefSet = new Set(params.prefecture);
      result = result.filter((f) => prefSet.has(f.prefecture));
    } else {
      result = result.filter((f) => f.prefecture === params.prefecture);
    }
  }
  if (params.area) {
    result = result.filter((f) => f.area === params.area);
  }
  if (params.priceMin) {
    result = result.filter((f) => f.priceMin >= params.priceMin!);
  }
  if (params.priceMax) {
    result = result.filter((f) => f.priceMin > 0 && f.priceMin <= params.priceMax!);
  }
  if (params.capacity) {
    result = result.filter((f) => f.capacity >= params.capacity!);
  }
  if (params.duration) {
    result = result.filter((f) => f.duration >= params.duration!);
  }
  if (params.waterBath) {
    result = result.filter((f) => f.features.waterBath);
  }
  if (params.selfLoyly) {
    result = result.filter((f) => f.features.selfLoyly);
  }
  if (params.outdoorAir) {
    result = result.filter((f) => f.features.outdoorAir);
  }
  if (params.coupleOk) {
    result = result.filter((f) => f.features.coupleOk);
  }
  if (params.open24h) {
    result = result.filter((f) => parseBusinessHoursTags(f.businessHours).is24h);
  }
  if (params.lateNight) {
    result = result.filter((f) => getTimeSlotTags(f).hasLateNightSlot);
  }
  if (params.earlyMorning) {
    result = result.filter((f) => getTimeSlotTags(f).hasMorningSlot);
  }
  if (params.onlineBooking) {
    result = result.filter((f) => !!f.bookingUrl);
  }
  return result;
}

/** サブエリア slug ごとの施設数 */
export function countFacilitiesByArea(facilities: Facility[], prefectureCode: string): Record<string, number> {
  const areas = AREA_GROUPS[prefectureCode];
  if (!areas) return {};
  const counts: Record<string, number> = {};
  for (const area of areas) {
    counts[area.slug] = facilities.filter((f) => f.prefecture === prefectureCode && f.area === area.label).length;
  }
  return counts;
}

export type SortKey = 'recommend' | 'price_asc' | 'price_desc' | 'per_person_asc' | 'station_asc' | 'newest' | 'distance';

export function sortFacilities(facilities: Facility[], sort: SortKey, origin?: { lat: number; lng: number }): Facility[] {
  if (sort === 'recommend') return facilities;

  return [...facilities].sort((a, b) => {
    switch (sort) {
      case 'price_asc': {
        // priceMin=0 means unknown — push to end
        if (a.priceMin === 0 && b.priceMin === 0) return 0;
        if (a.priceMin === 0) return 1;
        if (b.priceMin === 0) return -1;
        return a.priceMin - b.priceMin;
      }
      case 'price_desc': {
        if (a.priceMin === 0 && b.priceMin === 0) return 0;
        if (a.priceMin === 0) return 1;
        if (b.priceMin === 0) return -1;
        return b.priceMin - a.priceMin;
      }
      case 'per_person_asc': {
        // 1人あたり料金が不明な施設は室料（=1人あたりの上限値）でフォールバック、料金不明は末尾
        const aVal = getPerPersonPrice(a) ?? (a.priceMin > 0 ? a.priceMin : Number.MAX_SAFE_INTEGER);
        const bVal = getPerPersonPrice(b) ?? (b.priceMin > 0 ? b.priceMin : Number.MAX_SAFE_INTEGER);
        return aVal - bVal;
      }
      case 'station_asc': {
        // walkMinutes=0 or null means unknown — push to end
        const aWalk = a.walkMinutes ?? 0;
        const bWalk = b.walkMinutes ?? 0;
        if (aWalk === 0 && bWalk === 0) return 0;
        if (aWalk === 0) return 1;
        if (bWalk === 0) return -1;
        return aWalk - bWalk;
      }
      case 'newest': {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      case 'distance': {
        if (!origin) return 0;
        const aHasCoords = a.lat != null && a.lng != null;
        const bHasCoords = b.lat != null && b.lng != null;
        if (!aHasCoords && !bHasCoords) return 0;
        if (!aHasCoords) return 1;
        if (!bHasCoords) return -1;
        const aDist = getDistanceKm(origin.lat, origin.lng, a.lat!, a.lng!);
        const bDist = getDistanceKm(origin.lat, origin.lng, b.lat!, b.lng!);
        return aDist - bDist;
      }
      default:
        return 0;
    }
  });
}
