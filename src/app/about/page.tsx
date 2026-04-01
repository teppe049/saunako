import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';
import { getAllFacilities } from '@/lib/facilities';

const ScrollToTop = dynamic(() => import('@/components/ScrollToTop'));

export const metadata: Metadata = {
  title: 'サウナ子について | 個室サウナ専門の検索サービス',
  description:
    '全国47都道府県の個室・プライベートサウナを網羅する検索サービス「サウナ子」について。掲載基準やデータの信頼性、サイトの特徴をご紹介します。',
  alternates: {
    canonical: 'https://www.saunako.jp/about',
  },
  openGraph: {
    title: 'サウナ子について | 個室サウナ専門の検索サービス',
    description:
      '全国47都道府県の個室・プライベートサウナを網羅する検索サービス「サウナ子」について。掲載基準やデータの信頼性、サイトの特徴をご紹介します。',
  },
};

const CONTACT_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSerWPa3fBFUoKFgce1s2yEu4YIZR0t59auTD1TC_tkjTvKxCA/viewform?usp=header';

export default function AboutPage() {
  const facilities = getAllFacilities();
  const facilityCount = facilities.length;
  const prefectures = new Set(facilities.map((f) => f.prefecture));
  const prefectureCount = prefectures.size;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'ホーム',
        item: 'https://www.saunako.jp',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'サウナ子について',
        item: 'https://www.saunako.jp/about',
      },
    ],
  };

  const aboutJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'サウナ子について',
    description:
      '全国の個室・プライベートサウナを網羅する検索サービス「サウナ子」について',
    url: 'https://www.saunako.jp/about',
    mainEntity: {
      '@type': 'Organization',
      name: 'サウナ子',
      alternateName: 'saunako',
      url: 'https://www.saunako.jp',
      logo: 'https://www.saunako.jp/saunako-avatar.webp',
      description: `全国${prefectureCount}都道府県・${facilityCount}施設の個室サウナ情報を掲載する、個室サウナ専門の比較・検索サービス`,
      foundingDate: '2026-01',
      sameAs: [
        'https://x.com/saunako_jp',
        'https://www.instagram.com/saunako_jp/',
      ],
      knowsAbout: [
        '個室サウナ',
        'プライベートサウナ',
        '貸切サウナ',
        'サウナ施設比較',
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(aboutJsonLd),
        }}
      />
      <Header />
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-5 py-12 md:py-16">
          {/* Hero */}
          <div className="flex flex-col items-center text-center mb-12">
            <Image
              src="/saunako-avatar.webp"
              alt="サウナ子"
              width={96}
              height={96}
              className="w-24 h-24 rounded-full object-cover mb-4"
            />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              サウナ子について
            </h1>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-xl">
              「今日はどこで整える?」をお手伝いする、
              <br className="hidden md:block" />
              個室サウナ専門の比較・検索サービスだよ!
            </p>
          </div>

          {/* Numbers */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            <div className="bg-gray-50 rounded-xl p-4 md:p-6 text-center">
              <p className="text-2xl md:text-3xl font-bold text-orange-500">
                {facilityCount}
              </p>
              <p className="text-xs md:text-sm text-gray-500 mt-1">掲載施設数</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 md:p-6 text-center">
              <p className="text-2xl md:text-3xl font-bold text-orange-500">
                {prefectureCount}
              </p>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                都道府県カバー
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 md:p-6 text-center">
              <p className="text-2xl md:text-3xl font-bold text-orange-500">
                毎月
              </p>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                新規施設を追加
              </p>
            </div>
          </div>

          {/* What is Saunako */}
          <section className="mb-10">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-orange-500 rounded-full" />
              サウナ子ってどんなサービス?
            </h2>
            <div className="text-sm md:text-base text-gray-700 leading-relaxed space-y-3">
              <p>
                サウナ子は、全国の<strong>個室・プライベートサウナ</strong>
                に特化した比較・検索サービス。
                「他のグループと共有がない状態で使えるサウナ」だけを集めているよ。
              </p>
              <p>
                料金・水風呂の温度・ロウリュの有無・外気浴・カップル利用OK
                など、サウナ好きが気になるポイントで施設を比較できるのが特徴。
                大型スパや共用サウナは掲載していないから、
                「貸切で使えるサウナだけ探したい」ときに便利だよ!
              </p>
            </div>
          </section>

          {/* Listing Criteria */}
          <section className="mb-10">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-orange-500 rounded-full" />
              掲載基準
            </h2>
            <div className="bg-gray-50 rounded-xl p-5 md:p-6">
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                「他のグループと共有がない状態で使えるサウナ」を掲載基準にしているよ。
                具体的には以下の通り:
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5 shrink-0">○</span>
                  <span className="text-gray-700">
                    屋内個室サウナ・グループ貸切サウナ
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5 shrink-0">○</span>
                  <span className="text-gray-700">
                    バレルサウナ・サウナ小屋（常設・貸切）
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5 shrink-0">○</span>
                  <span className="text-gray-700">
                    宿泊施設のサウナ（日帰りプランあり）
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5 shrink-0">×</span>
                  <span className="text-gray-500">
                    テントサウナ・キャンプ場
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5 shrink-0">×</span>
                  <span className="text-gray-500">
                    大型スパ・スーパー銭湯の共用サウナ
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5 shrink-0">×</span>
                  <span className="text-gray-500">
                    宿泊者専用サウナ（日帰り不可）
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Data Reliability */}
          <section className="mb-10">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-orange-500 rounded-full" />
              データの信頼性
            </h2>
            <div className="text-sm md:text-base text-gray-700 leading-relaxed space-y-3">
              <p>
                掲載している施設情報は、以下の方法で正確性を保つようにしているよ:
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="border border-gray-200 rounded-xl p-4">
                <p className="font-semibold text-gray-900 text-sm mb-1">
                  料金は「実際に払う金額」で掲載
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  「○○円〜」という表記だけだと実際いくらかわかりにくいよね。
                  サウナ子では最低利用時間で計算した実額を掲載しているよ。
                </p>
              </div>
              <div className="border border-gray-200 rounded-xl p-4">
                <p className="font-semibold text-gray-900 text-sm mb-1">
                  新しい施設も随時追加
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  個室サウナは毎月新しい施設がオープンしてるよ。
                  サウナ子でも新規施設を見つけたらどんどん追加してるよ。
                </p>
              </div>
              <div className="border border-gray-200 rounded-xl p-4">
                <p className="font-semibold text-gray-900 text-sm mb-1">
                  全国{prefectureCount}都道府県をカバー
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  東京・大阪だけでなく、地方の個室サウナもしっかり掲載。
                  旅行先でサウナを探すときにも役立つよ。
                </p>
              </div>
              <div className="border border-gray-200 rounded-xl p-4">
                <p className="font-semibold text-gray-900 text-sm mb-1">
                  情報修正はいつでも受付中
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  「料金が変わった」「営業時間が違う」などの情報があれば、
                  お問い合わせフォームから教えてね。すぐに対応するよ。
                </p>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="mb-10">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-orange-500 rounded-full" />
              サウナ子の特徴
            </h2>
            <div className="space-y-4 text-sm md:text-base text-gray-700 leading-relaxed">
              <div className="flex gap-3">
                <span className="text-orange-500 font-bold shrink-0">01</span>
                <div>
                  <p className="font-semibold text-gray-900">
                    個室サウナ「だけ」に特化
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    大型スパや共用サウナは一切なし。貸切で使えるサウナだけを探せるよ。
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-orange-500 font-bold shrink-0">02</span>
                <div>
                  <p className="font-semibold text-gray-900">
                    サウナ好きが気になる条件で比較
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    水風呂の温度、セルフロウリュ、外気浴、カップルOKなど、
                    他のサイトでは比較しにくい項目で絞り込めるよ。
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-orange-500 font-bold shrink-0">03</span>
                <div>
                  <p className="font-semibold text-gray-900">
                    全国{prefectureCount}都道府県を網羅
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    東京・大阪だけでなく、地方の個室サウナもしっかりカバー。
                    旅先でのサウナ探しにも使ってね。
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="mb-10">
            <div className="bg-orange-50 rounded-xl p-6 md:p-8 text-center">
              <p className="text-gray-900 font-semibold mb-2">
                さっそく探してみよう!
              </p>
              <p className="text-sm text-gray-600 mb-4">
                あなたにぴったりの個室サウナがきっと見つかるよ。
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/search"
                  className="inline-flex items-center justify-center px-6 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                >
                  施設を探す
                </Link>
                <Link
                  href="/articles"
                  className="inline-flex items-center justify-center px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  記事を読む
                </Link>
              </div>
            </div>
          </section>

          {/* For Owners */}
          <section className="mb-10">
            <div className="border border-gray-200 rounded-xl p-6 md:p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                施設オーナーの方へ
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                サウナ子への掲載は完全無料。
                「個室サウナを探している人」に直接届く検索サービスに、あなたの施設を掲載しませんか?
              </p>
              <Link
                href="/for-owners"
                className="inline-flex items-center text-sm text-orange-600 hover:text-orange-700 font-semibold"
              >
                施設掲載のご案内 →
              </Link>
            </div>
          </section>

          {/* Contact */}
          <section>
            <div className="border-t border-gray-200 pt-8 text-center">
              <p className="text-sm text-gray-600 mb-2">
                お問い合わせ・情報修正のご依頼は
              </p>
              <a
                href={CONTACT_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-orange-600 hover:text-orange-700 underline"
              >
                お問い合わせフォーム
              </a>
            </div>
          </section>
        </div>
      </div>
      <Footer />
      <ScrollToTop />
    </>
  );
}
