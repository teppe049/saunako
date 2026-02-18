import { Suspense } from 'react';
import type { Metadata } from 'next';
import SearchHeaderBar from '@/components/SearchHeaderBar';
import SearchInteractivePanel from '@/components/SearchInteractivePanel';
import { searchFacilities, getAllFacilities, sortFacilities, getAreaBySlug, getAllStations } from '@/lib/facilities';
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
    station?: string;
  }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const prefecture = params.prefecture || '';
  const prefData = PREFECTURES.find((p) => p.code === prefecture);
  const areaSlug = params.area || '';
  const areaData = areaSlug && prefecture ? getAreaBySlug(prefecture, areaSlug) : undefined;

  // Build title
  let title: string;
  if (prefData && areaData) {
    title = `${prefData.label} ${areaData.label}の個室サウナ検索結果`;
  } else if (prefData) {
    title = `${prefData.label}の個室サウナ検索結果`;
  } else {
    title = '個室サウナを条件で検索・比較 | サウナ子';
  }

  // Build description with active filters
  const filterParts: string[] = [];
  const areaLabel = areaData ? `${prefData!.label} ${areaData.label}` : prefData?.label || '全国';
  filterParts.push(areaLabel);
  if (params.priceMin || params.priceMax) {
    const min = params.priceMin ? `${Number(params.priceMin).toLocaleString()}円` : '';
    const max = params.priceMax ? `${Number(params.priceMax).toLocaleString()}円` : '';
    if (min && max) filterParts.push(`${min}〜${max}`);
    else if (min) filterParts.push(`${min}以上`);
    else if (max) filterParts.push(`${max}以下`);
  }
  if (params.capacity) filterParts.push(`${params.capacity}人以上`);
  if (params.waterBath === 'true') filterParts.push('水風呂あり');
  if (params.selfLoyly === 'true') filterParts.push('セルフロウリュ');
  if (params.outdoorAir === 'true') filterParts.push('外気浴');
  if (params.coupleOk === 'true') filterParts.push('カップルOK');

  // Check if any filters are actually applied
  const hasFilters = prefecture || params.priceMin || params.priceMax || params.capacity ||
    params.waterBath === 'true' || params.selfLoyly === 'true' || params.outdoorAir === 'true' || params.coupleOk === 'true';

  const description = hasFilters
    ? `${filterParts.join('・')}の条件で個室サウナを検索。料金・設備・アクセス情報を比較して、あなたにぴったりの施設を見つけよう。`
    : '全国の個室サウナを料金・エリア・設備で検索・比較。水風呂・ロウリュ・外気浴などこだわり条件で、あなたにぴったりの施設を見つけよう。';

  return {
    title,
    description,
    alternates: {
      canonical: 'https://saunako.jp/search',
    },
  };
}

async function SearchContent({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const prefecture = params.prefecture || '';
  const prefData = PREFECTURES.find((p) => p.code === prefecture);
  const areaSlug = params.area || '';
  const areaData = areaSlug && prefecture ? getAreaBySlug(prefecture, areaSlug) : undefined;

  const sortKey = (['recommend', 'price_asc', 'price_desc', 'station_asc', 'newest'].includes(params.sort || '')
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
    station: params.station || undefined,
  });
  const facilities = sortFacilities(filtered, sortKey);

  const allStations = getAllStations();

  const baseCount = prefecture
    ? allFacilities.filter((f) => f.prefecture === prefecture).length
    : allFacilities.length;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'TOP',
        item: 'https://saunako.jp/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '検索結果',
        item: 'https://saunako.jp/search',
      },
    ],
  };

  return (
    <div className="flex flex-col h-screen bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <SearchHeaderBar
        totalCount={baseCount}
        filteredCount={facilities.length}
        prefectureLabel={prefData?.label}
        prefectureCode={prefecture}
        areaSlug={areaSlug}
        station={params.station || ''}
        allStations={allStations}
      />
      <div className="flex-1 min-h-0">
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
