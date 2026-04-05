'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { REGION_GROUPS, getRegionByCode } from '@/lib/types';
import { trackSearch, trackFilterChange } from '@/lib/analytics';
import MobileFilterSheet from '@/components/MobileFilterSheet';
import SearchSortBar from '@/components/SearchSortBar';

interface SearchHeaderBarProps {
  totalCount: number;
  filteredCount: number;
  prefectureLabel?: string;
  prefectureCode?: string;
  regionCode?: string;
  areaSlug?: string;
  locationName?: string;
  hasOrigin?: boolean;
  areaCounts?: Record<string, number>;
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

export default function SearchHeaderBar({ totalCount, filteredCount, prefectureLabel, prefectureCode, regionCode, areaSlug, locationName, hasOrigin, areaCounts = {} }: SearchHeaderBarProps) {
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
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const hasActiveFilters = (Object.keys(filters) as FilterKey[]).some((key) => filters[key]) || !!searchParams.get('priceMax');
  const activeFilterCount = (Object.keys(filters) as FilterKey[]).filter((key) => filters[key]).length + (searchParams.get('priceMax') ? 1 : 0);

  const hasTrackedSearch = useRef(false);
  useEffect(() => {
    if (!hasTrackedSearch.current) {
      const searchTerm = [prefectureLabel || '全国', areaSlug].filter(Boolean).join(' ');
      trackSearch(searchTerm, filteredCount);
      hasTrackedSearch.current = true;
    }
  }, [prefectureLabel, areaSlug, filteredCount]);

  const updateParams = (updater: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    updater(params);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const toggleFilter = (key: FilterKey) => {
    const newFilters = { ...filters, [key]: !filters[key] };
    setFilters(newFilters);
    trackFilterChange(key, String(newFilters[key]));
    updateParams((p) => newFilters[key] ? p.set(key, 'true') : p.delete(key));
  };

  const clearAllFilters = () => {
    setFilters({ waterBath: false, selfLoyly: false, outdoorAir: false, coupleOk: false, open24h: false, lateNight: false, earlyMorning: false });
    const params = new URLSearchParams();
    for (const key of ['region', 'prefecture', 'area', 'sort', 'lat', 'lng', 'locationName']) {
      const val = searchParams.get(key);
      if (val) params.set(key, val);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleRegionChange = (value: string) => {
    trackFilterChange('region', value || 'all');
    updateParams((p) => {
      if (value) { p.set('region', value); } else { p.delete('region'); }
      p.delete('prefecture');
      p.delete('area');
    });
  };

  const handlePrefectureChange = (value: string) => {
    trackFilterChange('prefecture', value || 'all');
    updateParams((p) => {
      if (value) { p.set('prefecture', value); } else { p.delete('prefecture'); }
      p.delete('area');
    });
  };

  const handleAreaChange = (slug: string) => {
    trackFilterChange('area', slug || 'all');
    updateParams((p) => slug ? p.set('area', slug) : p.delete('area'));
  };

  const handleSortChange = (value: string) => {
    trackFilterChange('sort', value);
    updateParams((p) => value === 'recommend' ? p.delete('sort') : p.set('sort', value));
  };

  const handleDurationChange = (value: string) => {
    trackFilterChange('duration', value || 'all');
    updateParams((p) => value ? p.set('duration', value) : p.delete('duration'));
  };

  const handlePriceMaxChange = (value: string) => {
    trackFilterChange('priceMax', value || 'all');
    updateParams((p) => value ? p.set('priceMax', value) : p.delete('priceMax'));
  };

  return (
    <div className="bg-surface border-b border-border flex-shrink-0">
      <div className="max-w-[1440px] mx-auto px-3 md:px-6 h-12 md:h-14 flex items-center gap-2 md:gap-3">
        <Link href="/" aria-label="トップページに戻る" className="md:hidden flex items-center justify-center w-10 h-10 -ml-1 flex-shrink-0" data-track-click="search_back">
          <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        <Link href="/" className="flex items-center gap-1.5 flex-shrink-0">
          <Image src="/saunako-avatar.webp" alt="サウナ子" width={32} height={32} className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover" />
          <span className="hidden md:inline font-bold text-lg text-text-primary">サウナ子</span>
        </Link>

        {locationName && (
          <span className="inline-flex items-center gap-1 px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[12px] md:text-[13px] font-medium bg-primary/10 text-primary border border-primary/20 flex-shrink-0 truncate max-w-[140px] md:max-w-none">
            <svg className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {locationName} 周辺
          </span>
        )}

        <div className="relative inline-flex items-center flex-shrink-0">
          <select
            aria-label="地方選択"
            value={regionCode || ''}
            onChange={(e) => handleRegionChange(e.target.value)}
            className="appearance-none pl-3 pr-7 py-1.5 rounded-full text-[13px] font-medium bg-bg border border-border text-text-primary cursor-pointer"
            data-track-click="region_select"
          >
            <option value="">全国</option>
            {REGION_GROUPS.map((region) => (
              <option key={region.code} value={region.code}>{region.label}</option>
            ))}
          </select>
          {CHEVRON_SVG}
        </div>

        {regionCode && (() => {
          const currentRegion = getRegionByCode(regionCode);
          if (!currentRegion) return null;
          return (
            <div className="relative inline-flex items-center flex-shrink-0">
              <select
                aria-label="都道府県選択"
                value={prefectureCode || ''}
                onChange={(e) => handlePrefectureChange(e.target.value)}
                className="appearance-none pl-3 pr-7 py-1.5 rounded-full text-[13px] font-medium bg-bg border border-border text-text-primary cursor-pointer"
                data-track-click="prefecture_select"
              >
                <option value="">すべて</option>
                {currentRegion.prefectures.map((p) => (
                  <option key={p.code} value={p.code}>{p.label}</option>
                ))}
              </select>
              {CHEVRON_SVG}
            </div>
          );
        })()}

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
          {hasActiveFilters && (
            <button onClick={clearAllFilters} className="text-[13px] text-text-tertiary hover:text-text-secondary transition-colors flex-shrink-0 ml-0.5">
              クリア
            </button>
          )}
        </div>

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

        <p className="text-[13px] font-medium text-text-secondary flex-shrink-0 tabular-nums">
          {filteredCount !== totalCount ? `${filteredCount}/${totalCount}` : filteredCount}件
        </p>

        <button
          onClick={handleShare}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[12px] font-medium border border-border bg-white text-text-secondary hover:border-primary hover:text-primary transition-colors flex-shrink-0"
          aria-label="この条件でシェア"
          data-track-click="share_url"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="hidden md:inline">コピーしました！</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="hidden md:inline">シェア</span>
            </>
          )}
        </button>
      </div>

      <SearchSortBar
        prefectureCode={prefectureCode}
        areaSlug={areaSlug}
        hasOrigin={hasOrigin}
        areaCounts={areaCounts}
        onAreaChange={handleAreaChange}
        onSortChange={handleSortChange}
        onDurationChange={handleDurationChange}
        onPriceMaxChange={handlePriceMaxChange}
      />

      {showFilterSheet && (
        <MobileFilterSheet
          filters={filters}
          filteredCount={filteredCount}
          hasOrigin={hasOrigin}
          onToggleFilter={toggleFilter}
          onSortChange={handleSortChange}
          onDurationChange={handleDurationChange}
          onPriceMaxChange={handlePriceMaxChange}
          onClearAll={clearAllFilters}
          onClose={() => setShowFilterSheet(false)}
        />
      )}
    </div>
  );
}
