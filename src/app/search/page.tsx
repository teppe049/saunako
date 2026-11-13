import { Suspense } from 'react';
import type { Metadata } from 'next';
import SearchView from '@/components/SearchView';

// 検索結果は URL の条件ごとに中身が変わるが、サイトは静的書き出しなのでページ自体は1枚。
// 絞り込みはブラウザで行う（SearchView）。検索エンジンには出さない（robots でも /search を Disallow）
export const metadata: Metadata = {
  // absolute 指定。template（%s | サウナ子）に通すと二重化する（Issue #167）
  title: { absolute: '個室・プライベートサウナを条件で検索・比較 | サウナ子' },
  description:
    '全国の個室・プライベートサウナを料金・エリア・設備で検索・比較。貸切サウナも多数掲載。水風呂・ロウリュ・外気浴などこだわり条件で、あなたにぴったりの施設を見つけよう。',
  robots: { index: false, follow: true },
  alternates: {
    canonical: 'https://www.saunako.jp/search',
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'TOP', item: 'https://www.saunako.jp/' },
    { '@type': 'ListItem', position: 2, name: '検索結果', item: 'https://www.saunako.jp/search' },
  ],
};

export default function SearchPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <Suspense
        fallback={
          <div className="min-h-screen bg-bg flex items-center justify-center">
            <p className="text-text-tertiary">読み込み中...</p>
          </div>
        }
      >
        <SearchView />
      </Suspense>
    </>
  );
}
