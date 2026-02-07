import { Suspense } from 'react';
import Link from 'next/link';
import SearchFilters from '@/components/SearchFilters';
import FacilityListCard from '@/components/FacilityListCard';
import FacilityMap from '@/components/FacilityMap';
import { searchFacilities, getAllFacilities } from '@/lib/facilities';
import { PREFECTURES } from '@/lib/types';

interface SearchPageProps {
  searchParams: Promise<{
    prefecture?: string;
    waterBath?: string;
    selfLoyly?: string;
    outdoorAir?: string;
    coupleOk?: string;
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

  const allFacilities = getAllFacilities();
  const facilities = searchFacilities({
    prefecture: prefecture || undefined,
    waterBath: params.waterBath === 'true',
    selfLoyly: params.selfLoyly === 'true',
    outdoorAir: params.outdoorAir === 'true',
    coupleOk: params.coupleOk === 'true',
  });

  const baseCount = prefecture
    ? allFacilities.filter((f) => f.prefecture === prefecture).length
    : allFacilities.length;

  // Build search summary
  const searchSummary = [
    prefData?.label || '全国',
  ].filter(Boolean).join('・');

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-surface border-b border-border">
        <div className="max-w-[1440px] mx-auto px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-[#FF8A80] flex items-center justify-center">
              <span className="text-white text-xl">♨</span>
            </div>
            <span className="font-bold text-xl text-text-primary">サウナ子</span>
          </Link>

          {/* Search Bar */}
          <div className="w-[400px] h-10 bg-bg rounded-full px-4 flex items-center gap-2.5">
            <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-text-secondary text-sm">{searchSummary}</span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 px-3.5 py-2 bg-primary text-white rounded-full text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span>地図</span>
            </button>
            <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Panel - Results */}
        <div className="w-[820px] bg-surface flex flex-col overflow-hidden">
          {/* Filters Header */}
          <div className="p-6 border-b border-border">
            <SearchFilters
              totalCount={baseCount}
              filteredCount={facilities.length}
              prefectureLabel={prefData?.label}
            />
          </div>

          {/* Cards List */}
          <div className="flex-1 overflow-y-auto">
            {facilities.map((facility, index) => (
              <FacilityListCard key={facility.id} facility={facility} index={index} />
            ))}

            {facilities.length === 0 && (
              <div className="p-12 text-center">
                <div className="text-5xl mb-4">🧖</div>
                <p className="text-text-secondary mb-2">
                  この条件に合う施設が見つかりませんでした
                </p>
                <p className="text-sm text-text-tertiary">
                  条件を変更して再検索してみてください
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className="flex-1 bg-surface shadow-[-1px_0_3px_rgba(0,0,0,0.03)]">
          <FacilityMap facilities={facilities} />
        </div>
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
