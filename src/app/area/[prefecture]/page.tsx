import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import { getFacilitiesByPrefecture, getAllPrefectures, getAreaFacilityCounts } from '@/lib/facilities';
import { PREFECTURES, AREA_GROUPS, Facility } from '@/lib/types';
import dynamic from 'next/dynamic';
const ScrollToTop = dynamic(() => import('@/components/ScrollToTop'));
import AreaFilters from './AreaFilters';

interface PageProps {
  params: Promise<{ prefecture: string }>;
}

// 都道府県ごとのサウナ子コメント
const SAUNAKO_AREA_COMMENTS: Record<string, string> = {
  tokyo: '東京は個室サウナの激戦区! 新宿・渋谷・池袋を中心に、こだわりの施設がたくさんあるわ。駅チカで仕事帰りにサクッと整えるのがおすすめよ。',
  osaka: '大阪は東京に負けないくらい個室サウナが充実してきてるわ! 梅田・心斎橋エリアを中心に、コスパ抜群の施設が多いのが特徴ね。',
  kanagawa: '神奈川は横浜・川崎を中心に個室サウナが増えてきてるわ！都内からのアクセスも良いから、休日にゆっくり整うのにぴったりよ。',
  saitama: '埼玉は大宮・浦和エリアを中心に、コスパ抜群の個室サウナがそろってるわ。都心より広々とした施設が多いのが魅力ね！',
  chiba: '千葉は船橋・浦安エリアを中心に、個性豊かな個室サウナが点在してるの。東京のベッドタウンだからアクセスも便利よ。',
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
    alternates: {
      canonical: `https://saunako.jp/area/${prefecture}`,
    },
  };
}

function generateFaqData(facilities: Facility[], areaLabel: string) {
  const pricedFacilities = facilities.filter(f => f.priceMin > 0);
  const avgPrice = pricedFacilities.length > 0
    ? Math.round(pricedFacilities.reduce((sum, f) => sum + f.priceMin, 0) / pricedFacilities.length / 100) * 100
    : null;

  const popularNames = facilities
    .filter(f => f.images.length > 0)
    .slice(0, 3)
    .map(f => f.name);

  const coupleNames = facilities
    .filter(f => f.features.coupleOk)
    .slice(0, 3)
    .map(f => f.name);

  const faqs: { question: string; answer: string }[] = [];

  if (avgPrice) {
    faqs.push({
      question: `${areaLabel}の個室サウナの料金相場は？`,
      answer: `${areaLabel}の個室サウナの料金相場は1時間あたり約${avgPrice.toLocaleString()}円です。最安値は${Math.min(...pricedFacilities.map(f => f.priceMin)).toLocaleString()}円〜となっています。`,
    });
  }

  if (popularNames.length > 0) {
    faqs.push({
      question: `${areaLabel}で人気の個室サウナは？`,
      answer: `${areaLabel}で人気の個室サウナは${popularNames.join('、')}などがあります。それぞれ特徴が異なるので、設備や料金を比較して選ぶのがおすすめです。`,
    });
  }

  if (coupleNames.length > 0) {
    faqs.push({
      question: `${areaLabel}でカップルで利用できる個室サウナは？`,
      answer: `${areaLabel}でカップル（男女）で利用できる個室サウナは${coupleNames.join('、')}などがあります。事前予約がおすすめです。`,
    });
  }

  return faqs;
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
        name: prefData.label,
        item: `https://saunako.jp/area/${prefecture}`,
      },
    ],
  };

  // FAQ JSON-LD
  const faqItems = generateFaqData(facilities, prefData.label);
  const faqJsonLd = faqItems.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  } : null;

  // ItemList JSON-LD
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${prefData.label}の個室サウナ一覧`,
    numberOfItems: facilities.length,
    itemListElement: facilities.slice(0, 10).map((f, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: f.name,
      url: `https://saunako.jp/facilities/${f.id}`,
    })),
  };

  return (
    <div className="min-h-screen bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
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
              src="/saunako-avatar.webp"
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

        {/* FAQ Section */}
        {(() => {
          const faqs = generateFaqData(facilities, prefData.label);
          if (faqs.length === 0) return null;
          return (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-text-primary mb-4">よくある質問</h2>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <details key={i} className="bg-surface border border-border rounded-xl overflow-hidden group">
                    <summary className="px-5 py-4 cursor-pointer text-text-primary font-medium hover:bg-gray-50 transition-colors flex items-center justify-between">
                      <span>{faq.question}</span>
                      <svg className="w-5 h-5 text-text-tertiary flex-shrink-0 ml-2 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-5 pb-4 text-text-secondary text-sm leading-relaxed">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          );
        })()}

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
