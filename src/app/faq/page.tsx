import Link from 'next/link';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
const ScrollToTop = dynamic(() => import('@/components/ScrollToTop'));

export const metadata: Metadata = {
  title: 'よくある質問 | サウナ子',
  description: '個室サウナに関するよくある質問をまとめました。予約方法・料金・持ち物・利用方法など、初めての方にも分かりやすく解説しています。',
};

const faqCategories = [
  {
    title: '個室サウナについて',
    items: [
      {
        q: '個室サウナとは？',
        a: '一般的なサウナとは異なり、完全プライベートな空間でサウナを楽しめる施設です。自分だけ（またはグループだけ）の空間で、時間を気にせずリラックスできるのが魅力です。',
      },
      {
        q: '一般的なサウナとの違いは？',
        a: '最大の違いはプライバシーです。他のお客さんの目を気にせず、自分のペースでサウナを楽しめます。温度やロウリュのタイミングも自分で調整可能な施設が多いです。',
      },
      {
        q: '一人でも利用できる？',
        a: 'はい、多くの個室サウナは1名から利用可能です。一人で集中して整いたいときにもぴったりです。',
      },
    ],
  },
  {
    title: '予約・料金について',
    items: [
      {
        q: '予約方法は？',
        a: '各施設の公式サイトやCoubicなどの予約サービスから予約できます。サウナ子では各施設ページに予約リンクを掲載しています。',
      },
      {
        q: '料金の相場は？',
        a: '1時間あたり3,000円〜10,000円程度が一般的です。利用人数や時間帯によって変動します。',
      },
      {
        q: 'キャンセルポリシーは？',
        a: '施設によって異なります。各施設の公式サイトで事前にご確認ください。',
      },
    ],
  },
  {
    title: '利用方法について',
    items: [
      {
        q: '持ち物は何が必要？',
        a: 'タオルやアメニティは施設に用意されていることが多いです。着替えと水分補給用の飲み物があれば十分です。詳細は各施設のページをご確認ください。',
      },
      {
        q: '利用時間はどのくらい？',
        a: '60分〜180分のコースが一般的です。施設によって異なりますので、各施設ページでご確認ください。',
      },
      {
        q: '水風呂やロウリュって何？',
        a: '水風呂はサウナ後に体を冷やすための冷水浴です。ロウリュはサウナストーンに水をかけて蒸気を発生させることを指します。個室サウナではセルフロウリュを楽しめる施設も多いです。',
      },
    ],
  },
  {
    title: 'サウナ子について',
    items: [
      {
        q: 'サウナ子ってどんなサービス？',
        a: '全国の個室・プライベートサウナを比較・検索できるサービスです。水風呂の温度やロウリュの有無など、サウナ好きが気になるポイントで施設を探せます。',
      },
      {
        q: '掲載情報は正確？',
        a: 'できる限り正確な情報を掲載していますが、料金や営業時間は変更になる場合があります。最新情報は各施設の公式サイトでご確認ください。',
      },
      {
        q: 'サウナ子で予約できる？',
        a: 'サウナ子では直接予約は受け付けておりません。各施設ページの予約リンクから、公式サイトや予約サービスを通じてご予約ください。',
      },
    ],
  },
  {
    title: '施設オーナー様へ',
    items: [
      {
        q: '施設を掲載するには？',
        a: '完全無料で掲載いただけます。詳しくは施設掲載のご案内ページをご覧ください。',
      },
      {
        q: '掲載情報の修正は？',
        a: 'お問い合わせフォームからご連絡ください。確認の上、修正対応いたします。',
      },
    ],
  },
];

// 全Q&Aをフラットに展開（JSON-LD用）
const allFaqItems = faqCategories.flatMap((cat) => cat.items);

export default function FaqPage() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'TOP', item: 'https://saunako.jp/' },
      { '@type': 'ListItem', position: 2, name: 'よくある質問', item: 'https://saunako.jp/faq' },
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
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
          <span className="text-text-primary">よくある質問</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-8">
          よくある質問
        </h1>

        <div className="space-y-8">
          {faqCategories.map((category) => (
            <section key={category.title}>
              <h2 className="text-lg md:text-xl font-bold text-text-primary mb-4">
                {category.title}
              </h2>
              <div className="space-y-3">
                {category.items.map((item) => (
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
          ))}
        </div>
      </main>

      <ScrollToTop />
    </div>
  );
}
