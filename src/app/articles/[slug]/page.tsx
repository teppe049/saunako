import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getArticleBySlug, getAllSlugs, getRelatedArticles, extractHeadings, getRawContent } from '@/lib/articles';
import { getFacilityById } from '@/lib/facilities';
import { ARTICLE_CATEGORIES } from '@/lib/types';
import ArticleCard from '@/components/ArticleCard';
import FacilityCard from '@/components/FacilityCard';
import ShareButton from '@/components/ShareButton';
import TableOfContents from '@/components/TableOfContents';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: 'Not Found' };

  const { meta } = article;
  return {
    title: `${meta.title} | サウナ子`,
    description: meta.description,
    alternates: {
      canonical: `https://www.saunako.jp/articles/${meta.slug}`,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'article',
      publishedTime: meta.publishedAt,
      modifiedTime: meta.updatedAt,
      authors: [meta.author],
      tags: meta.tags,
      images: [
        {
          url: meta.thumbnail.startsWith('http') ? meta.thumbnail : `https://www.saunako.jp${meta.thumbnail}`,
          width: 1200,
          height: 630,
          alt: meta.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: [meta.thumbnail.startsWith('http') ? meta.thumbnail : `https://www.saunako.jp${meta.thumbnail}`],
    },
  };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const { meta, content } = article;
  const categoryLabel = ARTICLE_CATEGORIES.find((c) => c.slug === meta.category)?.label || meta.category;

  const rawContent = getRawContent(slug);
  const headings = rawContent ? extractHeadings(rawContent) : [];

  const relatedFacilities = (meta.facilityIds || [])
    .map((id) => getFacilityById(id))
    .filter((f): f is NonNullable<typeof f> => f != null);

  const relatedArticles = getRelatedArticles(meta.slug, {
    category: meta.category,
    facilityIds: meta.facilityIds,
  });

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'TOP', item: 'https://www.saunako.jp/' },
      { '@type': 'ListItem', position: 2, name: '記事一覧', item: 'https://www.saunako.jp/articles' },
      { '@type': 'ListItem', position: 3, name: categoryLabel, item: `https://www.saunako.jp/articles/category/${meta.category}` },
      { '@type': 'ListItem', position: 4, name: meta.title, item: `https://www.saunako.jp/articles/${meta.slug}` },
    ],
  };

  const toISOWithTZ = (date: string) => `${date}T00:00:00+09:00`;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: meta.title,
    description: meta.description,
    datePublished: toISOWithTZ(meta.publishedAt),
    dateModified: toISOWithTZ(meta.updatedAt),
    author: {
      '@type': 'Person',
      name: meta.author,
      url: 'https://www.saunako.jp',
    },
    publisher: {
      '@type': 'Organization',
      name: 'サウナ子',
      url: 'https://www.saunako.jp',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.saunako.jp/articles/${meta.slug}`,
    },
    image: meta.thumbnail.startsWith('http') ? meta.thumbnail : `https://www.saunako.jp${meta.thumbnail}`,
  };

  return (
    <div className="min-h-screen bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <main className="max-w-6xl mx-auto px-4 py-6 md:py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-text-secondary mb-6">
          <Link href="/" className="hover:text-primary transition-colors">TOP</Link>
          <span className="mx-2">{'>'}</span>
          <Link href="/articles" className="hover:text-primary transition-colors">記事一覧</Link>
          <span className="mx-2">{'>'}</span>
          <Link href={`/articles/category/${meta.category}`} className="hover:text-primary transition-colors">{categoryLabel}</Link>
          <span className="mx-2">{'>'}</span>
          <span className="text-text-primary">{meta.title}</span>
        </nav>

        {/* Article Header */}
        <div className="bg-surface rounded-xl border border-border p-6 md:p-8 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-block bg-saunako text-white text-xs font-medium px-2.5 py-1 rounded-full">
              {categoryLabel}
            </span>
            {!meta.published && (
              <span className="inline-block bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                DRAFT
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-4 leading-tight">
            {meta.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            <div className="flex items-center gap-2">
              <Image
                src="/saunako-avatar.webp"
                alt={meta.author}
                width={28}
                height={28}
                className="w-7 h-7 rounded-full object-cover"
              />
              <span>{meta.author}</span>
            </div>
            <time dateTime={meta.publishedAt}>
              {new Date(meta.publishedAt).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <span>{meta.readingTime}分で読める</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Article Body */}
          <article className="flex-1 min-w-0 bg-surface rounded-xl border border-border p-6 md:p-8">
            <div className="prose-custom">
              {content}
            </div>
          </article>

          {/* Sidebar - TOC */}
          {headings.length > 0 && (
            <TableOfContents headings={headings} />
          )}
        </div>

        {/* Share Buttons */}
        <div className="flex items-center gap-4 mt-6 bg-surface rounded-xl border border-border p-5">
          <span className="text-sm font-medium text-text-primary">シェアする</span>
          <ShareButton name={meta.title} url={`/articles/${meta.slug}`} />
        </div>

        {/* この記事で紹介した施設 */}
        {relatedFacilities.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg md:text-xl font-bold text-text-primary mb-4">
              この記事で紹介した施設
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:gap-4 md:overflow-x-visible md:pb-0 scrollbar-hide">
              {relatedFacilities.map((facility, i) => (
                <div key={facility.id} className="min-w-[260px] md:min-w-0 flex-shrink-0 md:flex-shrink">
                  <FacilityCard facility={facility} index={i} showComment={false} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg md:text-xl font-bold text-text-primary mb-4">
              関連記事
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {relatedArticles.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
