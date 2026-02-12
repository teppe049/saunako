import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SearchFilters from '@/components/SearchFilters';
import SearchInteractivePanel from '@/components/SearchInteractivePanel';
import { searchFacilities, getAllFacilities, sortFacilities, getAreaBySlug } from '@/lib/facilities';
import type { SortKey } from '@/lib/facilities';
import { PREFECTURES } from '@/lib/types';

interface SearchPageProps {
  searchParams: Promise<{
    prefecture?: string;
    priceMin?: string;
    priceMax?: string;
    capacity?: string;
    duration?: string;
    waterBath?: string;
    selfLoyly?: string;
    outdoorAir?: string;
    coupleOk?: string;
    open24h?: string;
    lateNight?: string;
    earlyMorning?: string;
    sort?: string;
    area?: string;
  }>;
}

export const metadata = {
  title: '検索結果 | サウナ子',
  description: '条件に合った個室サウナを検索。料金・設備・エリアで絞り込んで、あなたにぴったりの施設を見つけよう。',
};

async function SearchContent({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const prefecture = params.prefecture || '';
  const prefData = PREFECTURES.find((p) => p.code === prefecture);
  const areaSlug = params.area || '';
  const areaData = areaSlug && prefecture ? getAreaBySlug(prefecture, areaSlug) : undefined;

  const sortKey = (['recommend', 'price_asc', 'price_desc', 'station_asc'].includes(params.sort || '')
    ? params.sort
    : 'recommend') as SortKey;

  const allFacilities = getAllFacilities();
  const filtered = searchFacilities({
    prefecture: prefecture || undefined,
    area: areaData?.label,
    priceMin: params.priceMin ? Number(params.priceMin) : undefined,
    priceMax: params.priceMax ? Number(params.priceMax) : undefined,
    capacity: params.capacity ? Number(params.capacity) : undefined,
    duration: params.duration ? Number(params.duration) : undefined,
    waterBath: params.waterBath === 'true',
    selfLoyly: params.selfLoyly === 'true',
    outdoorAir: params.outdoorAir === 'true',
    coupleOk: params.coupleOk === 'true',
    open24h: params.open24h === 'true',
    lateNight: params.lateNight === 'true',
    earlyMorning: params.earlyMorning === 'true',
  });
  const facilities = sortFacilities(filtered, sortKey);

  const baseCount = prefecture
    ? allFacilities.filter((f) => f.prefecture === prefecture).length
    : allFacilities.length;

  // Build search summary
  const searchSummary = [
    prefData?.label || '全国',
    areaData?.label,
  ].filter(Boolean).join(' ');

  // Build URL to top page with current search params pre-filled
  const searchUrl = `/?${new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v))).toString()}`;

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-surface border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-14 md:h-16 flex items-center justify-between">
          {/* Left: Back button (mobile) + Logo */}
          <div className="flex items-center gap-2 md:gap-2.5">
            <Link href="/" className="md:hidden flex items-center justify-center w-8 h-8">
              <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <Link href="/" className="flex items-center gap-2 md:gap-2.5">
              <Image
                src="/saunako-avatar.png"
                alt="サウナ子"
                width={36}
                height={36}
                className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover"
              />
              <span className="font-bold text-lg md:text-xl text-text-primary">サウナ子</span>
            </Link>
          </div>

          {/* Search Bar - PC only (mobile version is below header) */}
          <Link href={searchUrl} className="hidden md:flex w-[400px] h-10 bg-bg rounded-full px-4 items-center gap-2.5 hover:bg-gray-100 transition-colors cursor-pointer">
            <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-text-secondary text-sm">{searchSummary}</span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button className="hidden md:flex items-center gap-1.5 px-3 py-1.5 md:px-3.5 md:py-2 bg-primary text-white rounded-lg md:rounded-full text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span>地図</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Search Bar */}
      <div className="md:hidden bg-surface border-b border-border px-4 py-3">
        <Link href={searchUrl} className="flex items-center gap-2 bg-bg rounded-full px-4 py-2.5 hover:bg-gray-100 transition-colors">
          <svg className="w-4 h-4 text-text-tertiary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-text-secondary text-sm">{searchSummary}</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex flex-col h-[calc(100vh-112px)] md:h-[calc(100vh-64px)]">
        {/* Filters Header */}
        <div className="bg-surface px-4 md:px-6 py-3 md:py-4 border-b border-border">
          <SearchFilters
            totalCount={baseCount}
            filteredCount={facilities.length}
            prefectureLabel={prefData?.label}
            prefectureCode={prefecture}
            areaSlug={areaSlug}
          />
        </div>

        {/* Interactive List + Map */}
        <SearchInteractivePanel facilities={facilities} />
      </div>
    </div>
  );
}

export default function SearchPage(props: SearchPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-text-tertiary">読み込み中...</p>
      </div>
    }>
      <SearchContent {...props} />
    </Suspense>
  );
}
