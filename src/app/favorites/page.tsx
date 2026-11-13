import { Suspense } from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FavoritesContent from '@/components/FavoritesContent';

export const metadata: Metadata = {
  // absolute 指定。template（%s | サウナ子）に通すと二重化する（Issue #167）
  title: { absolute: 'お気に入り | サウナ子' },
  description: 'お気に入りに保存した個室サウナの一覧。気になる施設を比較して、あなたにぴったりのサウナを見つけよう。',
  robots: { index: false },
};

// 共有リンク（?ids=1,2）の判定はブラウザで行う。サイトは静的書き出しでサーバー処理を持たないため
export default function FavoritesPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="max-w-3xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <Suspense fallback={null}>
          <FavoritesContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
