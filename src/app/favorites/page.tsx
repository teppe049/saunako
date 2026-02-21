import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FavoritesView from '@/components/FavoritesView';
import { getAllFacilities } from '@/lib/facilities';

export const metadata: Metadata = {
  title: 'お気に入り | サウナ子',
  description: 'お気に入りに保存した個室サウナの一覧。気になる施設を比較して、あなたにぴったりのサウナを見つけよう。',
  robots: { index: false },
};

export default function FavoritesPage() {
  const allFacilities = getAllFacilities();

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="max-w-3xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <h1 className="text-xl md:text-2xl font-bold text-text-primary mb-6">お気に入り</h1>
        <FavoritesView allFacilities={allFacilities} />
      </main>
      <Footer />
    </div>
  );
}
