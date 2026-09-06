import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { buildPickPath, parsePickIds, MAX_PICK } from '@/lib/pick';

export const metadata: Metadata = {
  title: '行きたい候補を送る',
  description: `気になる個室サウナを最大${MAX_PICK}件まで候補にして、1つのURLで友だちに送れます。`,
  robots: { index: false, follow: true },
};

interface PickIndexProps {
  searchParams: Promise<{ ids?: string }>;
}

/** 旧 /compare?ids=1,2 は next.config のリダイレクトでここに来るので /pick/1-2 へ送る */
export default async function PickIndexPage({ searchParams }: PickIndexProps) {
  const { ids } = await searchParams;
  const parsed = parsePickIds(ids);
  if (parsed.length > 0) redirect(buildPickPath(parsed));

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-lg font-bold text-text-primary mb-2">候補がまだありません</h1>
        <p className="text-sm text-text-secondary mb-6">
          施設ページの「行きたい候補に入れる」で気になる施設を追加してね（最大{MAX_PICK}件）
        </p>
        <Link href="/search" className="btn-primary inline-block">
          個室サウナを探す
        </Link>
      </main>
      <Footer />
    </div>
  );
}
