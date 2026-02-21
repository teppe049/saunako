import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getArticlesByCategory } from '@/lib/articles';
import { ARTICLE_CATEGORIES } from '@/lib/types';
import ArticleCard from '@/components/ArticleCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return ARTICLE_CATEGORIES.map((cat) => ({ category: cat.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { category } = await params;
  const cat = ARTICLE_CATEGORIES.find((c) => c.slug === category);
  if (!cat) return { title: 'Not Found' };

  const title = `${cat.label}の記事一覧 | サウナ子`;
  const description = `サウナ子の${cat.label}に関する記事一覧。個室サウナの最新情報をお届けします。`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://saunako.jp/articles/category/${cat.slug}`,
    },
    openGraph: {
      title,
      description,
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const cat = ARTICLE_CATEGORIES.find((c) => c.slug === category);

  if (!cat) {
    notFound();
  }

  const articles = getArticlesByCategory(category);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'TOP', item: 'https://saunako.jp/' },
      { '@type': 'ListItem', position: 2, name: 'コラム', item: 'https://saunako.jp/articles' },
      { '@type': 'ListItem', position: 3, name: cat.label, item: `https://saunako.jp/articles/category/${cat.slug}` },
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
          <Link href="/articles" className="hover:text-primary transition-colors">コラム</Link>
          <span className="mx-2">{'>'}</span>
          <span className="text-text-primary">{cat.label}</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-6">{cat.label}</h1>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          <Link
            href="/articles"
            className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium bg-surface border border-border text-text-secondary hover:border-saunako hover:text-saunako transition-colors"
          >
            すべて
          </Link>
          {ARTICLE_CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/articles/category/${c.slug}`}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium ${
                c.slug === category
                  ? 'bg-saunako text-white'
                  : 'bg-surface border border-border text-text-secondary hover:border-saunako hover:text-saunako transition-colors'
              }`}
            >
              {c.label}
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
            <p className="text-text-secondary">このカテゴリの記事はまだありません</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
