import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FacilityCard from '@/components/FacilityCard';
import { searchFacilities } from '@/lib/facilities';
import { PREFECTURES } from '@/lib/types';

const CONDITIONS: Record<string, {
  label: string;
  h1Prefix: string;
  description: (prefLabel: string) => string;
  filter: Record<string, unknown>;
  intro: (prefLabel: string, count: number) => string;
}> = {
  'couple-ok': {
    label: 'カップルOK',
    h1Prefix: 'カップルOKの個室サウナ',
    description: (pref) => `${pref}でカップル・男女で一緒に利用できる個室サウナを厳選紹介。料金・設備・アクセスを比較。デートにもおすすめのプライベートサウナが見つかる。`,
    filter: { coupleOk: true },
    intro: (pref, count) => `${pref}でカップルや男女ペアで利用できる個室サウナは${count}施設。完全個室でデートや記念日にもぴったりの施設を見つけてください。`,
  },
  'water-bath': {
    label: '水風呂あり',
    h1Prefix: '水風呂ありの個室サウナ',
    description: (pref) => `${pref}で水風呂を完備した個室サウナを厳選紹介。サウナ→水風呂→外気浴の「ととのい」を個室で体験。料金・設備を比較。`,
    filter: { waterBath: true },
    intro: (pref, count) => `${pref}で水風呂付きの個室サウナは${count}施設。プライベート空間でサウナ→水風呂→休憩の「ととのい」動線を楽しめます。`,
  },
  'self-loyly': {
    label: 'セルフロウリュ可',
    h1Prefix: 'セルフロウリュができる個室サウナ',
    description: (pref) => `${pref}でセルフロウリュ対応の個室サウナを厳選紹介。好みの蒸気量で自分だけのサウナ体験を。料金・設備を比較。`,
    filter: { selfLoyly: true },
    intro: (pref, count) => `${pref}でセルフロウリュができる個室サウナは${count}施設。自分のタイミングでロウリュして、好みの蒸気量を楽しめます。`,
  },
  'outdoor-air': {
    label: '外気浴あり',
    h1Prefix: '外気浴ができる個室サウナ',
    description: (pref) => `${pref}で外気浴スペース付きの個室サウナを厳選紹介。サウナ後の外気浴で深い「ととのい」を体験。料金・設備を比較。`,
    filter: { outdoorAir: true },
    intro: (pref, count) => `${pref}で外気浴スペースを備えた個室サウナは${count}施設。プライベートな空間で外気浴を楽しめます。`,
  },
  'under-3000': {
    label: '3,000円以下',
    h1Prefix: '3,000円以下の個室サウナ',
    description: (pref) => `${pref}で1時間3,000円以下の個室サウナを厳選紹介。コスパ重視で個室サウナを探すなら。料金・設備を比較。`,
    filter: { priceMax: 3000 },
    intro: (pref, count) => `${pref}で1時間3,000円以下の個室サウナは${count}施設。リーズナブルに個室サウナを楽しめます。`,
  },
  'under-5000': {
    label: '5,000円以下',
    h1Prefix: '5,000円以下の個室サウナ',
    description: (pref) => `${pref}で1時間5,000円以下の個室サウナを厳選紹介。手頃な価格で本格プライベートサウナ体験を。料金・設備を比較。`,
    filter: { priceMax: 5000 },
    intro: (pref, count) => `${pref}で1時間5,000円以下の個室サウナは${count}施設。手頃な価格で本格的なサウナ体験を楽しめます。`,
  },
  'late-night': {
    label: '深夜営業',
    h1Prefix: '深夜営業の個室サウナ',
    description: (pref) => `${pref}で22時以降も利用できる深夜営業の個室サウナを厳選紹介。仕事帰りや終電後のサウナに。料金・設備を比較。`,
    filter: { lateNight: true },
    intro: (pref, count) => `${pref}で深夜営業の個室サウナは${count}施設。仕事終わりや飲み会の後でもサウナで整えます。`,
  },
  '24h': {
    label: '24時間営業',
    h1Prefix: '24時間営業の個室サウナ',
    description: (pref) => `${pref}で24時間営業の個室サウナを厳選紹介。早朝でも深夜でも好きな時間にサウナを楽しめる。料金・設備を比較。`,
    filter: { open24h: true },
    intro: (pref, count) => `${pref}で24時間営業の個室サウナは${count}施設。時間に縛られない自由なサウナ体験を。`,
  },
  'group': {
    label: 'グループ利用（4人以上）',
    h1Prefix: 'グループ・4人以上OKの個室サウナ',
    description: (pref) => `${pref}で4人以上のグループで利用できる個室サウナを厳選紹介。友達・仲間とのサウナパーティーに。料金・設備を比較。`,
    filter: { capacity: 4 },
    intro: (pref, count) => `${pref}で4人以上のグループで利用できる個室サウナは${count}施設。仲間と一緒にサウナを楽しめます。`,
  },
  'solo': {
    label: '一人利用OK',
    h1Prefix: '一人で利用できる個室サウナ',
    description: (pref) => `${pref}で一人でも気軽に利用できる個室サウナを厳選紹介。自分だけのととのい時間を。料金・設備を比較。`,
    filter: {},
    intro: (pref, count) => `${pref}で一人で利用できる個室サウナは${count}施設。誰にも気兼ねなく自分だけのサウナタイムを楽しめます。`,
  },
};

