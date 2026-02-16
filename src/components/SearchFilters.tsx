'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AREA_GROUPS } from '@/lib/types';
import { getAreaFacilityCounts } from '@/lib/facilities';

interface SearchFiltersProps {
  totalCount: number;
  filteredCount: number;
  prefectureLabel?: string;
  prefectureCode?: string;
  areaSlug?: string;
}

type FilterKey = 'waterBath' | 'selfLoyly' | 'outdoorAir' | 'coupleOk' | 'open24h' | 'lateNight' | 'earlyMorning';

const filterLabels: Record<FilterKey, string> = {
  waterBath: '水風呂あり',
  selfLoyly: 'ロウリュ可',
  outdoorAir: '外気浴あり',
  coupleOk: '男女OK',
  open24h: '24時間営業',
  lateNight: '深夜OK',
  earlyMorning: '早朝OK',
};

export default function SearchFilters({ totalCount, filteredCount, prefectureLabel, prefectureCode, areaSlug }: SearchFiltersProps) {
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

  const activeFilters = (Object.keys(filters) as FilterKey[]).filter((key) => filters[key]);

  const toggleFilter = (key: FilterKey) => {
    const newFilters = { ...filters, [key]: !filters[key] };
    setFilters(newFilters);

    const params = new URLSearchParams(searchParams.toString());
    if (newFilters[key]) {
      params.set(key, 'true');
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const removeFilter = (key: FilterKey) => {
    const newFilters = { ...filters, [key]: false };
    setFilters(newFilters);

    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
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

  return (
    <div>
      {/* Result Count */}
      <p className="text-sm md:text-base font-semibold md:font-normal text-text-primary mb-2 md:mb-3">
        {prefectureLabel ? `${prefectureLabel}で` : ''}
        {filteredCount}件のプライベートサウナが見つかりました
      </p>

      {/* Active Filter Tags + Clear All */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 mb-2 md:mb-3 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
          {activeFilters.map((key) => (
            <button
              key={key}
              onClick={() => removeFilter(key)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary text-white rounded-full md:rounded-[20px] text-[13px] font-medium hover:bg-primary/90 transition-colors flex-shrink-0"
            >
              <span>{filterLabels[key]}</span>
              <svg className="w-3.5 h-3.5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ))}
          <button
            onClick={clearAllFilters}
            className="text-[13px] text-text-tertiary hover:text-text-secondary transition-colors ml-1 flex-shrink-0"
          >
            すべてクリア
          </button>
        </div>
      )}

      {/* Area Chips */}
      {prefectureCode && AREA_GROUPS[prefectureCode] && (
        <div className="flex items-center gap-2 mb-2 md:mb-3 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
          <span className="text-[13px] text-text-tertiary mr-1 flex-shrink-0">エリア:</span>
          {(() => {
            const counts = getAreaFacilityCounts(prefectureCode);
            const areas = AREA_GROUPS[prefectureCode];
            return (
              <>
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete('area');
                    router.push(`?${params.toString()}`, { scroll: false });
                  }}
                  className={`px-3 py-1 rounded-full md:rounded-[20px] text-[13px] font-medium transition-colors border flex-shrink-0 ${
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
                    onClick={() => {
                      const params = new URLSearchParams(searchParams.toString());
                      params.set('area', area.slug);
                      router.push(`?${params.toString()}`, { scroll: false });
                    }}
                    className={`px-3 py-1 rounded-full md:rounded-[20px] text-[13px] font-medium transition-colors border flex-shrink-0 ${
                      areaSlug === area.slug
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-text-secondary border-border hover:border-primary hover:text-primary'
                    }`}
                  >
                    {area.label}({counts[area.slug] || 0})
                  </button>
                ))}
              </>
            );
          })()}
        </div>
      )}

      {/* Filter Buttons - horizontal scroll on mobile */}
      <div className="flex items-center gap-2 mb-2 md:mb-3 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
        <span className="text-[13px] text-text-tertiary mr-1 flex-shrink-0">絞り込み:</span>
        {(Object.keys(filters) as FilterKey[]).map((key) => (
          <button
            key={key}
            onClick={() => toggleFilter(key)}
            className={`px-3 py-1 rounded-full md:rounded-[20px] text-[13px] font-medium transition-colors border flex-shrink-0 ${
              filters[key]
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-text-secondary border-border hover:border-primary hover:text-primary'
            }`}
          >
            {filterLabels[key]}
          </button>
        ))}
      </div>

      {/* Sort Dropdown + Duration Dropdown + Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative inline-flex items-center">
            <select
              value={searchParams.get('sort') || 'recommend'}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams.toString());
                if (e.target.value === 'recommend') {
                  params.delete('sort');
                } else {
                  params.set('sort', e.target.value);
                }
                router.push(`?${params.toString()}`, { scroll: false });
              }}
              className="appearance-none pl-3 pr-7 py-1.5 border border-border rounded-[6px] text-[13px] text-text-secondary bg-white cursor-pointer"
            >
              <option value="recommend">掲載順</option>
              <option value="price_asc">価格が安い順</option>
              <option value="price_desc">価格が高い順</option>
              <option value="station_asc">駅から近い順</option>
            </select>
            {/* Chevron-down icon */}
            <svg
              className="pointer-events-none absolute right-2 w-3.5 h-3.5 text-text-tertiary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <div className="relative inline-flex items-center">
            <select
              value={searchParams.get('duration') || ''}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams.toString());
                if (e.target.value) {
                  params.set('duration', e.target.value);
                } else {
                  params.delete('duration');
                }
                router.push(`?${params.toString()}`, { scroll: false });
              }}
              className="appearance-none pl-3 pr-7 py-1.5 border border-border rounded-[6px] text-[13px] text-text-secondary bg-white cursor-pointer"
            >
              <option value="">利用時間</option>
              <option value="60">60分〜</option>
              <option value="90">90分〜</option>
              <option value="120">120分〜</option>
              <option value="180">180分〜</option>
            </select>
            {/* Chevron-down icon */}
            <svg
              className="pointer-events-none absolute right-2 w-3.5 h-3.5 text-text-tertiary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <span className="text-[13px] text-text-tertiary">
          {filteredCount}/{totalCount}件
        </span>
      </div>
    </div>
  );
}
