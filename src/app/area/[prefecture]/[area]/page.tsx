import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { PREFECTURES, AREA_GROUPS, Facility } from '@/lib/types';
import { getFacilitiesByArea, getAreaBySlug, getAllPrefectures, getAreaFacilityCounts } from '@/lib/facilities';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';
const ScrollToTop = dynamic(() => import('@/components/ScrollToTop'));
import AreaFilters from '../AreaFilters';
import { SAUNAKO_SUB_AREA_COMMENTS, DEFAULT_SUB_AREA_COMMENT, SUB_AREA_META, SUB_AREA_GUIDES } from '@/lib/subAreaMeta';
import { getArticlesByFacilityId } from '@/lib/articles';
import ArticleCard from '@/components/ArticleCard';
import AreaCompareTable from '@/components/AreaCompareTable';
import AskAI from '@/components/AskAI';

interface PageProps {
  params: Promise<{ prefecture: string; area: string }>;
}

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

  const customMeta = SUB_AREA_META[`${prefecture}/${areaSlug}`];
  const title = customMeta?.title ?? `${prefLabel} ${areaLabel}の個室サウナ一覧`;
  const description = customMeta?.description ?? `${prefLabel}${areaLabel}エリア（${cities.join('・')}）の個室サウナを比較・検索。`;
  // SUB_AREA_META の title は末尾に「| サウナ子」を含むが、フォールバックは含まない。
  // template（%s | サウナ子）と併用すると前者だけ二重化するため、既に含む場合のみ absolute にする（Issue #167）
  const titleMeta = /\|\s*サウナ子\s*$/.test(title) ? { absolute: title } : title;

  return {
    title: titleMeta,
    description,
    alternates: {
      canonical: `https://www.saunako.jp/area/${prefecture}/${areaSlug}`,
    },
    openGraph: {
      title,
      description,
    },
  };
}

function generateFaqData(facilities: Facility[], areaLabel: string, areaKey?: string) {
  const pricedFacilities = facilities.filter(f => f.priceMin > 0);
  // priceMin は「duration 分の室料」で1時間あたりではない。宿泊など duration=0 の施設を
  // 平均に混ぜると実態から外れる（池袋は19,800円の宿泊プランで平均が9,200→5,700円にずれていた）。
  const comparable = pricedFacilities.filter(f => f.duration > 0);
  const avgPrice = comparable.length > 0
    ? Math.round(comparable.reduce((sum, f) => sum + f.priceMin, 0) / comparable.length / 100) * 100
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
      answer: `${areaLabel}の個室サウナは、各施設の最短利用プランの平均で約${avgPrice.toLocaleString()}円です（利用時間は施設ごとに異なります）。最安値は${Math.min(...comparable.map(f => f.priceMin)).toLocaleString()}円〜となっています。`,
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

  // サブエリア固有のFAQをマージ（検索意図に刺さるQ&Aで情報量とCTRを底上げ）
  const extraFaqs = areaKey ? SUB_AREA_GUIDES[areaKey]?.extraFaqs ?? [] : [];
  faqs.push(...extraFaqs);

  return faqs;
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
  const areaKey = `${prefecture}/${areaSlug}`;
  const saunakoComment = SAUNAKO_SUB_AREA_COMMENTS[areaKey] || DEFAULT_SUB_AREA_COMMENT;
  const areaCounts = getAreaFacilityCounts(prefecture);
  const allFacilitiesCount = Object.values(areaCounts).reduce((sum, c) => sum + c, 0);

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
        name: prefLabel,
        item: `https://www.saunako.jp/area/${prefecture}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: areaLabel,
        item: `https://www.saunako.jp/area/${prefecture}/${areaSlug}`,
      },
    ],
  };

  // FAQ JSON-LD
  const faqItems = generateFaqData(facilities, areaLabel, areaKey);
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
    name: `${areaLabel}の個室サウナ一覧`,
    numberOfItems: facilities.length,
    itemListElement: facilities.slice(0, 10).map((f, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: f.name,
      url: `https://www.saunako.jp/facilities/${f.id}`,
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
          <Link href={`/area/${prefecture}`} className="hover:text-primary transition-colors">{prefLabel}</Link>
          <span className="mx-2">{'>'}</span>
          <span className="text-text-primary">{areaLabel}</span>
        </nav>

        {/* Prefecture Navigation - same as prefecture page */}
        <div className="flex flex-wrap gap-2 mb-6">
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
                {prefLabel} {areaLabel}の個室サウナ
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

        {/* エリア内の料金比較表（検索から来た人が最初に見る比較軸） */}
        <AreaCompareTable facilities={facilities} areaLabel={areaLabel} />

        {/* FAQ Section */}
        {(() => {
          const faqs = faqItems;
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
        <div id="facility-list" className="scroll-mt-20" />
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

        {/* 近くのエリア（同一都道府県の他サブエリアへ回遊させる） */}
        {(() => {
          const neighbors = areaGroups
            .filter((a) => a.slug !== areaSlug && (areaCounts[a.slug] ?? 0) > 0)
            .slice(0, 6);
          if (neighbors.length === 0) return null;
          return (
            <section className="mt-12 mb-8">
              <h2 className="text-xl font-bold text-text-primary mb-4">{prefLabel}の近くのエリア</h2>
              <div className="flex flex-wrap gap-2">
                {neighbors.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/area/${prefecture}/${a.slug}`}
                    className="px-4 py-2 bg-surface border border-border rounded-full text-sm text-text-primary hover:border-primary hover:text-primary transition-colors"
                  >
                    {a.label}
                    <span className="text-text-tertiary ml-1">{areaCounts[a.slug]}</span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })()}

        {/* エリア関連記事 */}
        {(() => {
          const areaArticles = [...new Map(
            facilities.flatMap((f) => getArticlesByFacilityId(f.id)).map((a) => [a.slug, a])
          ).values()].slice(0, 3);
          if (areaArticles.length === 0) return null;
          return (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-text-primary mb-4">{areaLabel}の個室サウナに関する記事</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {areaArticles.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            </section>
          );
        })()}

        <AskAI
          context={{ kind: 'subArea', prefecture, prefectureLabel: prefLabel, areaSlug, areaLabel }}
          className="mb-8"
        />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
