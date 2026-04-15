import Link from 'next/link';
import Image from 'next/image';
import { getFacilityById } from '@/lib/facilities';
import type { MDXComponents } from 'mdx/types';

function FacilityCard({ id }: { id: number }) {
  const facility = getFacilityById(id);
  if (!facility) return null;

  // 最大3枚まで表示（競合サイトは2〜10枚の写真掲載が標準）
  const galleryImages = facility.images.slice(0, 3);

  return (
    <div className="not-prose block bg-surface border border-border rounded-xl overflow-hidden my-6">
      {/* 複数画像ギャラリー（横スクロール） */}
      {galleryImages.length > 0 && (
        <Link
          href={`/facilities/${facility.id}`}
          className="block hover:opacity-95 transition-opacity"
        >
          <div className="flex gap-1 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
            {galleryImages.map((img, i) => (
              <div
                key={i}
                className="relative flex-shrink-0 w-full sm:w-1/2 md:w-1/3 aspect-[4/3] bg-gray-200 snap-start"
              >
                <Image
                  src={img}
                  alt={`${facility.name} ${i + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </div>
        </Link>
      )}

      {/* 施設情報テーブル（競合共通の情報密度に合わせる） */}
      <div className="p-4">
        <Link href={`/facilities/${facility.id}`} className="hover:text-primary transition-colors">
          <h4 className="font-bold text-text-primary mb-3">{facility.name}</h4>
        </Link>

        <dl className="text-sm space-y-1.5 mb-3">
          {facility.nearestStation && (facility.walkMinutes ?? 0) > 0 && (
            <div className="flex">
              <dt className="text-text-tertiary w-20 flex-shrink-0">アクセス</dt>
              <dd className="text-text-primary">
                {facility.nearestStation}{facility.nearestStation.includes('駅') ? '' : '駅'} 徒歩{facility.walkMinutes}分
              </dd>
            </div>
          )}
          {facility.priceMin > 0 && (
            <div className="flex">
              <dt className="text-text-tertiary w-20 flex-shrink-0">料金</dt>
              <dd className="text-text-primary">
                <span className="font-bold text-saunako">{facility.priceMin.toLocaleString()}円</span>
                <span className="text-text-secondary">〜 / {facility.duration}分</span>
              </dd>
            </div>
          )}
        </dl>

        <div className="flex flex-wrap gap-1 mb-3">
          {facility.features.waterBath && <span className="tag tag-primary">水風呂</span>}
          {facility.features.selfLoyly && <span className="tag tag-primary">ロウリュ可</span>}
          {facility.features.outdoorAir && <span className="tag tag-primary">外気浴</span>}
          {facility.features.coupleOk && <span className="tag tag-available">男女OK</span>}
        </div>

        <Link
          href={`/facilities/${facility.id}`}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          施設の詳細を見る
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-');
}

export const mdxComponents: MDXComponents = {
  FacilityCard,
  h2: ({ children, ...props }) => {
    const text = typeof children === 'string' ? children : '';
    const id = slugify(text);
    return (
      <h2 id={id} className="text-xl md:text-2xl font-bold text-text-primary mt-10 mb-4 scroll-mt-20" {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ children, ...props }) => {
    const text = typeof children === 'string' ? children : '';
    const id = slugify(text);
    return (
      <h3 id={id} className="text-lg md:text-xl font-semibold text-text-primary mt-8 mb-3 scroll-mt-20" {...props}>
        {children}
      </h3>
    );
  },
  h4: ({ children, ...props }) => {
    const text = typeof children === 'string' ? children : '';
    const id = slugify(text);
    return (
      <h4 id={id} className="text-base md:text-lg font-semibold text-text-primary mt-6 mb-2 scroll-mt-20" {...props}>
        {children}
      </h4>
    );
  },
  p: ({ children, ...props }) => (
    <p className="text-text-secondary text-[15px] leading-[1.8] mb-4" {...props}>{children}</p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="list-disc list-inside text-text-secondary text-[15px] leading-[1.8] mb-4 space-y-1" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal list-inside text-text-secondary text-[15px] leading-[1.8] mb-4 space-y-1" {...props}>{children}</ol>
  ),
  a: ({ href, children, ...props }) => {
    const isExternal = href?.startsWith('http');
    if (isExternal) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" {...props}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href || '#'} className="text-primary hover:underline" {...props}>
        {children}
      </Link>
    );
  },
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto mb-4">
      <table className="w-full text-sm border-collapse border border-border" {...props}>{children}</table>
    </div>
  ),
  th: ({ children, ...props }) => (
    <th className="border border-border bg-bg px-3 py-2 text-left font-semibold text-text-primary" {...props}>{children}</th>
  ),
  td: ({ children, ...props }) => (
    <td className="border border-border px-3 py-2 text-text-secondary" {...props}>{children}</td>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote className="border-l-4 border-saunako pl-4 my-4 text-text-secondary italic" {...props}>{children}</blockquote>
  ),
  img: ({ src, alt, ...props }) => (
    <span className="block my-4">
      <Image
        src={src || ''}
        alt={alt || ''}
        width={800}
        height={450}
        className="rounded-lg w-full h-auto"
        {...props}
      />
    </span>
  ),
};
