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

export function parseBusinessHoursTags(bh: string): { is24h: boolean; lateNight: boolean; earlyMorning: boolean } {
  if (!bh || bh === '不明') return { is24h: false, lateNight: false, earlyMorning: false };

  const is24h = bh.includes('24時間');

  // Look for closing time after 22:00 or "翌" (next day)
  const lateNight = is24h || bh.includes('翌') || /2[2-3]:\d{2}/.test(bh) || /[01]:\d{2}/.test(bh.split('-')[1] || '');

  // Opening before 9:00
  const earlyMorning = is24h || /^[0-8]:\d{2}/.test(bh) || /^0[0-8]:\d{2}/.test(bh);

  return { is24h, lateNight, earlyMorning };
}

export function getTimeSlotTags(facility: Facility): { hasMorningSlot: boolean; hasLateNightSlot: boolean } {
  if (facility.timeSlots && facility.timeSlots.length > 0) {
    const allTimes = facility.timeSlots.flatMap(g => g.startTimes);
    const hasMorningSlot = allTimes.some(t => {
      const hour = parseInt(t.split(':')[0], 10);
      return hour < 9;
    });
    const hasLateNightSlot = allTimes.some(t => {
      const hour = parseInt(t.split(':')[0], 10);
      return hour >= 22;
    });
    return { hasMorningSlot, hasLateNightSlot };
  }
  const tags = parseBusinessHoursTags(facility.businessHours);
  return {
    hasMorningSlot: tags.earlyMorning,
    hasLateNightSlot: tags.lateNight,
  };
}

export function searchFacilities(params: {
  prefecture?: string;
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
