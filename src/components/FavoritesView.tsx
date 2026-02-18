'use client';

import { useSyncExternalStore, useMemo } from 'react';
import Link from 'next/link';
import { subscribe, getSnapshot, getServerSnapshot } from '@/lib/favoritesStore';
import FacilityListCard from '@/components/FacilityListCard';
import type { Facility } from '@/lib/types';

export default function FavoritesView({ allFacilities }: { allFacilities: Facility[] }) {
  const favoriteIds = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const favoriteFacilities = useMemo(() => {
    if (favoriteIds.length === 0) return [];
    const facilityMap = new Map(allFacilities.map((f) => [f.id, f]));
    return favoriteIds.map((id) => facilityMap.get(id)).filter((f): f is Facility => !!f);
  }, [favoriteIds, allFacilities]);

  if (favoriteFacilities.length === 0) {
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
      {favoriteFacilities.map((facility, index) => (
        <FacilityListCard key={facility.id} facility={facility} index={index} />
      ))}
    </div>
  );
}
