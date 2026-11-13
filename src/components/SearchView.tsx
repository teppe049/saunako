'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchHeaderBar from '@/components/SearchHeaderBar';
import SearchInteractivePanel from '@/components/SearchInteractivePanel';
import RecentlyViewedChips from '@/components/RecentlyViewedChips';
import { filterFacilities, sortFacilities, countFacilitiesByArea, type SortKey } from '@/lib/facilitySearch';
import { loadFacilities } from '@/lib/facilitiesClient';
import { PREFECTURES, AREA_GROUPS, getRegionByCode } from '@/lib/types';
import type { Facility } from '@/lib/types';
import { getDistanceKm, formatDistance } from '@/lib/distance';
import { getOpenStatus, isAvailableNow, isOpenAtHour } from '@/lib/openHours';

// 現在地検索の初期半径。徒歩・タクシー圏で候補が数件出る広さ（段階的に拡大できる）
const DEFAULT_RADIUS_KM = 3;
const VALID_SORT_KEYS = ['price_asc', 'price_desc', 'per_person_asc', 'distance'];

/**
 * /search の検索結果。URL の条件で施設を絞り込む。
 * サイトは静的書き出しでサーバー処理を持たないため、絞り込みはブラウザで /facilities-data.json に対して行う。
 */
export default function SearchView() {
  const searchParams = useSearchParams();
  const [all, setAll] = useState<Facility[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    loadFacilities().then(setAll, () => setFailed(true));
  }, []);

  const view = useMemo(() => {
    if (!all) return null;
    const p = (key: string) => searchParams.get(key) ?? undefined;

    const regionCode = p('region') || '';
    const regionData = regionCode ? getRegionByCode(regionCode) : undefined;
    const prefecture = p('prefecture') || '';
    const prefData = PREFECTURES.find((x) => x.code === prefecture);
    const areaSlug = p('area') || '';
    const areaData = areaSlug && prefecture ? AREA_GROUPS[prefecture]?.find((a) => a.slug === areaSlug) : undefined;

    const lat = p('lat') ? Number(p('lat')) : undefined;
    const lng = p('lng') ? Number(p('lng')) : undefined;
    const origin = lat != null && lng != null && !isNaN(lat) && !isNaN(lng) ? { lat, lng } : undefined;

    // カップル・グループ検索は「1人あたり料金」で並べるのがデフォルト
    const isGroupSearch = (p('capacity') != null && Number(p('capacity')) >= 2) || p('coupleOk') === 'true';
    const defaultSort: SortKey = origin ? 'distance' : isGroupSearch ? 'per_person_asc' : 'price_asc';
    const sortKey = (VALID_SORT_KEYS.includes(p('sort') || '') ? p('sort') : defaultSort) as SortKey;

    // 都道府県の指定 > 地方の指定（その地方の都道府県すべて）> 指定なし
    const prefectureFilter = prefecture ? prefecture : regionData ? regionData.prefectures.map((x) => x.code) : undefined;

    const filtered = filterFacilities(all, {
      prefecture: prefectureFilter,
      area: areaData?.label,
      priceMin: p('priceMin') ? Number(p('priceMin')) : undefined,
      priceMax: p('priceMax') ? Number(p('priceMax')) : undefined,
      capacity: p('capacity') ? Number(p('capacity')) : undefined,
      duration: p('duration') ? Number(p('duration')) : undefined,
      waterBath: p('waterBath') === 'true',
      selfLoyly: p('selfLoyly') === 'true',
      outdoorAir: p('outdoorAir') === 'true',
      coupleOk: p('coupleOk') === 'true',
      open24h: p('open24h') === 'true',
      lateNight: p('lateNight') === 'true',
      earlyMorning: p('earlyMorning') === 'true',
      onlineBooking: p('onlineBooking') === 'true',
    });

    // 「何時から」: 営業時間ベースで指定時刻に営業中の施設だけ
    const openAt = p('openAt') ? Number(p('openAt')) : undefined;
    const hourFiltered = openAt != null && !isNaN(openAt) ? filtered.filter((f) => isOpenAtHour(f, openAt)) : filtered;

    // 「今から行ける」: 表示時点(JST)で営業中、または2時間以内に次の枠がある施設だけ
    const now = new Date();
    const timeFiltered = p('now') === '1' ? hourFiltered.filter((f) => isAvailableNow(getOpenStatus(f, now))) : hourFiltered;

    const sorted = sortFacilities(timeFiltered, sortKey, origin);

    const radiusKm = origin ? (p('radius') ? Number(p('radius')) : DEFAULT_RADIUS_KM) : undefined;
    const distanceFiltered =
      origin && radiusKm
        ? sorted.filter((f) => f.lat != null && f.lng != null && getDistanceKm(origin.lat, origin.lng, f.lat, f.lng) <= radiusKm)
        : sorted;

    const facilities = origin
      ? distanceFiltered.map((f) => ({
          ...f,
          _distance: f.lat != null && f.lng != null ? formatDistance(getDistanceKm(origin.lat, origin.lng, f.lat, f.lng)) : undefined,
        }))
      : distanceFiltered;

    const baseCount = prefecture
      ? all.filter((f) => f.prefecture === prefecture).length
      : regionData
        ? all.filter((f) => regionData.prefectures.some((x) => x.code === f.prefecture)).length
        : all.length;

    const h1Text =
      prefData && areaData
        ? `${prefData.label} ${areaData.label}の個室サウナ検索結果`
        : prefData
          ? `${prefData.label}の個室サウナ検索結果`
          : regionData
            ? `${regionData.label}の個室サウナ検索結果`
            : '個室サウナ検索';

    return {
      facilities,
      origin,
      radiusKm,
      defaultSort,
      baseCount,
      h1Text,
      regionCode,
      prefecture,
      prefLabel: prefData?.label,
      areaSlug,
      locationName: p('locationName') || undefined,
      areaCounts: prefecture ? countFacilitiesByArea(all, prefecture) : {},
    };
  }, [all, searchParams]);

  if (failed) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-text-tertiary">読み込めませんでした。ページを再読み込みしてください</p>
      </div>
    );
  }
  if (!view) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-text-tertiary">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-bg">
      <h1 className="sr-only">{view.h1Text}</h1>
      <SearchHeaderBar
        totalCount={view.baseCount}
        filteredCount={view.facilities.length}
        prefectureLabel={view.prefLabel}
        prefectureCode={view.prefecture}
        regionCode={view.regionCode}
        areaSlug={view.areaSlug}
        locationName={view.locationName}
        hasOrigin={!!view.origin}
        defaultSort={view.defaultSort}
        areaCounts={view.areaCounts}
      />
      <RecentlyViewedChips />
      <div className="flex flex-col flex-1 min-h-0">
        <SearchInteractivePanel facilities={view.facilities} hasOrigin={!!view.origin} origin={view.origin} radiusKm={view.radiusKm} />
      </div>
    </div>
  );
}
