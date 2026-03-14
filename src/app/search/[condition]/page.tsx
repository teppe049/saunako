import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FacilityCard from '@/components/FacilityCard';
import { searchFacilities } from '@/lib/facilities';

const CONDITIONS = {
  'couple-ok': {
    label: 'カップルOK',
    h1: 'カップルOKの個室サウナ一覧',
    description: 'カップル・男女で一緒に利用できる個室サウナ・プライベートサウナを全国から厳選。2人で貸切できる施設の料金・設備・アクセスを比較。デートにもおすすめ。',
    filter: { coupleOk: true },
    intro: 'カップルや男女ペアで一緒に利用できる個室サウナをまとめました。完全個室なのでデートや記念日にもぴったり。水風呂やロウリュの有無、料金プランを比較して、お二人にぴったりの施設を見つけてください。',
  },
  'water-bath': {
    label: '水風呂あり',
    h1: '水風呂ありの個室サウナ一覧',
    description: '水風呂を完備した個室サウナ・プライベートサウナを全国から厳選。サウナ→水風呂→外気浴の「ととのい」を個室で体験。料金・設備を比較。',
    filter: { waterBath: true },
    intro: 'プライベート空間で水風呂付きのサウナを楽しめる施設を集めました。サウナ→水風呂→休憩の「ととのい」動線を個室で完結できます。水温や設備の詳細を比較して、理想のサウナ体験を見つけてください。',
  },
  'self-loyly': {
    label: 'セルフロウリュ可',
    h1: 'セルフロウリュができる個室サウナ一覧',
    description: 'セルフロウリュ（自分でサウナストーンに水をかけられる）対応の個室サウナを全国から厳選。好みの蒸気量で自分だけのサウナ体験を。',
    filter: { selfLoyly: true },
    intro: '自分のタイミングでロウリュできる個室サウナを集めました。アロマ水やハーブを使ったセルフロウリュで、自分好みの蒸気を楽しめます。蒸気の量を自在にコントロールできるのは個室サウナならではの魅力です。',
  },
  'outdoor-air': {
    label: '外気浴あり',
    h1: '外気浴ができる個室サウナ一覧',
    description: '外気浴スペース付きの個室サウナ・プライベートサウナを全国から厳選。サウナ後の外気浴で深い「ととのい」を体験。料金・設備を比較。',
    filter: { outdoorAir: true },
    intro: '外気浴スペースを備えた個室サウナを集めました。サウナで温まった後に外の空気を浴びる「ととのい」体験は格別。テラスや庭付きの施設で、プライベートな外気浴を楽しんでください。',
  },
  'under-3000': {
    label: '3,000円以下',
    h1: '3,000円以下で利用できる個室サウナ一覧',
    description: '1時間3,000円以下で利用できるリーズナブルな個室サウナ・プライベートサウナを全国から厳選。コスパ重視で個室サウナを探すなら。',
    filter: { priceMax: 3000 },
    intro: '1時間3,000円以下で利用できるコスパ抜群の個室サウナを集めました。リーズナブルながらも設備が充実した施設が見つかります。初めて個室サウナを試す方にもおすすめの価格帯です。',
  },
  'under-5000': {
    label: '5,000円以下',
    h1: '5,000円以下で利用できる個室サウナ一覧',
    description: '1時間5,000円以下で利用できる個室サウナ・プライベートサウナを全国から厳選。手頃な価格で本格的なプライベートサウナ体験を。',
    filter: { priceMax: 5000 },
    intro: '1時間5,000円以下で利用できる個室サウナを集めました。この価格帯では水風呂やセルフロウリュ付きの本格的な施設も多く、コストパフォーマンスの高いサウナ体験が楽しめます。',
  },
} as const;

type ConditionKey = keyof typeof CONDITIONS;

interface PageProps {
  params: Promise<{ condition: string }>;
}

export function generateStaticParams() {
  return Object.keys(CONDITIONS).map((condition) => ({ condition }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { condition } = await params;
  const config = CONDITIONS[condition as ConditionKey];
  if (!config) return { title: 'Not Found' };

  return {
    title: `${config.h1} | サウナ子`,
    description: config.description,
    alternates: {
      canonical: `https://www.saunako.jp/search/${condition}`,
    },
    openGraph: {
      title: `${config.h1} | サウナ子`,
      description: config.description,
    },
  };
}

export default async function ConditionPage({ params }: PageProps) {
  const { condition } = await params;
  const config = CONDITIONS[condition as ConditionKey];

  if (!config) {
    const { notFound } = await import('next/navigation');
    notFound();
  }

  const facilities = searchFacilities(config.filter as Parameters<typeof searchFacilities>[0]);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'TOP', item: 'https://www.saunako.jp/' },
      { '@type': 'ListItem', position: 2, name: '検索', item: 'https://www.saunako.jp/search' },
      { '@type': 'ListItem', position: 3, name: config.label, item: `https://www.saunako.jp/search/${condition}` },
    ],
  };

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: config.h1,
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-8">
        <nav className="text-sm text-text-secondary mb-6">
          <Link href="/" className="hover:text-primary transition-colors">TOP</Link>
          <span className="mx-2">{'>'}</span>
          <Link href="/search" className="hover:text-primary transition-colors">検索</Link>
          <span className="mx-2">{'>'}</span>
          <span className="text-text-primary">{config.label}</span>
        </nav>

        <div className="bg-surface border border-border rounded-xl p-6 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
            {config.h1}
          </h1>
          <span className="inline-flex items-center px-3 py-1 bg-primary-light text-primary rounded-full text-sm font-semibold">
            {facilities.length}件の施設
          </span>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 mb-8">
          <p className="text-text-secondary text-sm leading-relaxed">
            {config.intro}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((facility, i) => (
            <FacilityCard key={facility.id} facility={facility} index={i} />
          ))}
        </div>

        {facilities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-tertiary">該当する施設が見つかりませんでした</p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {Object.entries(CONDITIONS)
            .filter(([key]) => key !== condition)
            .map(([key, cfg]) => (
              <Link
                key={key}
                href={`/search/${key}`}
                className="px-4 py-2 rounded-full text-sm font-medium bg-surface border border-border text-text-secondary hover:border-primary hover:text-primary transition-colors"
              >
                {cfg.label}
              </Link>
            ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
