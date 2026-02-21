import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getArticlesByTag, getAllTags } from '@/lib/articles';
import ArticleCard from '@/components/ArticleCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface PageProps {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag: encodeURIComponent(tag) }));
}

export async function generateMetadata({ params }: PageProps) {
  const { tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag);
  const title = `「${tag}」の記事一覧 | サウナ子`;
  const description = `「${tag}」に関する個室サウナの記事一覧。サウナ子が厳選した情報をお届けします。`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.saunako.jp/articles/tag/${encodeURIComponent(tag)}`,
    },
    openGraph: { title, description },
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag);
  const articles = getArticlesByTag(tag);

  if (articles.length === 0) {
    notFound();
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'TOP', item: 'https://www.saunako.jp/' },
      { '@type': 'ListItem', position: 2, name: 'コラム', item: 'https://www.saunako.jp/articles' },
      { '@type': 'ListItem', position: 3, name: tag, item: `https://www.saunako.jp/articles/tag/${encodeURIComponent(tag)}` },
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
        <nav className="text-sm text-text-secondary mb-6">
          <Link href="/" className="hover:text-primary transition-colors">TOP</Link>
          <span className="mx-2">{'>'}</span>
          <Link href="/articles" className="hover:text-primary transition-colors">コラム</Link>
          <span className="mx-2">{'>'}</span>
          <span className="text-text-primary">{tag}</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-6">「{tag}」の記事一覧</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
