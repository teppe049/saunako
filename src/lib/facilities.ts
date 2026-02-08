import { Facility } from './types';
import facilitiesData from '../../data/facilities.json';

const facilities: Facility[] = facilitiesData as Facility[];

export function getAllFacilities(): Facility[] {
  return facilities;
}

export function getFacilityBySlug(slug: string): Facility | undefined {
  return facilities.find((f) => f.slug === slug);
}

export function getFacilitiesByPrefecture(prefecture: string): Facility[] {
  return facilities.filter((f) => f.prefecture === prefecture);
}

export function getPopularFacilities(limit: number = 6): Facility[] {
  // TODO: 人気順のロジックを実装（現状は最初のN件）
  return facilities.slice(0, limit);
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

export function getAllSlugs(): string[] {
  return facilities.map((f) => f.slug);
}

export function getAllPrefectures(): string[] {
  return [...new Set(facilities.map((f) => f.prefecture))];
}
