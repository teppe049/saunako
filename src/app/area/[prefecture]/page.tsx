import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import { getFacilitiesByPrefecture, getAllPrefectures, getAreaFacilityCounts } from '@/lib/facilities';
import { PREFECTURES, AREA_GROUPS } from '@/lib/types';
import ScrollToTop from '@/components/ScrollToTop';
import AreaFilters from './AreaFilters';

interface PageProps {
  params: Promise<{ prefecture: string }>;
}

// 都道府県ごとのサウナ子コメント
const SAUNAKO_AREA_COMMENTS: Record<string, string> = {
  tokyo: '東京は個室サウナの激戦区! 新宿・渋谷・池袋を中心に、こだわりの施設がたくさんあるわ。駅チカで仕事帰りにサクッと整えるのがおすすめよ。',
  osaka: '大阪は東京に負けないくらい個室サウナが充実してきてるわ! 梅田・心斎橋エリアを中心に、コスパ抜群の施設が多いのが特徴ね。',
};

// デフォルトのサウナ子コメント
const DEFAULT_SAUNAKO_COMMENT = 'このエリアの個室サウナをまとめてみたわ! 気になる施設があったらチェックしてみてね。';

export async function generateStaticParams() {
  const prefectures = getAllPrefectures();
  return prefectures.map((prefecture) => ({ prefecture }));
}

export async function generateMetadata({ params }: PageProps) {
  const { prefecture } = await params;
  const prefData = PREFECTURES.find((p) => p.code === prefecture);
  if (!prefData) return { title: 'Not Found' };

  return {
    title: `${prefData.label}の個室サウナ一覧 | サウナ子`,
    description: `${prefData.label}の個室サウナを探すならサウナ子。料金・設備・アクセスを比較して、あなたにぴったりの施設を見つけよう。`,
  };
}

export default async function AreaPage({ params }: PageProps) {
  const { prefecture } = await params;
  const prefData = PREFECTURES.find((p) => p.code === prefecture);

  if (!prefData) {
    notFound();
  }

  const facilities = getFacilitiesByPrefecture(prefecture);
  const saunakoComment = SAUNAKO_AREA_COMMENTS[prefecture] || DEFAULT_SAUNAKO_COMMENT;
  const areaGroups = AREA_GROUPS[prefecture] || [];
  const areaCounts = getAreaFacilityCounts(prefecture);

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-text-secondary mb-6">
          <Link href="/" className="hover:text-primary transition-colors">TOP</Link>
          <span className="mx-2">{'>'}</span>
          <span className="text-text-primary">{prefData.label}</span>
        </nav>

        {/* Area Navigation */}
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

        {/* Area Chips */}
        {areaGroups.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="px-4 py-2 rounded-full text-sm font-medium bg-primary text-white">
              すべて ({facilities.length})
            </span>
            {areaGroups.map((area) => (
              <Link
                key={area.slug}
                href={`/area/${prefecture}/${area.slug}`}
                className="px-4 py-2 rounded-full text-sm font-medium transition-colors bg-surface border border-border text-text-secondary hover:border-primary hover:text-primary"
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
                {prefData.label}の個室サウナ
              </h1>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 bg-primary-light text-primary rounded-full text-sm font-semibold">
                  {facilities.length}件の施設
                </span>
                <span className="text-sm text-text-tertiary">
                  最終更新: {new Date().toLocaleDateString('ja-JP')}
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
            prefectureLabel={prefData.label}
          />
        </Suspense>
      </main>
      <ScrollToTop />
    </div>
  );
}
