import { Facility, AreaGroup, AREA_GROUPS } from './types';
import { getDistanceKm } from './distance';
import { isFacilityClosed, parseBusinessHoursTags, getTimeSlotTags } from './facility-utils';
import facilitiesData from '../../data/facilities.json';

// re-export for backward compatibility (server-only consumers)
export { isFacilityClosed, parseBusinessHoursTags, getTimeSlotTags };

const facilities: Facility[] = facilitiesData as Facility[];

/** 営業中の施設のみ（closedAt が未来 or null） */
function isOpen(f: Facility): boolean {
  return !f.closedAt || new Date(f.closedAt) > new Date();
}

export function getAllFacilities(): Facility[] {
  return facilities.filter(isOpen);
}

export function getFacilityById(id: number): Facility | undefined {
  return facilities.find((f) => f.id === id);
}

export function getFacilitiesByPrefecture(prefecture: string): Facility[] {
  return facilities.filter((f) => isOpen(f) && f.prefecture === prefecture);
}

export function getPopularFacilities(limit: number = 6): Facility[] {
  // 画像がある施設を優先的に返す（閉店済み除外）
  const open = facilities.filter(isOpen);
  const withImages = open.filter((f) => f.images.length > 0);
  const withoutImages = open.filter((f) => f.images.length === 0);
  return [...withImages, ...withoutImages].slice(0, limit);
}

export function getAreaBySlug(prefectureCode: string, areaSlug: string): AreaGroup | undefined {
  const areas = AREA_GROUPS[prefectureCode];
  if (!areas) return undefined;
  return areas.find((a) => a.slug === areaSlug);
}

export function getFacilitiesByArea(prefectureCode: string, areaLabel: string): Facility[] {
  return facilities.filter((f) => isOpen(f) && f.prefecture === prefectureCode && f.area === areaLabel);
}

export function getAreaFacilityCounts(prefectureCode: string): Record<string, number> {
  const areas = AREA_GROUPS[prefectureCode];
  if (!areas) return {};
  const counts: Record<string, number> = {};
  for (const area of areas) {
    counts[area.slug] = facilities.filter((f) => isOpen(f) && f.prefecture === prefectureCode && f.area === area.label).length;
  }
  return counts;
}

export function searchFacilities(params: {
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
}): Facility[] {
  let result = facilities.filter(isOpen);

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
  return result;
}

export type SortKey = 'recommend' | 'price_asc' | 'price_desc' | 'station_asc' | 'newest' | 'distance';

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

export function getNewFacilities(limit: number = 6, days: number = 30): Facility[] {
  const now = new Date();
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return facilities
    .filter((f) => isOpen(f) && f.openedAt && new Date(f.openedAt) >= cutoff)
    .sort((a, b) => new Date(b.openedAt!).getTime() - new Date(a.openedAt!).getTime())
    .slice(0, limit);
}

export function getRelatedFacilities(facility: Facility, limit: number = 6): { sameArea: Facility[]; similarPrice: Facility[] } {
  const sameArea = facilities
    .filter((f) => isOpen(f) && f.id !== facility.id && f.prefecture === facility.prefecture && f.area === facility.area)
    .slice(0, limit);

  const priceRange = facility.priceMin > 0 ? facility.priceMin * 0.5 : 0;
  const priceMax = facility.priceMin > 0 ? facility.priceMin * 1.5 : 0;
  const sameAreaIds = new Set(sameArea.map((f) => f.id));
  const similarPrice = facility.priceMin > 0
    ? facilities
        .filter((f) => isOpen(f) && f.id !== facility.id && !sameAreaIds.has(f.id) && f.priceMin >= priceRange && f.priceMin <= priceMax)
        .slice(0, limit)
    : [];

  return { sameArea, similarPrice };
}

export function getAllIds(): number[] {
  return facilities.filter(isOpen).map((f) => f.id);
}

export function getAllPrefectures(): string[] {
  return [...new Set(facilities.filter(isOpen).map((f) => f.prefecture))];
}

export function getPrefectureFacilityCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const f of facilities.filter(isOpen)) {
    counts[f.prefecture] = (counts[f.prefecture] || 0) + 1;
  }
  return counts;
}

export function generateImageAlt(facility: Facility): string {
  const parts = [facility.name, '個室サウナ'];
  if (facility.features.waterBath) parts.push('水風呂あり');
  else if (facility.features.selfLoyly) parts.push('セルフロウリュ');
  else if (facility.features.outdoorAir) parts.push('外気浴');
  else if (facility.features.coupleOk) parts.push('カップルOK');
  return parts.join(' ');
}

/** エリアラベルからslugを逆引き（パンくず4階層化用） */
export function getAreaSlugByLabel(prefectureCode: string, areaLabel: string): string | undefined {
  const areas = AREA_GROUPS[prefectureCode];
  if (!areas) return undefined;
  const area = areas.find((a) => a.label === areaLabel);
  return area?.slug;
}

/** businessHours文字列をOpeningHoursSpecification JSON-LDにパース */
export function parseBusinessHoursToSchema(businessHours: string): object[] | null {
  if (!businessHours || businessHours === '不明') return null;

  // "10:00〜22:00" or "10:00-22:00" パターン
  const simpleMatch = businessHours.match(/(\d{1,2}:\d{2})\s*[〜\-～]\s*(\d{1,2}:\d{2})/);
  if (!simpleMatch) return null;

  const opens = simpleMatch[1];
  const closes = simpleMatch[2];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return [{
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: dayNames,
    opens,
    closes,
  }];
}

