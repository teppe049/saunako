import Link from 'next/link';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
const ScrollToTop = dynamic(() => import('@/components/ScrollToTop'));
import { getAllFacilities } from '@/lib/facilities';

export const metadata: Metadata = {
  title: '施設掲載のご案内 | サウナ子',
  description: 'サウナ子への施設掲載は完全無料。個室サウナ・プライベートサウナの集客をサポートします。掲載料・手数料は一切かかりません。',
  alternates: {
    canonical: 'https://www.saunako.jp/for-owners',
  },
  openGraph: {
    title: '施設掲載のご案内 | サウナ子',
    description: 'サウナ子への施設掲載は完全無料。個室サウナ・プライベートサウナの集客をサポートします。掲載料・手数料は一切かかりません。',
  },
};

const CONTACT_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSerWPa3fBFUoKFgce1s2yEu4YIZR0t59auTD1TC_tkjTvKxCA/viewform?usp=header';

const ownerFaqs = [
  {
    q: '費用はかかりますか？',
    a: '掲載料・手数料ともに無料です。今後も課金する予定はありません。',
  },
  {
    q: '掲載までどのくらいかかりますか？',
    a: '施設情報をいただいてから、通常1週間以内に掲載します。混み合っている場合はもう少しお時間をいただくこともあります。',
  },
  {
    q: '掲載後に情報を修正できますか？',
    a: 'はい。料金改定や営業時間の変更など、いつでもフォームからご連絡ください。',
  },
  {
    q: '掲載を取りやめたい場合は？',
    a: 'ご連絡いただければすぐに削除します。',
  },
];

export default function ForOwnersPage() {
  const facilityCount = getAllFacilities().length;

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: ownerFaqs.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'TOP', item: 'https://www.saunako.jp/' },
      { '@type': 'ListItem', position: 2, name: '施設掲載のご案内', item: 'https://www.saunako.jp/for-owners' },
    ],
  };

  return (
    <div className="min-h-screen bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Header />

      <main className="max-w-2xl mx-auto px-5 md:px-8 py-8 md:py-16">
        <nav className="text-sm text-text-secondary mb-6">
          <Link href="/" className="hover:text-primary transition-colors">TOP</Link>
          <span className="mx-2">{'>'}</span>
          <span className="text-text-primary">施設掲載のご案内</span>
        </nav>

        {/* Hero */}
        <section className="mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
            施設掲載のご案内
          </h1>
          <div className="text-sm md:text-base text-text-secondary leading-relaxed space-y-3">
            <p>
              サウナ子は個室サウナ・プライベートサウナに特化した検索サイトです。
              現在 <span className="font-bold text-text-primary">{facilityCount}施設</span> を掲載しています。
            </p>
            <p>
              掲載は無料です。費用は一切かかりません。
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-text-primary mb-4">掲載までの流れ</h2>
          <div className="bg-surface border border-border rounded-xl divide-y divide-border">
            <div className="flex gap-4 items-start p-5">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-saunako text-white flex items-center justify-center font-bold text-xs">1</span>
              <div>
                <p className="text-text-primary font-medium">下記フォームから施設情報を送信</p>
                <p className="text-sm text-text-secondary mt-1">施設名・住所・料金・営業時間などをお送りください。</p>
              </div>
            </div>
            <div className="flex gap-4 items-start p-5">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-saunako text-white flex items-center justify-center font-bold text-xs">2</span>
              <div>
                <p className="text-text-primary font-medium">掲載ページを作成</p>
                <p className="text-sm text-text-secondary mt-1">いただいた情報をもとに、1週間以内を目安にページを作成します。</p>
              </div>
            </div>
            <div className="flex gap-4 items-start p-5">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-saunako text-white flex items-center justify-center font-bold text-xs">3</span>
              <div>
                <p className="text-text-primary font-medium">掲載開始</p>
                <p className="text-sm text-text-secondary mt-1">検索結果・エリア別ページ・施設詳細ページに掲載されます。</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-text-primary mb-4">よくある質問</h2>
          <div className="space-y-3">
            {ownerFaqs.map((item) => (
              <details
                key={item.q}
                className="bg-surface border border-border rounded-xl overflow-hidden group"
              >
                <summary className="px-5 py-4 cursor-pointer text-text-primary font-medium hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <span>{item.q}</span>
                  <svg
                    className="w-5 h-5 text-text-tertiary flex-shrink-0 ml-2 transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-4 text-text-secondary text-sm leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <a
            href={CONTACT_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-saunako text-white font-bold text-base px-8 py-4 rounded-xl hover:opacity-90 transition-opacity"
            data-track-click="for-owners-cta"
          >
            掲載を申し込む（無料）
          </a>
        </section>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
