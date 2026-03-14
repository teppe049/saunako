import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSearchForm from '@/components/HeroSearchForm';
import ArticleCard from '@/components/ArticleCard';
import dynamic from 'next/dynamic';
import { getPopularFacilities, getAllFacilities, getNewFacilities } from '@/lib/facilities';
import { getAllArticles } from '@/lib/articles';
import type { Metadata } from 'next';
const ScrollToTop = dynamic(() => import('@/components/ScrollToTop'));
const RecentlyViewed = dynamic(() => import('@/components/RecentlyViewed'));

export const metadata: Metadata = {
  title: 'サウナ子 | 個室サウナおすすめ全国393施設を比較・検索｜プライベートサウナ',
  description: '全国47都道府県393施設以上の個室サウナ・プライベートサウナを料金・設備・エリアで比較検索。東京・大阪・名古屋・福岡のおすすめ施設から、カップルOK・24時間営業・セルフロウリュ付きまで。あなたにぴったりの個室サウナが見つかるポータルサイト。',
  alternates: { canonical: 'https://www.saunako.jp/' },
};

const FEATURED_ARTICLE_SLUGS = [
  'private-sauna-beginners-guide',
  'couple-private-sauna',
  'cheap-private-sauna',
  'osusume-private-sauna',
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '個室サウナの料金相場はいくらですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '個室サウナの料金は1時間あたり1,000円〜8,000円程度が相場です。平日・オフピークは割安になる施設が多く、2人以上で割り勘すればさらにお得に利用できます。',
      },
    },
    {
      '@type': 'Question',
      name: '個室サウナはカップルで利用できますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい、全国の個室サウナの約8割が男女一緒に利用可能です。完全貸切のプライベート空間なので、カップルのサウナデートにも人気です。',
      },
    },
    {
      '@type': 'Question',
      name: '個室サウナと普通のサウナの違いは何ですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '個室サウナは完全貸切のプライベート空間で、サウナ・水風呂・休憩スペースを独占できます。他のお客さんを気にせず、自分のペースでロウリュや温度調整ができるのが最大の魅力です。',
      },
    },
    {
      '@type': 'Question',
      name: '個室サウナに必要な持ち物はありますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '多くの個室サウナではタオル・シャンプー・ドライヤーなどのアメニティが用意されています。手ぶらで利用できる施設がほとんどですが、予約時に確認すると安心です。',
      },
    },
    {
      '@type': 'Question',
      name: '駅近の個室サウナはありますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい、サウナ子に掲載されている多くの施設が駅から徒歩10分以内です。高輪SAUNAS（高輪ゲートウェイ駅直結）など、アクセス抜群の個室サウナを検索条件で絞り込めます。',
      },
    },
    {
      '@type': 'Question',
      name: '個室サウナを安く利用する方法はありますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '平日割引やショートプラン（30分〜）を活用すると、1時間あたり3,000円以下で利用できる施設もあります。2人以上で割り勘すればさらにお得です。サウナ子で料金を比較して、予算に合った個室サウナを見つけましょう。',
      },
    },
    {
      '@type': 'Question',
      name: '24時間営業の個室サウナはありますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい、24時間営業やほぼ24時間利用可能な個室サウナもあります。深夜や早朝にサウナを楽しみたい方は、サウナ子の検索で営業時間を確認できます。',
      },
    },
    {
      '@type': 'Question',
      name: '個室サウナは予約なしでも利用できますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '多くの個室サウナは完全予約制です。当日予約OKの施設もありますが、特に週末は混雑するため事前予約がおすすめです。各施設の予約方法はサウナ子の施設ページで確認できます。',
      },
    },
  ],
};

