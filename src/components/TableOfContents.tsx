'use client';

import { useEffect, useState } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px' }
    );

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [headings]);

  return (
    <aside className="md:w-64 md:flex-shrink-0">
      {/* モバイル: 折りたたみ可能なインライン目次 */}
      <details className="md:hidden bg-surface rounded-xl border border-border p-5 mb-4" open>
        <summary className="font-bold text-text-primary text-sm cursor-pointer list-none flex items-center justify-between">
          <span>目次</span>
          <svg className="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <nav className="space-y-2 mt-3">
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className={`block text-sm transition-colors ${
                heading.level === 3 ? 'pl-4' : ''
              } ${
                activeId === heading.id
                  ? 'text-saunako font-medium'
                  : 'text-text-secondary hover:text-primary'
              }`}
            >
              {heading.text}
            </a>
          ))}
        </nav>
      </details>

      {/* PC: サイドバー固定表示 */}
      <div className="hidden md:block sticky top-6 bg-surface rounded-xl border border-border p-5">
        <h4 className="font-bold text-text-primary text-sm mb-3">目次</h4>
        <nav className="space-y-2">
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className={`block text-sm transition-colors ${
                heading.level === 3 ? 'pl-4' : ''
              } ${
                activeId === heading.id
                  ? 'text-saunako font-medium'
                  : 'text-text-secondary hover:text-primary'
              }`}
            >
              {heading.text}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
