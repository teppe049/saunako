'use client';

import { useSyncExternalStore, useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { History } from 'lucide-react';
import { getFavoriteFacilities } from '@/app/favorites/actions';
import type { Facility } from '@/lib/types';

// RecordVisit / RecentlyViewed と同じキー
const STORAGE_KEY = 'saunako_recent';
const EMPTY: number[] = [];
// 検索結果上部に出す件数。1行に収まる範囲
const MAX_CHIPS = 5;

let cached: { raw: string | null; ids: number[] } = { raw: null, ids: EMPTY };

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== cached.raw) {
      cached = { raw, ids: raw ? JSON.parse(raw) : EMPTY };
    }
    return cached.ids;
  } catch {
    return EMPTY;
  }
}

function getServerSnapshot() {
  return EMPTY;
}

/**
 * 「最近見た施設」のコンパクト版（横並びチップ）。
 * 検索結果の上に置き、再訪ユーザーが前回の施設へ1タップで戻れるようにする。
 */
export default function RecentlyViewedChips({ className = '' }: { className?: string }) {
  const recentIds = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const ids = recentIds.slice(0, MAX_CHIPS);
    startTransition(async () => {
      setFacilities(ids.length === 0 ? [] : await getFavoriteFacilities(ids));
    });
  }, [recentIds]);

  if (facilities.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 overflow-x-auto scrollbar-hide px-4 md:px-6 py-2 bg-surface border-b border-border ${className}`}>
      <span className="flex items-center gap-1 text-xs text-text-tertiary flex-shrink-0">
        <History size={12} aria-hidden="true" />
        最近見た
      </span>
      {facilities.map((f) => (
        <Link
          key={f.id}
          href={`/facilities/${f.id}`}
          className="flex-shrink-0 inline-flex items-center gap-1 rounded-full border border-border bg-bg px-3 py-1 text-xs text-text-primary hover:border-primary hover:text-primary transition-colors max-w-[180px]"
          data-track-click="recent_chip"
          data-track-facility-id={f.id}
        >
          <span className="truncate">{f.name}</span>
          {f.priceMin > 0 && <span className="text-text-tertiary flex-shrink-0">¥{f.priceMin.toLocaleString()}〜</span>}
        </Link>
      ))}
    </div>
  );
}
