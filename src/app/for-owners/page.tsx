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
    canonical: 'https://saunako.jp/for-owners',
  },
  openGraph: {
    title: '施設掲載のご案内 | サウナ子',
    description: 'サウナ子への施設掲載は完全無料。個室サウナ・プライベートサウナの集客をサポートします。掲載料・手数料は一切かかりません。',
  },
};

const CONTACT_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSerWPa3fBFUoKFgce1s2yEu4YIZR0t59auTD1TC_tkjTvKxCA/viewform?usp=header';

const valueProps = [
  {
    emoji: '\u{1F4B0}',
    title: '完全無料',
    description: '掲載料・手数料は一切なし。初期費用も月額費用もかかりません。',
  },
  {
    emoji: '\u{1F3AF}',
    title: '集客効果',
    description: 'サウナ好きユーザーへの露出を高め、施設の認知度アップに貢献します。',
  },
  {
    emoji: '\u{1F4DD}',
    title: 'かんたん掲載',
    description: 'フォームから施設情報を送信するだけ。面倒な手続きは不要です。',
  },
];

const steps = [
  { number: 1, title: 'フォームから施設情報を送信', description: '施設名・住所・料金などの基本情報をフォームからお送りください。' },
  { number: 2, title: 'サウナ子チームが掲載準備', description: 'いただいた情報をもとに、掲載ページを作成します。' },
  { number: 3, title: 'サイトに掲載開始', description: '準備が整い次第、サウナ子に施設が掲載されます。' },
];

const ownerFaqs = [
  {
    q: '掲載は本当に無料？',
    a: 'はい、完全無料。費用は一切なし。',
  },
  {
    q: '掲載までどのくらいかかる？',
    a: '通常1週間以内に掲載。',
  },
  {
    q: '掲載内容の変更はできる？',
    a: 'もちろん。お問い合わせフォームから連絡してね。',
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
      { '@type': 'ListItem', position: 1, name: 'TOP', item: 'https://saunako.jp/' },
      { '@type': 'ListItem', position: 2, name: '施設掲載のご案内', item: 'https://saunako.jp/for-owners' },
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

      <main className="max-w-3xl mx-auto px-5 md:px-8 py-8 md:py-16">
        <nav className="text-sm text-text-secondary mb-6">
          <Link href="/" className="hover:text-primary transition-colors">TOP</Link>
          <span className="mx-2">{'>'}</span>
          <span className="text-text-primary">施設掲載のご案内</span>
        </nav>

        {/* Hero */}
        <section className="mb-12">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
            施設オーナー様へ
          </h1>
          <p className="text-base md:text-lg text-text-secondary leading-relaxed">
            サウナ子で、あなたの施設をもっと多くのサウナファンに届けませんか？
          </p>
        </section>

        {/* Value Proposition */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {valueProps.map((prop) => (
              <div key={prop.title} className="bg-surface border border-border rounded-xl p-5 md:p-6 text-center">
                <span className="text-3xl mb-3 block">{prop.emoji}</span>
                <h3 className="text-lg font-bold text-text-primary mb-2">{prop.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{prop.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mb-12">
          <h2 className="text-lg md:text-xl font-bold text-text-primary mb-6">掲載までの流れ</h2>
          <div className="space-y-4">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-saunako text-white flex items-center justify-center font-bold text-sm">
                  {step.number}
                </div>
                <div>
                  <h3 className="font-bold text-text-primary mb-1">{step.title}</h3>
                  <p className="text-sm text-text-secondary">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="mb-12">
          <div className="bg-saunako-bg border border-saunako-border rounded-xl p-6 text-center">
            <p className="text-text-primary text-base md:text-lg">
              現在<span className="text-saunako font-bold text-2xl md:text-3xl mx-1">{facilityCount}</span>施設を掲載中
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-lg md:text-xl font-bold text-text-primary mb-4">よくある質問</h2>
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
            className="inline-block bg-saunako text-white font-bold text-base md:text-lg px-8 py-4 rounded-xl hover:opacity-90 transition-opacity"
          >
            無料で施設を掲載する
          </a>
          <p className="text-xs text-text-tertiary mt-3">掲載料・手数料は一切かかりません</p>
        </section>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
