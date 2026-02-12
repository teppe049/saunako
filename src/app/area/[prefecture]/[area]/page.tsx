import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { PREFECTURES, AREA_GROUPS } from '@/lib/types';
import { getFacilitiesByArea, getAreaBySlug, getAllPrefectures, getAreaFacilityCounts } from '@/lib/facilities';
import Header from '@/components/Header';
import ScrollToTop from '@/components/ScrollToTop';
import AreaFilters from '../AreaFilters';

interface PageProps {
  params: Promise<{ prefecture: string; area: string }>;
}

// エリアごとのサウナ子コメント
const SAUNAKO_SUB_AREA_COMMENTS: Record<string, string> = {
  'tokyo/shinjuku-minato': '新宿・港区・銀座エリアは個室サウナの激戦区！駅チカで仕事帰りにサクッと整えるのが最高よ。',
  'tokyo/shibuya-setagaya': '渋谷・世田谷エリアはおしゃれな施設が多いわ。住宅街に隠れた穴場も要チェック！',
  'tokyo/ueno-asakusa': '上野・浅草エリアは下町情緒あふれるサウナが魅力。コスパ抜群の施設が多いのよ！',
  'tokyo/ikebukuro': '池袋・赤羽エリアはアクセス抜群の施設がそろってるわ。',
  'tokyo/shinagawa': '品川エリアにはこだわりの施設が集中してるの。',
};

const DEFAULT_SUB_AREA_COMMENT = 'このエリアのおすすめ個室サウナを紹介するわね。';

export async function generateStaticParams() {
  const prefectures = getAllPrefectures();
  const params: { prefecture: string; area: string }[] = [];
  for (const pref of prefectures) {
    const areas = AREA_GROUPS[pref] || [];
    for (const area of areas) {
      params.push({ prefecture: pref, area: area.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { prefecture, area: areaSlug } = await params;
  const prefData = PREFECTURES.find((p) => p.code === prefecture);
  const areaData = getAreaBySlug(prefecture, areaSlug);

  if (!prefData || !areaData) {
    return { title: 'Not Found' };
  }

  const prefLabel = prefData.label;
  const areaLabel = areaData.label;
  const cities = areaData.cities;

  return {
    title: `${prefLabel} ${areaLabel}の個室サウナ一覧`,
    description: `${prefLabel}${areaLabel}エリア（${cities.join('・')}）の個室サウナを比較・検索。`,
  };
}

export default async function SubAreaPage({ params }: PageProps) {
  const { prefecture, area: areaSlug } = await params;

  const prefData = PREFECTURES.find((p) => p.code === prefecture);
  if (!prefData) {
    notFound();
  }

  const areaData = getAreaBySlug(prefecture, areaSlug);
  if (!areaData) {
    notFound();
  }

  const prefLabel = prefData.label;
  const areaLabel = areaData.label;
  const areaGroups = AREA_GROUPS[prefecture] || [];
  const facilities = getFacilitiesByArea(prefecture, areaLabel);
  const saunakoComment = SAUNAKO_SUB_AREA_COMMENTS[`${prefecture}/${areaSlug}`] || DEFAULT_SUB_AREA_COMMENT;
  const areaCounts = getAreaFacilityCounts(prefecture);
  const allFacilitiesCount = Object.values(areaCounts).reduce((sum, c) => sum + c, 0);

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-8">
        {/* Breadcrumb - 2 levels only */}
        <nav className="text-sm text-text-secondary mb-6">
          <Link href="/" className="hover:text-primary transition-colors">TOP</Link>
          <span className="mx-2">{'>'}</span>
          <Link href={`/area/${prefecture}`} className="hover:text-primary transition-colors">{prefLabel}</Link>
        </nav>

        {/* Prefecture Navigation - same as prefecture page */}
        <div className="flex gap-2 mb-6">
          {PREFECTURES.map((pref) => (
            <Link
              key={pref.code}
              href={`/area/${pref.code}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                pref.code === prefecture
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-border text-text-secondary hover:border-primary hover:text-primary'
              }`}
            >
              {pref.label}
            </Link>
          ))}
        </div>

        {/* Area Chips - with "すべて" + all areas, current area active */}
        {areaGroups.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <Link
              href={`/area/${prefecture}`}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors bg-surface border border-border text-text-secondary hover:border-primary hover:text-primary"
            >
              すべて ({allFacilitiesCount})
            </Link>
            {areaGroups.map((area) => (
              <Link
                key={area.slug}
                href={`/area/${prefecture}/${area.slug}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  area.slug === areaSlug
                    ? 'bg-primary text-white'
                    : 'bg-surface border border-border text-text-secondary hover:border-primary hover:text-primary'
                }`}
              >
                {area.label} ({areaCounts[area.slug] || 0})
              </Link>
            ))}
          </div>
        )}

        {/* Area Header */}
        <div className="bg-surface border border-border rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
                {prefLabel}の個室サウナ
              </h1>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 bg-primary-light text-primary rounded-full text-sm font-semibold">
                  {facilities.length}件の施設
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Saunako Comment Section */}
        <div className="saunako-comment mb-8">
          <div className="flex items-start gap-3">
            <Image
              src="/saunako-avatar.png"
              alt="サウナ子"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-saunako font-bold">サウナ子</span>
                <span className="text-xs text-text-tertiary">からのひとこと</span>
              </div>
              <p className="text-text-primary leading-relaxed">
                {saunakoComment}
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Facility List (Client Component) */}
        <Suspense fallback={
          <div className="animate-pulse">
            <div className="bg-surface border border-border rounded-xl h-16 mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-surface border border-border rounded-xl h-64"></div>
              ))}
            </div>
          </div>
        }>
          <AreaFilters
            facilities={facilities}
            prefectureLabel={areaLabel}
          />
        </Suspense>
      </main>
      <ScrollToTop />
    </div>
  );
}
