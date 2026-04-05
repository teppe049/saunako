'use client';

import { useSearchParams } from 'next/navigation';
import { AREA_GROUPS } from '@/lib/types';

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

interface SearchSortBarProps {
  prefectureCode?: string;
  areaSlug?: string;
  hasOrigin?: boolean;
  areaCounts?: Record<string, number>;
  onAreaChange: (slug: string) => void;
  onSortChange: (value: string) => void;
  onDurationChange: (value: string) => void;
  onPriceMaxChange: (value: string) => void;
}

export default function SearchSortBar({
  prefectureCode,
  areaSlug,
  hasOrigin,
  areaCounts = {},
  onAreaChange,
  onSortChange,
  onDurationChange,
  onPriceMaxChange,
}: SearchSortBarProps) {
  const searchParams = useSearchParams();
  const showAreaRow = prefectureCode && AREA_GROUPS[prefectureCode];
  const areas = prefectureCode ? AREA_GROUPS[prefectureCode] : undefined;

  return (
    <div className="max-w-[1440px] mx-auto px-3 md:px-6 h-10 flex items-center gap-2 border-t border-border/50">
      {showAreaRow && areas ? (
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide flex-1 min-w-0 md:flex-wrap">
          <button
            aria-label="すべてのエリアを表示"
            aria-pressed={!areaSlug}
            onClick={() => onAreaChange('')}
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
              aria-label={`${area.label}エリアで絞り込み`}
              aria-pressed={areaSlug === area.slug}
              onClick={() => onAreaChange(area.slug)}
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
      ) : (
        <div className="flex-1" />
      )}

      <div className="hidden md:flex items-center gap-2 flex-shrink-0">
        <div className="relative inline-flex items-center">
          <select
            aria-label="並び順"
            value={searchParams.get('sort') || 'price_asc'}
            onChange={(e) => onSortChange(e.target.value)}
            className="appearance-none pl-3 pr-7 py-1 border border-border rounded-md text-[12px] md:text-[13px] text-text-secondary bg-white cursor-pointer"
          >
            <option value="price_asc">安い順</option>
            <option value="price_desc">高い順</option>
            {hasOrigin && <option value="distance">近い順</option>}
          </select>
          {CHEVRON_SVG}
        </div>

        <div className="relative inline-flex items-center">
          <select
            aria-label="利用時間"
            value={searchParams.get('duration') || ''}
            onChange={(e) => onDurationChange(e.target.value)}
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

        <div className="relative inline-flex items-center">
          <select
            aria-label="予算"
            value={searchParams.get('priceMax') || ''}
            onChange={(e) => onPriceMaxChange(e.target.value)}
            className="appearance-none pl-3 pr-7 py-1 border border-border rounded-md text-[12px] md:text-[13px] text-text-secondary bg-white cursor-pointer"
          >
            <option value="">予算</option>
            <option value="3000">〜3,000円</option>
            <option value="5000">〜5,000円</option>
            <option value="10000">〜10,000円</option>
            <option value="15000">〜15,000円</option>
            <option value="20000">〜20,000円</option>
          </select>
          {CHEVRON_SVG}
        </div>
      </div>
    </div>
  );
}
