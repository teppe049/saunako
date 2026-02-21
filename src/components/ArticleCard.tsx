import Link from 'next/link';
import Image from 'next/image';
import { ArticleMeta, ARTICLE_CATEGORIES } from '@/lib/types';

interface ArticleCardProps {
  article: ArticleMeta;
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  'area-guide': 'from-blue-400 to-blue-600',
  beginners: 'from-emerald-400 to-emerald-600',
  ranking: 'from-orange-400 to-orange-600',
  column: 'from-purple-400 to-purple-600',
};

export default function ArticleCard({ article }: ArticleCardProps) {
  const categoryLabel =
    ARTICLE_CATEGORIES.find((c) => c.slug === article.category)?.label || article.category;
  const gradient = CATEGORY_GRADIENTS[article.category] || 'from-gray-400 to-gray-600';

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="block bg-surface border border-border rounded-xl hover:shadow-md transition-shadow overflow-hidden"
    >
      <div
        className={`relative h-44 bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-2 px-4`}
      >
        <Image
          src="/saunako-avatar.webp"
          alt="サウナ子"
          width={64}
          height={64}
          className="rounded-full"
        />
        <p className="text-white text-sm font-bold text-center line-clamp-2">{article.title}</p>
        <span className="absolute top-3 left-3 bg-saunako text-white text-xs font-medium px-2.5 py-1 rounded-full">
          {categoryLabel}
        </span>
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
