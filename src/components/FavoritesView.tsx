'use client';

import { useSyncExternalStore, useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { subscribe, getSnapshot, getServerSnapshot } from '@/lib/favoritesStore';
import { getFavoriteFacilities } from '@/app/favorites/actions';
import FacilityListCard from '@/components/FacilityListCard';
import type { Facility } from '@/lib/types';

export default function FavoritesView() {
  const favoriteIds = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isPending, startTransition] = useTransition();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    startTransition(async () => {
      if (favoriteIds.length === 0) {
        setFacilities([]);
      } else {
        const data = await getFavoriteFacilities(favoriteIds);
        setFacilities(data);
      }
      setInitialized(true);
    });
  }, [favoriteIds]);

  if (!initialized) {
    return (
      <div className="flex flex-col divide-y divide-border">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="py-4 animate-pulse">
            <div className="flex gap-4">
              <div className="w-[100px] h-[75px] md:w-[180px] md:h-[120px] bg-gray-200 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (facilities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <p className="text-text-secondary text-lg mb-2">まだお気に入りがありません</p>
        <p className="text-text-tertiary text-sm mb-6">気になる施設のハートアイコンをタップして保存しよう</p>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors"
        >
          施設を探す
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {facilities.map((facility, index) => (
        <FacilityListCard key={facility.id} facility={facility} index={index} />
      ))}
      {isPending && (
        <div className="py-4 text-center text-text-tertiary text-sm">更新中...</div>
      )}
    </div>
  );
}
