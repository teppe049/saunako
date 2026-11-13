'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import FacilityListCard from '@/components/FacilityListCard';
import FavoritesView from '@/components/FavoritesView';
import { getFacilitiesByIds } from '@/lib/facilitiesClient';
import type { Facility } from '@/lib/types';

function parseIds(raw: string | null): number[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => Number.isInteger(n) && n > 0);
}

/**
 * /favorites の中身。?ids=1,2 付きで来たら共有されたリスト、無ければ自分のお気に入り。
 * 有効な ID が1件も無い共有リンクは、自分のお気に入りを出す。
 */
export default function FavoritesContent() {
  const searchParams = useSearchParams();
  const rawIds = searchParams.get('ids');
  const [shared, setShared] = useState<{ key: string; facilities: Facility[] } | null>(null);

  useEffect(() => {
    const ids = parseIds(rawIds);
    if (ids.length === 0) return;
    let active = true;
    getFacilitiesByIds(ids).then((facilities) => {
      if (active) setShared({ key: rawIds ?? '', facilities });
    });
    return () => {
      active = false;
    };
  }, [rawIds]);

  const wantsShared = parseIds(rawIds).length > 0;
  const loaded = shared !== null && shared.key === rawIds;
  if (wantsShared && !loaded) return null;

  if (wantsShared && shared && shared.facilities.length > 0) {
    return (
      <>
        <h1 className="text-xl md:text-2xl font-bold text-text-primary mb-1">共有されたお気に入りリスト</h1>
        <p className="text-text-secondary text-sm mb-6">{shared.facilities.length}件の個室サウナ</p>
        <div className="flex flex-col divide-y divide-border">
          {shared.facilities.map((facility, index) => (
            <FacilityListCard key={facility.id} facility={facility} index={index} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/favorites"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors"
          >
            自分のお気に入りを見る
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="text-xl md:text-2xl font-bold text-text-primary mb-6">お気に入り</h1>
      <FavoritesView />
    </>
  );
}
