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

export default function SearchHeaderBar({ totalCount, filteredCount, prefectureLabel, prefectureCode, areaSlug }: SearchHeaderBarProps) {
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

  const [showFilterSheet, setShowFilterSheet] = useState(false);

  const hasActiveFilters = (Object.keys(filters) as FilterKey[]).some((key) => filters[key]);
  const activeFilterCount = (Object.keys(filters) as FilterKey[]).filter((key) => filters[key]).length;

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

        {/* Filter Chips - desktop only */}
        <div className="hidden md:flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">
          {(Object.keys(filters) as FilterKey[]).map((key) => (
            <button
              key={key}
              onClick={() => toggleFilter(key)}
              className={`px-2.5 py-1.5 rounded-full text-[13px] font-medium transition-colors border flex-shrink-0 ${
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
              className="text-[13px] text-text-tertiary hover:text-text-secondary transition-colors flex-shrink-0 ml-0.5"
            >
              クリア
            </button>
          )}
        </div>

        {/* Filter Button - mobile only */}
        <button
          onClick={() => setShowFilterSheet(true)}
          className="md:hidden flex items-center gap-1 px-3 py-2 rounded-full text-[12px] font-medium border transition-colors flex-shrink-0 bg-white text-text-secondary border-border active:bg-gray-50"
          data-track-click="filter_button_mobile"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          フィルタ
          {activeFilterCount > 0 && (
            <span className="ml-0.5 w-4.5 h-4.5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center leading-none">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="flex-1 md:hidden" />

        {/* Count Badge */}
        <p className="text-[13px] font-medium text-text-secondary flex-shrink-0 tabular-nums">
          {filteredCount !== totalCount ? `${filteredCount}/${totalCount}` : filteredCount}件
        </p>
      </div>

      {/* === Row 2: Area chips + Sort/Duration === */}
      <div className="max-w-[1440px] mx-auto px-3 md:px-6 h-10 flex items-center gap-2 border-t border-border/50">
        {/* Area Chips (only when prefecture selected) */}
        {showAreaRow && areas && (
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-1 min-w-0 md:flex-wrap">
            <button
              onClick={() => handleAreaChange('')}
              className={`px-2.5 py-1.5 rounded-full text-[12px] md:text-[13px] font-medium transition-colors border flex-shrink-0 ${
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
                className={`px-2.5 py-1.5 rounded-full text-[12px] md:text-[13px] font-medium transition-colors border flex-shrink-0 ${
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

        {/* Sort + Duration dropdowns (desktop only, right-aligned) */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
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

      {/* === Mobile Filter Bottom Sheet === */}
      {showFilterSheet && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowFilterSheet(false)}
          />
          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl animate-[slideUp_0.25s_ease-out] max-h-[85vh] flex flex-col">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3">
              <h2 className="text-base font-bold text-text-primary">条件で絞り込み</h2>
              <button
                onClick={() => setShowFilterSheet(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="閉じる"
              >
                <svg className="w-4 h-4 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto px-5 pb-8 flex-1">
              {/* Facility Features */}
              <div className="mb-6">
                <p className="text-[13px] font-medium text-text-tertiary mb-3">設備・条件</p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(filters) as FilterKey[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => toggleFilter(key)}
                      className={`px-4 py-3 rounded-lg text-[13px] font-medium transition-colors border text-center ${
                        filters[key]
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-text-secondary border-border'
                      }`}
                      data-track-click="filter_sheet_toggle"
                      data-track-filter={key}
                    >
                      {filterLabels[key]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort + Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[13px] font-medium text-text-tertiary mb-2">並び順</p>
                  <div className="relative">
                    <select
                      value={searchParams.get('sort') || 'recommend'}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="w-full appearance-none pl-3 pr-8 py-2.5 border border-border rounded-lg text-[13px] text-text-primary bg-white cursor-pointer"
                    >
                      <option value="recommend">掲載順</option>
                      <option value="newest">新着順</option>
                      <option value="price_asc">価格が安い順</option>
                      <option value="price_desc">価格が高い順</option>
                      <option value="station_asc">駅から近い順</option>
                    </select>
                    {CHEVRON_SVG}
                  </div>
                </div>
                <div>
                  <p className="text-[13px] font-medium text-text-tertiary mb-2">利用時間</p>
                  <div className="relative">
                    <select
                      value={searchParams.get('duration') || ''}
                      onChange={(e) => handleDurationChange(e.target.value)}
                      className="w-full appearance-none pl-3 pr-8 py-2.5 border border-border rounded-lg text-[13px] text-text-primary bg-white cursor-pointer"
                    >
                      <option value="">すべて</option>
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

            {/* Footer */}
            <div className="flex items-center gap-3 px-5 py-4 border-t border-border bg-white">
              <button
                onClick={clearAllFilters}
                className="text-[13px] font-medium text-text-tertiary hover:text-text-secondary transition-colors"
              >
                クリア
              </button>
              <button
                onClick={() => setShowFilterSheet(false)}
                className="flex-1 py-2.5 rounded-lg bg-primary text-white text-[14px] font-bold transition-opacity hover:opacity-90"
              >
                {filteredCount}件を表示
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
