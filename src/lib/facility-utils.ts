import type { Facility } from './types';

/** 施設が閉店済みかどうか判定 */
export function isFacilityClosed(facility: Facility): boolean {
  return !!facility.closedAt && new Date(facility.closedAt) <= new Date();
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
