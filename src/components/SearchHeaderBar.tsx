'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PREFECTURES, AREA_GROUPS } from '@/lib/types';
import { getAreaFacilityCounts } from '@/lib/facilities';
import { trackSearch, trackFilterChange } from '@/lib/analytics';

interface SearchHeaderBarProps {
  totalCount: number;
  filteredCount: number;
  prefectureLabel?: string;
  prefectureCode?: string;
  areaSlug?: string;
  station?: string;
  allStations?: string[];
}

type FilterKey = 'waterBath' | 'selfLoyly' | 'outdoorAir' | 'coupleOk' | 'open24h' | 'lateNight' | 'earlyMorning';

const filterLabels: Record<FilterKey, string> = {
  waterBath: '水風呂',
  selfLoyly: 'ロウリュ',
  outdoorAir: '外気浴',
  coupleOk: '男女OK',
  open24h: '24時間',
  lateNight: '深夜',
  earlyMorning: '早朝',
};

const CHEVRON_SVG = (
  <svg
    className="pointer-events-none absolute right-2 w-3.5 h-3.5 text-text-tertiary"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export default function SearchHeaderBar({ totalCount, filteredCount, prefectureLabel, prefectureCode, areaSlug, station, allStations }: SearchHeaderBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    waterBath: searchParams.get('waterBath') === 'true',
    selfLoyly: searchParams.get('selfLoyly') === 'true',
    outdoorAir: searchParams.get('outdoorAir') === 'true',
    coupleOk: searchParams.get('coupleOk') === 'true',
    open24h: searchParams.get('open24h') === 'true',
    lateNight: searchParams.get('lateNight') === 'true',
    earlyMorning: searchParams.get('earlyMorning') === 'true',
  });

  const hasActiveFilters = (Object.keys(filters) as FilterKey[]).some((key) => filters[key]) || !!searchParams.get('station');

  const stationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleStationChange = (value: string) => {
    if (stationTimerRef.current) clearTimeout(stationTimerRef.current);
    stationTimerRef.current = setTimeout(() => {
      trackFilterChange('station', value || 'all');
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set('station', value.trim());
      } else {
        params.delete('station');
      }
      router.push(`?${params.toString()}`, { scroll: false });
    }, 300);
  };

  // 検索結果表示時にsearchイベントを送信
  const hasTrackedSearch = useRef(false);
  useEffect(() => {
    if (!hasTrackedSearch.current) {
      const searchTerm = [prefectureLabel || '全国', areaSlug].filter(Boolean).join(' ');
      trackSearch(searchTerm, filteredCount);
      hasTrackedSearch.current = true;
    }
  }, [prefectureLabel, areaSlug, filteredCount]);

  const toggleFilter = (key: FilterKey) => {
    const newFilters = { ...filters, [key]: !filters[key] };
    setFilters(newFilters);
    trackFilterChange(key, String(newFilters[key]));

    const params = new URLSearchParams(searchParams.toString());
    if (newFilters[key]) {
      params.set(key, 'true');
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const clearAllFilters = () => {
    setFilters({
      waterBath: false,
      selfLoyly: false,
      outdoorAir: false,
      coupleOk: false,
      open24h: false,
      lateNight: false,
      earlyMorning: false,
    });

    const params = new URLSearchParams();
    const prefecture = searchParams.get('prefecture');
    if (prefecture) params.set('prefecture', prefecture);
    const area = searchParams.get('area');
    if (area) params.set('area', area);
    const sort = searchParams.get('sort');
    if (sort) params.set('sort', sort);
    const duration = searchParams.get('duration');
    if (duration) params.set('duration', duration);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handlePrefectureChange = (value: string) => {
    trackFilterChange('prefecture', value || 'all');
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('prefecture', value);
    } else {
      params.delete('prefecture');
    }
    params.delete('area');
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleAreaChange = (slug: string) => {
    trackFilterChange('area', slug || 'all');
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set('area', slug);
    } else {
      params.delete('area');
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSortChange = (value: string) => {
    trackFilterChange('sort', value);
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'recommend') {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleDurationChange = (value: string) => {
    trackFilterChange('duration', value || 'all');
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('duration', value);
    } else {
      params.delete('duration');
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const showAreaRow = prefectureCode && AREA_GROUPS[prefectureCode];
  const areaCounts = prefectureCode ? getAreaFacilityCounts(prefectureCode) : {};
  const areas = prefectureCode ? AREA_GROUPS[prefectureCode] : undefined;

  return (
    <div className="bg-surface border-b border-border flex-shrink-0">
      {/* === Row 1: Logo + Prefecture + Filter chips + Count === */}
      <div className="max-w-[1440px] mx-auto px-3 md:px-6 h-12 md:h-14 flex items-center gap-2 md:gap-3">
        {/* Back button (mobile) */}
        <Link href="/" className="md:hidden flex items-center justify-center w-7 h-7 flex-shrink-0"
          data-track-click="search_back"
        >
          <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 flex-shrink-0">
          <Image
            src="/saunako-avatar.webp"
            alt="サウナ子"
            width={32}
            height={32}
            className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover"
          />
          <span className="hidden md:inline font-bold text-lg text-text-primary">サウナ子</span>
        </Link>

        {/* Prefecture Select */}
        <div className="relative inline-flex items-center flex-shrink-0">
          <select
            value={prefectureCode || ''}
            onChange={(e) => handlePrefectureChange(e.target.value)}
            className="appearance-none pl-3 pr-7 py-1.5 rounded-full text-[13px] font-medium bg-bg border border-border text-text-primary cursor-pointer"
            data-track-click="prefecture_select"
          >
            <option value="">全国</option>
            {PREFECTURES.map((p) => (
              <option key={p.code} value={p.code}>{p.label}</option>
            ))}
          </select>
          {CHEVRON_SVG}
        </div>

        {/* Station Search */}
        <div className="relative inline-flex items-center flex-shrink-0">
          <input
            type="text"
            list="station-list"
            placeholder="駅名で検索"
            defaultValue={station || ''}
            onChange={(e) => handleStationChange(e.target.value)}
            className="pl-3 pr-2 py-1.5 rounded-full text-[13px] font-medium bg-bg border border-border text-text-primary w-[100px] md:w-[140px] placeholder:text-text-tertiary"
            data-track-click="station_search"
          />
          {allStations && allStations.length > 0 && (
            <datalist id="station-list">
              {allStations.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          )}
        </div>

        {/* Filter Chips - horizontal scroll on mobile, wrap on PC */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-1 min-w-0 md:flex-wrap">
          {(Object.keys(filters) as FilterKey[]).map((key) => (
            <button
              key={key}
              onClick={() => toggleFilter(key)}
              className={`px-2.5 py-1 rounded-full text-[12px] md:text-[13px] font-medium transition-colors border flex-shrink-0 ${
                filters[key]
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-text-secondary border-border hover:border-primary hover:text-primary'
              }`}
              data-track-click="filter_chip"
              data-track-filter={key}
            >
              {filterLabels[key]}
            </button>
          ))}

          {/* Clear button */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-[12px] md:text-[13px] text-text-tertiary hover:text-text-secondary transition-colors flex-shrink-0 ml-0.5"
            >
              クリア
            </button>
          )}
        </div>

        {/* Count Badge */}
        <span className="text-[13px] font-medium text-text-secondary flex-shrink-0 tabular-nums">
          {filteredCount !== totalCount ? `${filteredCount}/${totalCount}` : filteredCount}件
        </span>
      </div>

      {/* === Row 2: Area chips + Sort/Duration === */}
      <div className="max-w-[1440px] mx-auto px-3 md:px-6 h-10 flex items-center gap-2 border-t border-border/50">
        {/* Area Chips (only when prefecture selected) */}
        {showAreaRow && areas && (
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-1 min-w-0 md:flex-wrap">
            <button
              onClick={() => handleAreaChange('')}
              className={`px-2.5 py-1 rounded-full text-[12px] md:text-[13px] font-medium transition-colors border flex-shrink-0 ${
                !areaSlug
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-text-secondary border-border hover:border-primary hover:text-primary'
              }`}
            >
              すべて
            </button>
            {areas.map((area) => (
              <button
                key={area.slug}
                onClick={() => handleAreaChange(area.slug)}
                className={`px-2.5 py-1 rounded-full text-[12px] md:text-[13px] font-medium transition-colors border flex-shrink-0 ${
                  areaSlug === area.slug
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-text-secondary border-border hover:border-primary hover:text-primary'
                }`}
              >
                {area.label}({areaCounts[area.slug] || 0})
              </button>
            ))}
          </div>
        )}

        {/* Spacer when no area chips */}
        {!showAreaRow && <div className="flex-1" />}

        {/* Sort + Duration dropdowns (always visible, right-aligned) */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="relative inline-flex items-center">
            <select
              value={searchParams.get('sort') || 'recommend'}
              onChange={(e) => handleSortChange(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1 border border-border rounded-md text-[12px] md:text-[13px] text-text-secondary bg-white cursor-pointer"
            >
              <option value="recommend">掲載順</option>
              <option value="newest">新着順</option>
              <option value="price_asc">価格が安い順</option>
              <option value="price_desc">価格が高い順</option>
              <option value="station_asc">駅から近い順</option>
            </select>
            {CHEVRON_SVG}
          </div>

          <div className="relative inline-flex items-center">
            <select
              value={searchParams.get('duration') || ''}
              onChange={(e) => handleDurationChange(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1 border border-border rounded-md text-[12px] md:text-[13px] text-text-secondary bg-white cursor-pointer"
            >
              <option value="">利用時間</option>
              <option value="60">60分〜</option>
              <option value="90">90分〜</option>
              <option value="120">120分〜</option>
              <option value="180">180分〜</option>
            </select>
            {CHEVRON_SVG}
          </div>
        </div>
      </div>
    </div>
  );
}