export default function Home() {
  const popularFacilities = getPopularFacilities(3);
  const newFacilities = getNewFacilities(3);
  const allFacilities = getAllFacilities();
  const allArticles = getAllArticles();
  const featuredArticles = FEATURED_ARTICLE_SLUGS
    .map((slug) => allArticles.find((a) => a.slug === slug))
    .filter((a): a is NonNullable<typeof a> => a != null);

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      {/* Hero Section */}
      <section className="bg-surface py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-5 md:px-20">
          <div className="text-center mb-6 md:mb-10">
            <h1 className="text-[28px] leading-[1.3] md:text-[40px] md:leading-tight font-bold text-text-primary mb-4">
              全国の個室サウナを比較・検索
            </h1>
            <p className="text-text-tertiary md:text-text-secondary text-sm md:text-base">
              全国47都道府県・{allFacilities.length}施設以上を掲載中
            </p>
          </div>

          {/* Saunako Comment */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="bg-saunako-bg border border-saunako-border rounded-[12px] md:rounded-xl px-4 py-3 md:px-5 md:py-4 flex items-start gap-2.5 md:gap-3">
              <Image
                src="/saunako-avatar.webp"
                alt="サウナ子"
                width={40}
                height={40}
                priority
                className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
              />
              <p className="text-sm text-text-primary leading-relaxed pt-2">
                今日はどんなサウナをお探し？条件を教えて、ぴったりの施設を見つけるね！
              </p>
            </div>
          </div>

          {/* Search Form */}
          <HeroSearchForm />
        </div>
      </section>

      {/* About Private Sauna Section */}
      <section className="bg-muted/50 py-6 md:py-10">
        <div className="max-w-3xl mx-auto px-5 md:px-20">
          <h2 className="text-lg md:text-xl font-bold text-text-primary mb-3">個室サウナとは？</h2>
          <p className="text-sm md:text-base text-text-secondary leading-relaxed">
            個室サウナは、サウナ・水風呂・外気浴スペースを完全貸切で楽しめるプライベートサウナです。
            自分だけの空間でセルフロウリュや温度調整ができ、カップルや友人同士でも気兼ねなく利用できます。
            サウナ子では全国47都道府県・{allFacilities.length}施設以上の個室サウナを、料金・設備・エリアで比較検索できます。
          </p>
        </div>
      </section>

      {/* Popular Facilities Section */}
      <section className="bg-bg py-6 md:py-12">
        <div className="max-w-7xl mx-auto px-5 md:px-20">
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-text-primary">ピックアップ</h2>
            <Link href="/search" className="text-primary text-sm font-medium hover:opacity-80 transition-opacity">
              すべて見る →
            </Link>
          </div>

          {/* Mobile: horizontal scroll, PC: 3-column grid */}
          <div className="flex gap-3 overflow-x-auto pb-2 pr-5 md:grid md:grid-cols-3 md:gap-6 md:overflow-x-visible md:pb-0 md:pr-0 scrollbar-hide">
            {popularFacilities.map((facility) => (
              <Link
                key={facility.id}
                href={`/facilities/${facility.id}`}
                className="min-w-[72vw] w-[72vw] md:min-w-0 md:w-auto bg-surface rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden flex-shrink-0 md:flex-shrink"
              >
                {/* Image */}
                <div className="relative h-[140px] md:h-[180px] bg-gray-200 flex items-center justify-center overflow-hidden">
                  <Image
                    src={facility.images.length > 0 ? facility.images[0] : '/placeholder-facility.svg'}
                    alt={facility.name}
                    fill
                    sizes="(max-width: 768px) 72vw, 33vw"
                    className={facility.images.length > 0 ? 'object-cover' : 'object-contain p-4'}
                  />
                </div>

                {/* Info */}
                <div className="p-4 md:p-5">
                  <h3 className="text-base md:text-lg font-semibold text-text-primary mb-1">
                    {facility.name}
                  </h3>
                  <p className="text-[13px] text-text-tertiary mb-3">
                    {facility.nearestStation && (facility.walkMinutes ?? 0) > 0
                      ? `${facility.nearestStation}${facility.nearestStation.includes('駅') ? '' : '駅'} 徒歩${facility.walkMinutes}分 | `
                      : ''}{facility.area}
                  </p>

                  <div className="flex items-center justify-between">
                    <p className="text-saunako text-sm md:text-base font-bold">
                      {facility.priceMin > 0 ? (
                        <>
                          ¥{facility.priceMin.toLocaleString()}〜
                          <span className="text-text-tertiary text-xs md:text-sm font-normal ml-1">/ 1時間</span>
                        </>
                      ) : (
                        <span className="text-text-tertiary text-xs md:text-sm font-normal">要問合せ</span>
                      )}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Facilities Section */}
      {newFacilities.length > 0 && (
        <section className="bg-bg py-6 md:py-12">
          <div className="max-w-7xl mx-auto px-5 md:px-20">
            <div className="flex items-center justify-between mb-4 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-text-primary">最近追加された施設</h2>
              <Link href="/search?sort=newest" className="text-primary text-sm font-medium hover:opacity-80 transition-opacity">
                すべて見る →
              </Link>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 pr-5 md:grid md:grid-cols-3 md:gap-6 md:overflow-x-visible md:pb-0 md:pr-0 scrollbar-hide">
              {newFacilities.map((facility) => (
                <Link
                  key={facility.id}
                  href={`/facilities/${facility.id}`}
                  className="min-w-[72vw] w-[72vw] md:min-w-0 md:w-auto bg-surface rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden flex-shrink-0 md:flex-shrink"
                >
                  {/* Image */}
                  <div className="relative h-[140px] md:h-[180px] bg-gray-200 flex items-center justify-center overflow-hidden">
                    <Image
                      src={facility.images.length > 0 ? facility.images[0] : '/placeholder-facility.svg'}
                      alt={facility.name}
                      fill
                      sizes="(max-width: 768px) 72vw, 33vw"
                      className={facility.images.length > 0 ? 'object-cover' : 'object-contain p-4'}
                    />
                    <span className="absolute top-2 left-2 bg-saunako text-white text-xs font-bold px-2 py-0.5 rounded">NEW</span>
                  </div>

                  {/* Info */}
                  <div className="p-4 md:p-5">
                    <h3 className="text-base md:text-lg font-semibold text-text-primary mb-1">
                      {facility.name}
                    </h3>
                    <p className="text-[13px] text-text-tertiary mb-3">
                      {facility.nearestStation && (facility.walkMinutes ?? 0) > 0
                        ? `${facility.nearestStation}${facility.nearestStation.includes('駅') ? '' : '駅'} 徒歩${facility.walkMinutes}分 | `
                        : ''}{facility.area}
                    </p>

                    <div className="flex items-center justify-between">
                      <p className="text-saunako text-sm md:text-base font-bold">
                        {facility.priceMin > 0 ? (
                          <>
                            ¥{facility.priceMin.toLocaleString()}〜
                            <span className="text-text-tertiary text-xs md:text-sm font-normal ml-1">/ 1時間</span>
                          </>
                        ) : (
                          <span className="text-text-tertiary text-xs md:text-sm font-normal">要問合せ</span>
                        )}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Articles Section */}
      {featuredArticles.length > 0 && (
        <section className="bg-bg py-6 md:py-12">
          <div className="max-w-7xl mx-auto px-5 md:px-20">
            <div className="flex items-center justify-between mb-4 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-text-primary">おすすめ記事</h2>
              <Link href="/articles" className="text-primary text-sm font-medium hover:opacity-80 transition-opacity">
                すべて見る →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featuredArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Area Links Section */}
      <section className="bg-muted/50 py-6 md:py-12">
        <div className="max-w-7xl mx-auto px-5 md:px-20">
          <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-4 md:mb-8">エリアから個室サウナを探す</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { label: '東京の個室サウナ', href: '/area/tokyo' },
              { label: '大阪の個室サウナ', href: '/area/osaka' },
              { label: '福岡の個室サウナ', href: '/area/fukuoka' },
              { label: '北海道(札幌)の個室サウナ', href: '/area/hokkaido' },
              { label: '愛知(名古屋)の個室サウナ', href: '/area/aichi' },
              { label: '神奈川(横浜)の個室サウナ', href: '/area/kanagawa' },
              { label: '埼玉の個室サウナ', href: '/area/saitama' },
              { label: '栃木(宇都宮)の個室サウナ', href: '/area/tochigi' },
            ].map((area) => (
              <Link
                key={area.href}
                href={area.href}
                className="text-sm md:text-base text-primary hover:opacity-80 transition-opacity"
              >
                {area.label} →
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Viewed */}
      <RecentlyViewed allFacilities={allFacilities} />

      {/* FAQ JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Footer />
      <ScrollToTop />
    </div>
  );
}