type ConditionKey = keyof typeof CONDITIONS;

const MIN_FACILITIES = 3;

interface PageProps {
  params: Promise<{ condition: string; prefecture: string }>;
}

export function generateStaticParams() {
  const params: { condition: string; prefecture: string }[] = [];

  for (const condKey of Object.keys(CONDITIONS)) {
    const cond = CONDITIONS[condKey];
    for (const pref of PREFECTURES) {
      const facilities = searchFacilities({
        ...cond.filter,
        prefecture: pref.code,
      } as Parameters<typeof searchFacilities>[0]);
      if (facilities.length >= MIN_FACILITIES) {
        params.push({ condition: condKey, prefecture: pref.code });
      }
    }
  }

  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { condition, prefecture } = await params;
  const config = CONDITIONS[condition as ConditionKey];
  const pref = PREFECTURES.find((p) => p.code === prefecture);
  if (!config || !pref) return { title: 'Not Found' };

  const title = `${pref.label}の${config.h1Prefix}一覧 | サウナ子`;
  const description = config.description(pref.label);

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.saunako.jp/search/${condition}/${prefecture}`,
    },
    openGraph: { title, description },
  };
}

export default async function ConditionPrefecturePage({ params }: PageProps) {
  const { condition, prefecture } = await params;
  const config = CONDITIONS[condition as ConditionKey];
  const pref = PREFECTURES.find((p) => p.code === prefecture);

  if (!config || !pref) {
    notFound();
  }

  const facilities = searchFacilities({
    ...config.filter,
    prefecture: pref.code,
  } as Parameters<typeof searchFacilities>[0]);

  if (facilities.length < MIN_FACILITIES) {
    notFound();
  }

  const h1 = `${pref.label}の${config.h1Prefix}一覧`;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'TOP', item: 'https://www.saunako.jp/' },
      { '@type': 'ListItem', position: 2, name: '検索', item: 'https://www.saunako.jp/search' },
      { '@type': 'ListItem', position: 3, name: config.label, item: `https://www.saunako.jp/search/${condition}` },
      { '@type': 'ListItem', position: 4, name: pref.label, item: `https://www.saunako.jp/search/${condition}/${prefecture}` },
    ],
  };

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: h1,
    numberOfItems: facilities.length,
    itemListElement: facilities.slice(0, 10).map((f, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: f.name,
      url: `https://www.saunako.jp/facilities/${f.id}`,
    })),
  };

  // 同条件の他エリアリンク
  const otherPrefs = PREFECTURES
    .filter((p) => p.code !== prefecture)
    .map((p) => {
      const count = searchFacilities({
        ...config.filter,
        prefecture: p.code,
      } as Parameters<typeof searchFacilities>[0]).length;
      return { ...p, count };
    })
    .filter((p) => p.count >= MIN_FACILITIES)
    .sort((a, b) => b.count - a.count);

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
          <Link href={`/search/${condition}`} className="hover:text-primary transition-colors">{config.label}</Link>
          <span className="mx-2">{'>'}</span>
          <span className="text-text-primary">{pref.label}</span>
        </nav>

        <div className="bg-surface border border-border rounded-xl p-6 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
            {h1}
          </h1>
          <span className="inline-flex items-center px-3 py-1 bg-primary-light text-primary rounded-full text-sm font-semibold">
            {facilities.length}件の施設
          </span>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 mb-8">
          <p className="text-text-secondary text-sm leading-relaxed">
            {config.intro(pref.label, facilities.length)}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((facility, i) => (
            <FacilityCard key={facility.id} facility={facility} index={i} />
          ))}
        </div>

        {/* 同条件の他エリア */}
        {otherPrefs.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-text-primary mb-4">
              他のエリアで「{config.label}」を探す
            </h2>
            <div className="flex flex-wrap gap-2">
              {otherPrefs.map((p) => (
                <Link
                  key={p.code}
                  href={`/search/${condition}/${p.code}`}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-surface border border-border text-text-secondary hover:border-primary hover:text-primary transition-colors"
                >
                  {p.label}（{p.count}件）
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 同エリアの他条件 */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-text-primary mb-4">
            {pref.label}の個室サウナを他の条件で探す
          </h2>
          <div className="flex flex-wrap gap-2">
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
        </div>

        {/* エリアページへのリンク */}
        <div className="mt-6">
          <Link
            href={`/area/${prefecture}`}
            className="text-sm text-primary hover:underline font-medium"
          >
            {pref.label}の個室サウナをすべて見る →
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
