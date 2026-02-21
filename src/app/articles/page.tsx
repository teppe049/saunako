import Link from 'next/link';
import { getAllArticles } from '@/lib/articles';
import { ARTICLE_CATEGORIES } from '@/lib/types';
import ArticleCard from '@/components/ArticleCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'コラム | サウナ子',
  description: 'サウナ子が厳選した個室サウナの情報、エリアガイド、初心者向けの入門記事をお届けします。',
  alternates: {
    canonical: 'https://www.saunako.jp/articles',
  },
  openGraph: {
    title: 'コラム | サウナ子',
    description: 'サウナ子が厳選した個室サウナの情報、エリアガイド、初心者向けの入門記事をお届けします。',
  },
};

export default function ArticlesListPage() {
  const articles = getAllArticles();

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'TOP', item: 'https://www.saunako.jp/' },
      { '@type': 'ListItem', position: 2, name: 'コラム', item: 'https://www.saunako.jp/articles' },
    ],
  };

  return (
    <div className="min-h-screen bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-6 md:py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-text-secondary mb-6">
          <Link href="/" className="hover:text-primary transition-colors">TOP</Link>
          <span className="mx-2">{'>'}</span>
          <span className="text-text-primary">コラム</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-6">コラム</h1>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          <Link
            href="/articles"
            className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium bg-saunako text-white"
          >
            すべて
          </Link>
          {ARTICLE_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/articles/category/${cat.slug}`}
              className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium bg-surface border border-border text-text-secondary hover:border-saunako hover:text-saunako transition-colors"
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {/* Article Grid */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-text-secondary">記事はまだありません</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
