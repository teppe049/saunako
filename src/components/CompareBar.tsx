'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { subscribe, getSnapshot, getServerSnapshot, removeCompare, clearCompare } from '@/lib/compareStore';

/**
 * 比較対象が1件以上あるとき画面下部に固定表示されるバー。
 * モバイルはボトムナビ(h-14)の上、PC(md以上)は画面最下部に張り付く。
 */
export default function CompareBar() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (items.length === 0) return null;

  const compareUrl = `/compare?ids=${items.map((i) => i.id).join(',')}`;

  return (
    <div className="fixed bottom-14 md:bottom-0 inset-x-0 z-40 bg-white border-t border-border shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
      <div className="max-w-[1440px] mx-auto px-3 md:px-6 h-14 flex items-center gap-2 md:gap-3">
        <div className="flex items-center gap-1.5 md:gap-2 flex-1 min-w-0 overflow-x-auto scrollbar-hide">
          {items.map((item) => (
            <div key={item.id} className="relative flex-shrink-0">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-200 border border-border">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill sizes="40px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[9px] text-text-tertiary px-0.5 text-center leading-tight">
                    {item.name.slice(0, 4)}
                  </div>
                )}
              </div>
              <button
                onClick={() => removeCompare(item.id)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-text-primary text-white flex items-center justify-center shadow-sm"
                aria-label={`${item.name}を比較から外す`}
              >
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={clearCompare}
          className="text-[12px] md:text-[13px] text-text-tertiary hover:text-text-secondary transition-colors flex-shrink-0"
        >
          クリア
        </button>

        <Link
          href={compareUrl}
          className={`flex-shrink-0 px-4 md:px-5 py-2 rounded-full text-[13px] md:text-sm font-bold transition-opacity ${
            items.length >= 2
              ? 'bg-primary text-white hover:opacity-90'
              : 'bg-gray-200 text-text-tertiary pointer-events-none'
          }`}
          aria-disabled={items.length < 2}
          data-track-click="compare_bar_open"
        >
          比較する({items.length})
        </Link>
      </div>
    </div>
  );
}
