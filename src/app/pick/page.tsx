import { Suspense } from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PickView from '@/components/PickView';

// 候補を受け取った側が開くページ（/pick?ids=85-18-84）。
// サイトは静的書き出しなので、メッセージアプリのプレビューは候補によらず共通の文言とサイト共通の OG 画像になる
export const metadata: Metadata = {
  title: 'どれがいい？ 行きたい個室サウナの候補',
  description: '行きたい個室サウナの候補が届いたよ。料金・駅からの距離・水風呂で比べて、予約ページまでそのまま進めます。',
  robots: { index: false, follow: true },
};

export default function PickPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="max-w-3xl mx-auto px-4 pt-5 pb-8 md:py-10">
        <Suspense fallback={null}>
          <PickView />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
