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

/**
 * 指定時刻（hour）に営業中かどうか判定。
 * パースできない場合は true を返す（除外しない方針）。
 *
 * facility を渡すと timeSlots も考慮する:
 * - slotType: "fixed" で timeSlots あり → その時間帯に開始枠があるか判定
 * - それ以外 → 従来の businessHours 文字列パース
 */
export function isOpenAtHour(bh: string, hour: number, facility?: Facility): boolean {
  // timeSlots による判定（固定枠制施設）
  if (facility?.slotType === 'fixed' && Array.isArray(facility.timeSlots) && facility.timeSlots.length > 0) {
    const allTimes = facility.timeSlots.flatMap(g => g?.startTimes ?? []);
    if (allTimes.length === 0) return true;
    return allTimes.some(t => {
      const h = parseInt(t.split(':')[0], 10);
      return h >= hour;
    });
  }

  if (!bh || bh === '不明' || bh.includes('予約') || bh.includes('要問') || bh.includes('要確認') || bh.includes('確認')) return true;
  if (bh.includes('24時間')) return true;

  // "HH:MM-HH:MM" or "HH:MM〜HH:MM" パターンを抽出
  const m = bh.match(/(\d{1,2}):(\d{2})\s*[〜\-−～]\s*(?:翌)?(\d{1,2}):(\d{2})/);
  if (!m) return true; // パース不可 → 除外しない

  const openH = parseInt(m[1], 10);
  const closeH = parseInt(m[3], 10) + (bh.includes('翌') ? 24 : 0);
  const checkH = hour < openH ? hour + 24 : hour; // 深夜帯の補正

  return checkH >= openH && checkH < closeH;
}

/**
 * 現在時刻以降の次の空き枠を返す。
 * - fixed施設: timeSlots から currentHour 以降の最も近い開始時刻
 * - free施設: 営業中なら "営業中"、閉店中なら開始時刻
 * - 判定不能: null
 */
export function getNextAvailableSlot(facility: Facility, currentHour: number): string | null {
  if (facility.slotType === 'fixed' && Array.isArray(facility.timeSlots) && facility.timeSlots.length > 0) {
    const allTimes = facility.timeSlots
      .flatMap(g => g?.startTimes ?? [])
      .sort();
    const next = allTimes.find(t => {
      const h = parseInt(t.split(':')[0], 10);
      return h >= currentHour;
    });
    return next ? `${next}〜` : null;
  }

  const bh = facility.businessHours;
  if (!bh || bh === '不明' || bh.includes('予約') || bh.includes('要問') || bh.includes('要確認') || bh.includes('確認')) return null;
  if (bh.includes('24時間')) return '営業中';

  const m = bh.match(/(\d{1,2}):(\d{2})\s*[〜\-−～]\s*(?:翌)?(\d{1,2}):(\d{2})/);
  if (!m) return null;

  const openH = parseInt(m[1], 10);
  const closeH = parseInt(m[3], 10) + (bh.includes('翌') ? 24 : 0);
  const checkH = currentHour < openH ? currentHour + 24 : currentHour;

  if (checkH >= openH && checkH < closeH) return '営業中';
  if (currentHour < openH) return `${m[1]}:${m[2]} 開始`;
  return null;
}

export function getTimeSlotTags(facility: Facility): { hasMorningSlot: boolean; hasLateNightSlot: boolean } {
  if (Array.isArray(facility.timeSlots) && facility.timeSlots.length > 0) {
    const allTimes = facility.timeSlots.flatMap(g => g?.startTimes ?? []);
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
