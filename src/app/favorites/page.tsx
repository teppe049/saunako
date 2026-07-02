import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FavoritesView from '@/components/FavoritesView';
import FacilityListCard from '@/components/FacilityListCard';
import { getFavoriteFacilities } from '@/app/favorites/actions';

export const metadata: Metadata = {
  title: 'お気に入り | サウナ子',
  description: 'お気に入りに保存した個室サウナの一覧。気になる施設を比較して、あなたにぴったりのサウナを見つけよう。',
  robots: { index: false },
};

function parseIds(raw: string | string[] | undefined): number[] {
  if (typeof raw !== 'string') return [];
  return raw
    .split(',')
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => Number.isInteger(n) && n > 0);
}

export default async function FavoritesPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string | string[] }>;
}) {
  const { ids: rawIds } = await searchParams;
  const sharedIds = parseIds(rawIds);
  // 共有ビュー: 有効なIDが1件以上ある場合のみ。閉店・不正IDは getFavoriteFacilities が除外する
  const sharedFacilities = sharedIds.length > 0 ? await getFavoriteFacilities(sharedIds) : [];
  const isSharedView = sharedFacilities.length > 0;

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="max-w-3xl mx-auto px-4 md:px-8 py-6 md:py-10">
        {isSharedView ? (
          <>
            <h1 className="text-xl md:text-2xl font-bold text-text-primary mb-1">
              共有されたお気に入りリスト
            </h1>
            <p className="text-text-secondary text-sm mb-6">{sharedFacilities.length}件の個室サウナ</p>
            <div className="flex flex-col divide-y divide-border">
              {sharedFacilities.map((facility, index) => (
                <FacilityListCard key={facility.id} facility={facility} index={index} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/favorites"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors"
              >
                自分のお気に入りを見る
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-xl md:text-2xl font-bold text-text-primary mb-6">お気に入り</h1>
            <FavoritesView />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
