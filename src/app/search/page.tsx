import { Suspense } from 'react';
import type { Metadata } from 'next';
import SearchHeaderBar from '@/components/SearchHeaderBar';
import SearchInteractivePanel from '@/components/SearchInteractivePanel';
import { searchFacilities, getAllFacilities, sortFacilities, getAreaBySlug } from '@/lib/facilities';
import type { SortKey } from '@/lib/facilities';
import { PREFECTURES, getRegionByCode } from '@/lib/types';
import { getDistanceKm, formatDistance } from '@/lib/distance';

interface SearchPageProps {
  searchParams: Promise<{
    region?: string;
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
    lat?: string;
    lng?: string;
    locationName?: string;
  }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const regionCode = params.region || '';
  const regionData = regionCode ? getRegionByCode(regionCode) : undefined;
  const prefecture = params.prefecture || '';
  const prefData = PREFECTURES.find((p) => p.code === prefecture);
  const areaSlug = params.area || '';
  const areaData = areaSlug && prefecture ? getAreaBySlug(prefecture, areaSlug) : undefined;

  // Build title
  let title: string;
  if (prefData && areaData) {
    title = `${prefData.label} ${areaData.label}の個室・プライベートサウナ検索結果`;
  } else if (prefData) {
    title = `${prefData.label}の個室・プライベートサウナ検索結果`;
  } else if (regionData) {
    title = `${regionData.label}の個室・プライベートサウナ検索結果`;
  } else {
    title = '個室・プライベートサウナを条件で検索・比較 | サウナ子';
  }

  // Build description with active filters
  const filterParts: string[] = [];
  const areaLabel = areaData ? `${prefData!.label} ${areaData.label}` : prefData?.label || regionData?.label || '全国';
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
    ? `${filterParts.join('・')}の条件で個室・プライベートサウナを検索。料金・設備・アクセス情報を比較して、あなたにぴったりの施設を見つけよう。`
    : '全国の個室・プライベートサウナを料金・エリア・設備で検索・比較。貸切サウナも多数掲載。水風呂・ロウリュ・外気浴などこだわり条件で、あなたにぴったりの施設を見つけよう。';

  return {
    title,
    description,
    robots: { index: false, follow: true },
    alternates: {
      canonical: 'https://www.saunako.jp/search',
    },
    openGraph: {
      title,
      description,
    },
  };
}

async function SearchContent({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const regionCode = params.region || '';
  const regionData = regionCode ? getRegionByCode(regionCode) : undefined;
  const prefecture = params.prefecture || '';
  const prefData = PREFECTURES.find((p) => p.code === prefecture);
  const areaSlug = params.area || '';
  const areaData = areaSlug && prefecture ? getAreaBySlug(prefecture, areaSlug) : undefined;

  const lat = params.lat ? Number(params.lat) : undefined;
  const lng = params.lng ? Number(params.lng) : undefined;
  const origin = lat != null && lng != null && !isNaN(lat) && !isNaN(lng)
    ? { lat, lng }
    : undefined;
  const locationName = params.locationName || undefined;

  const validSortKeys = ['recommend', 'price_asc', 'price_desc', 'station_asc', 'newest', 'distance'];
  const defaultSort = origin ? 'distance' : 'recommend';
  const sortKey = (validSortKeys.includes(params.sort || '')
    ? params.sort
    : defaultSort) as SortKey;

  // Resolve prefecture filter: specific prefecture > region's prefectures > undefined
  const prefectureFilter = prefecture
    ? prefecture
    : regionData
      ? regionData.prefectures.map((p) => p.code)
      : undefined;

  const allFacilities = getAllFacilities();
  const filtered = searchFacilities({
    prefecture: prefectureFilter,
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
  const sorted = sortFacilities(filtered, sortKey, origin);

  // Attach _distance to each facility for client-side display
  const facilities = origin
    ? sorted.map((f) => ({
        ...f,
        _distance: f.lat != null && f.lng != null
          ? formatDistance(getDistanceKm(origin.lat, origin.lng, f.lat, f.lng))
          : undefined,
      }))
    : sorted;

  const baseCount = prefecture
    ? allFacilities.filter((f) => f.prefecture === prefecture).length
    : regionData
      ? allFacilities.filter((f) => regionData.prefectures.some((p) => p.code === f.prefecture)).length
      : allFacilities.length;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'TOP',
        item: 'https://www.saunako.jp/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '検索結果',
        item: 'https://www.saunako.jp/search',
      },
    ],
  };

  const h1Text = prefData && areaData
    ? `${prefData.label} ${areaData.label}の個室サウナ検索結果`
    : prefData
      ? `${prefData.label}の個室サウナ検索結果`
      : regionData
        ? `${regionData.label}の個室サウナ検索結果`
        : '個室サウナ検索';

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${h1Text}`,
    numberOfItems: facilities.length,
    itemListElement: facilities.slice(0, 10).map((f, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: f.name,
      url: `https://www.saunako.jp/facilities/${f.id}`,
    })),
  };

  return (
    <div className="flex flex-col h-screen bg-bg">
      <h1 className="sr-only">{h1Text}</h1>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <SearchHeaderBar
        totalCount={baseCount}
        filteredCount={facilities.length}
        prefectureLabel={prefData?.label}
        prefectureCode={prefecture}
        regionCode={regionCode}
        areaSlug={areaSlug}
        locationName={locationName}
        hasOrigin={!!origin}
      />
      <div className="flex flex-col flex-1 min-h-0">
        <SearchInteractivePanel facilities={facilities} hasOrigin={!!origin} origin={origin} />
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
