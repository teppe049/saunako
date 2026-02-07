import { Suspense } from 'react';
import Header from '@/components/Header';
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

  return (
    <>
      {/* Search Bar */}
      <div className="bg-surface border-b border-border py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex-1 flex items-center gap-2 bg-bg rounded-lg px-4 py-2">
              <svg className="w-5 h-5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-text-secondary">
                {prefData ? `${prefData.label}の個室サウナ` : '全国の個室サウナ'}
              </span>
            </div>
            <select
              className="border border-border rounded-lg px-3 py-2 text-sm"
              defaultValue={prefecture}
            >
              <option value="">全国</option>
              {PREFECTURES.map((pref) => (
                <option key={pref.code} value={pref.code}>
                  {pref.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-4">
          <p className="text-text-secondary">
            {prefData ? `${prefData.label}で` : ''}
            {facilities.length}件のプライベートサウナが見つかりました
          </p>
        </div>

        {/* Filters */}
        <SearchFilters totalCount={baseCount} filteredCount={facilities.length} />

        {/* Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Facility List */}
          <div className="space-y-4 order-2 lg:order-1">
            {facilities.map((facility, index) => (
              <FacilityListCard key={facility.id} facility={facility} index={index} />
            ))}

            {facilities.length === 0 && (
              <div className="card p-8 text-center">
                <div className="text-4xl mb-4">🧖</div>
                <p className="text-text-secondary mb-4">
                  この条件に合う施設が見つかりませんでした
                </p>
                <p className="text-sm text-text-tertiary">
                  条件を変更して再検索してみてください
                </p>
              </div>
            )}
          </div>

          {/* Right: Map */}
          <div className="h-64 lg:h-auto lg:min-h-[600px] lg:sticky lg:top-6 order-1 lg:order-2">
            <FacilityMap facilities={facilities} />
          </div>
        </div>
      </div>
    </>
  );
}

export default function SearchPage(props: SearchPageProps) {
  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <Suspense fallback={<div className="p-8 text-center">読み込み中...</div>}>
        <SearchContent {...props} />
      </Suspense>
    </div>
  );
}
