import { Facility } from './types';
import facilitiesData from '../../data/facilities.json';

const facilities: Facility[] = facilitiesData as Facility[];

export function getAllFacilities(): Facility[] {
  return facilities;
}

export function getFacilityById(id: number): Facility | undefined {
  return facilities.find((f) => f.id === id);
}

export function getFacilitiesByPrefecture(prefecture: string): Facility[] {
  return facilities.filter((f) => f.prefecture === prefecture);
}

export function getPopularFacilities(limit: number = 6): Facility[] {
  // 画像がある施設を優先的に返す
  const withImages = facilities.filter((f) => f.images.length > 0);
  const withoutImages = facilities.filter((f) => f.images.length === 0);
  return [...withImages, ...withoutImages].slice(0, limit);
}

export function searchFacilities(params: {
  prefecture?: string;
  priceMin?: number;
  priceMax?: number;
  capacity?: number;
  waterBath?: boolean;
  selfLoyly?: boolean;
  outdoorAir?: boolean;
  coupleOk?: boolean;
}): Facility[] {
  let result = [...facilities];

  if (params.prefecture) {
    result = result.filter((f) => f.prefecture === params.prefecture);
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

  return result;
}

export type SortKey = 'recommend' | 'price_asc' | 'price_desc' | 'station_asc';

export function sortFacilities(facilities: Facility[], sort: SortKey): Facility[] {
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
      case 'station_asc': {
        // walkMinutes=0 means unknown — push to end
        if (a.walkMinutes === 0 && b.walkMinutes === 0) return 0;
        if (a.walkMinutes === 0) return 1;
        if (b.walkMinutes === 0) return -1;
        return a.walkMinutes - b.walkMinutes;
      }
      default:
        return 0;
    }
  });
}

export function getAllIds(): number[] {
  return facilities.map((f) => f.id);
}

export function getAllPrefectures(): string[] {
  return [...new Set(facilities.map((f) => f.prefecture))];
}
