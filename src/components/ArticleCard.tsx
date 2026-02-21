import Link from 'next/link';
import Image from 'next/image';
import { ArticleMeta, ARTICLE_CATEGORIES } from '@/lib/types';

interface ArticleCardProps {
  article: ArticleMeta;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const categoryLabel = ARTICLE_CATEGORIES.find((c) => c.slug === article.category)?.label || article.category;

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="block bg-surface border border-border rounded-xl hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="relative h-44 bg-gray-200">
        <Image
          src={article.thumbnail}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />
        <span className="absolute top-3 left-3 bg-saunako text-white text-xs font-medium px-2.5 py-1 rounded-full">
          {categoryLabel}
        </span>
        {!article.published && (
          <span className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            DRAFT
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-text-primary mb-2 line-clamp-2">{article.title}</h3>
        <p className="text-sm text-text-secondary mb-3 line-clamp-2">{article.description}</p>
        <div className="flex items-center gap-3 text-xs text-text-tertiary">
          <time dateTime={article.publishedAt}>
            {new Date(article.publishedAt).toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
          <span>{article.readingTime}分で読める</span>
        </div>
      </div>
    </Link>
  );
}
