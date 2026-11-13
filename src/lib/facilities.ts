import { Facility, AreaGroup, AREA_GROUPS } from './types';
import { getDistanceKm } from './distance';
import { filterFacilities, sortFacilities, type FacilityFilter, type SortKey } from './facilitySearch';
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

/** サブエリアごとの最安料金（priceMin が0=要問合せの施設は除く）。施設がなければキーを持たない */
export function getAreaMinPrices(prefectureCode: string): Record<string, number> {
  const areas = AREA_GROUPS[prefectureCode];
  if (!areas) return {};
  const mins: Record<string, number> = {};
  for (const area of areas) {
    const prices = facilities
      .filter((f) => isOpen(f) && f.prefecture === prefectureCode && f.area === area.label && f.priceMin > 0)
      .map((f) => f.priceMin);
    if (prices.length > 0) mins[area.slug] = Math.min(...prices);
  }
  return mins;
}

/**
 * サブエリアごとの最短利用プランの平均額（円・四捨五入）。priceMin は duration 分の室料なので、
 * 要問合せ（0円）と宿泊など duration=0 の施設は除く。施設がなければキーを持たない
 */
export function getAreaAvgPrices(prefectureCode: string): Record<string, number> {
  const areas = AREA_GROUPS[prefectureCode];
  if (!areas) return {};
  const avgs: Record<string, number> = {};
  for (const area of areas) {
    const prices = facilities
      .filter((f) => isOpen(f) && f.prefecture === prefectureCode && f.area === area.label && f.priceMin > 0 && f.duration > 0)
      .map((f) => f.priceMin);
    if (prices.length > 0) avgs[area.slug] = Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);
  }
  return avgs;
}

export function searchFacilities(params: FacilityFilter): Facility[] {
  return filterFacilities(facilities.filter(isOpen), params);
}

export { sortFacilities };
export type { SortKey };

export function getNewFacilities(limit: number = 6, days: number = 30): Facility[] {
  const now = new Date();
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return facilities
    .filter((f) => isOpen(f) && f.openedAt && new Date(f.openedAt) >= cutoff)
    .sort((a, b) => new Date(b.openedAt!).getTime() - new Date(a.openedAt!).getTime())
    .slice(0, limit);
}

export function getRelatedFacilities(facility: Facility, limit: number = 6): { sameArea: Facility[]; similarPrice: Facility[] } {
  // 同一エリア → 同一都道府県の順にフォールバックして最大5件
  let sameArea = facilities
    .filter((f) => isOpen(f) && f.id !== facility.id && f.prefecture === facility.prefecture && f.area === facility.area);
  if (sameArea.length < 5) {
    const areaIds = new Set(sameArea.map((f) => f.id));
    const samePref = facilities
      .filter((f) => isOpen(f) && f.id !== facility.id && !areaIds.has(f.id) && f.prefecture === facility.prefecture);
    sameArea = [...sameArea, ...samePref];
  }
  // 座標がある場合は距離順（「近くの個室サウナ」を実際に近い順で出す）。座標なしは末尾
  if (facility.lat !== null && facility.lng !== null) {
    const { lat, lng } = facility;
    const dist = (f: Facility) => (f.lat !== null && f.lng !== null ? getDistanceKm(lat, lng, f.lat, f.lng) : Number.MAX_SAFE_INTEGER);
    sameArea = [...sameArea].sort((a, b) => dist(a) - dist(b));
  }
  sameArea = sameArea.slice(0, 5);

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

/** 施設の特徴からサウナ子口調の紹介テキストを自動生成 */
export function generateFeatureText(facility: Facility): string {
  const points: string[] = [];

  // サウナ設備
  if (facility.features.selfLoyly) points.push('セルフロウリュで自分好みの蒸気を楽しめる');
  if (facility.features.waterBath) {
    const temp = facility.features.waterBathTemp;
    if (temp && Number(temp) <= 15) points.push(`水風呂は${temp}℃とキンキンに冷えてる`);
    else if (temp) points.push(`${temp}℃の水風呂でしっかりクールダウンできる`);
    else points.push('水風呂も完備してる');
  }
  if (facility.features.outdoorAir) points.push('外気浴スペースで整える環境もバッチリだ');

  // ターゲット（各ポイントは「〜し、」「〜よ!」で連結しても自然な語尾にすること）
  if (facility.features.coupleOk) points.push('カップルでの利用もOKだ');
  if (facility.capacity >= 4) points.push(`最大${facility.capacity}名でグループ利用にもぴったりだ`);

  // アクセス
  if (facility.walkMinutes != null && facility.walkMinutes <= 3) points.push('駅チカで通いやすい');

  // 営業時間
  const bhTags = parseBusinessHoursTags(facility.businessHours);
  if (bhTags.is24h) points.push('24時間営業だからいつでも利用できる');
  else if (bhTags.lateNight) points.push('深夜営業で仕事帰りにも立ち寄れる');

  if (points.length === 0) return '';

  // サウナ子口調で自然に連結
  if (points.length === 1) return `${facility.name}は${points[0]}よ!`;
  const last = points.pop()!;
  return `${facility.name}は${points.join('し、')}し、${last}よ!`;
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

