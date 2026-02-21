import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { PREFECTURES, AREA_GROUPS, Facility } from '@/lib/types';
import { getFacilitiesByArea, getAreaBySlug, getAllPrefectures, getAreaFacilityCounts } from '@/lib/facilities';
import Header from '@/components/Header';
import dynamic from 'next/dynamic';
const ScrollToTop = dynamic(() => import('@/components/ScrollToTop'));
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
  // osaka
  'osaka/kita': '梅田・北区エリアは大阪の玄関口！仕事帰りやショッピングのついでにサクッと整えるのが最高よ。',
  'osaka/minami': '心斎橋・なんばエリアはおしゃれな個室サウナが集まるホットスポット！遊びの前後に立ち寄りやすいわ。',
  'osaka/other': '大阪郊外にも隠れた名店があるわ。都心部とは違ったゆったり感を楽しめるのよ。',
  // kanagawa
  'kanagawa/yokohama': '横浜エリアは港町の雰囲気を感じながらサウナを楽しめるのが魅力！おしゃれな施設が多いわよ。',
  'kanagawa/kawasaki': '川崎エリアは都内からすぐアクセスできるのに、リーズナブルな施設が多いのがうれしいポイントね。',
  'kanagawa/other': '神奈川郊外にも魅力的な施設があるの。ドライブがてら足を延ばしてみて。',
  // saitama
  'saitama/urawa-omiya': '大宮・浦和エリアはターミナル駅から近い施設が充実してるわ。仕事帰りにも立ち寄りやすいのよ。',
  'saitama/kawaguchi-warabi': '川口・蕨エリアは東京の北の玄関口。都内に比べてゆったり過ごせる施設が多いわ。',
  'saitama/other': '埼玉郊外には自然に囲まれた施設もあるの。都心の喧騒を忘れてリフレッシュできるわよ。',
  // chiba
  'chiba/funabashi-ichikawa': '船橋・市川エリアは都心からのアクセス抜群！駅チカの便利な施設がそろってるわ。',
  'chiba/urayasu-ichikawa': '浦安エリアはリゾート感のある施設が魅力的。非日常を味わいたい方におすすめよ。',
  'chiba/matsudo-kashiwa': '松戸・柏エリアは常磐線沿線のアクセス便利な施設がポイント。地元の人にも人気なのよ。',
  'chiba/other': '千葉郊外には海の近くの施設もあるわ。サウナと海の組み合わせ、最高よ！',
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

  const title = `${prefLabel} ${areaLabel}の個室サウナ一覧`;
  const description = `${prefLabel}${areaLabel}エリア（${cities.join('・')}）の個室サウナを比較・検索。`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://saunako.jp/area/${prefecture}/${areaSlug}`,
    },
    openGraph: {
      title,
      description,
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
        name: prefLabel,
        item: `https://saunako.jp/area/${prefecture}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: areaLabel,
        item: `https://saunako.jp/area/${prefecture}/${areaSlug}`,
      },
    ],
  };

  // FAQ JSON-LD
  const faqItems = generateFaqData(facilities, areaLabel);
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
          <Link href={`/area/${prefecture}`} className="hover:text-primary transition-colors">{prefLabel}</Link>
          <span className="mx-2">{'>'}</span>
          <span className="text-text-primary">{areaLabel}</span>
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

        {/* FAQ Section */}
        {(() => {
          const faqs = generateFaqData(facilities, areaLabel);
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
            prefectureLabel={areaLabel}
          />
        </Suspense>
      </main>
      <ScrollToTop />
    </div>
  );
}
