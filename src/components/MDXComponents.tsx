import Link from 'next/link';
import Image from 'next/image';
import { getFacilityById } from '@/lib/facilities';
import type { MDXComponents } from 'mdx/types';

function FacilityCard({ id }: { id: number }) {
  const facility = getFacilityById(id);
  if (!facility) return null;

  return (
    <Link
      href={`/facilities/${facility.id}`}
      className="not-prose block bg-surface border border-border rounded-xl hover:shadow-md transition-shadow overflow-hidden my-4"
    >
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-40 sm:h-auto sm:w-48 flex-shrink-0 bg-gray-200">
          <Image
            src={facility.images.length > 0 ? facility.images[0] : '/placeholder-facility.svg'}
            alt={facility.name}
            fill
            sizes="(max-width: 640px) 100vw, 192px"
            className={facility.images.length > 0 ? 'object-cover' : 'object-contain p-4'}
          />
        </div>
        <div className="p-4">
          <h4 className="font-bold text-text-primary mb-1">{facility.name}</h4>
          {facility.nearestStation && facility.walkMinutes > 0 && (
            <p className="text-sm text-text-secondary mb-1">
              {facility.nearestStation}{facility.nearestStation.includes('駅') ? '' : '駅'} 徒歩{facility.walkMinutes}分
            </p>
          )}
          <p className="text-sm text-text-primary mb-2">
            {facility.priceMin > 0 ? (
              <>
                <span className="font-bold text-saunako">{facility.priceMin.toLocaleString()}円</span>
                <span className="text-text-secondary">〜 / {facility.duration}分</span>
              </>
            ) : (
              <span className="text-text-secondary">要問合せ</span>
            )}
          </p>
          <div className="flex flex-wrap gap-1">
            {facility.features.waterBath && <span className="tag tag-primary">水風呂</span>}
            {facility.features.selfLoyly && <span className="tag tag-primary">ロウリュ可</span>}
            {facility.features.outdoorAir && <span className="tag tag-primary">外気浴</span>}
            {facility.features.coupleOk && <span className="tag tag-available">男女OK</span>}
          </div>
        </div>
      </div>
    </Link>
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
