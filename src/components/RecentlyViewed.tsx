'use client';

import { useSyncExternalStore, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Facility } from '@/lib/types';

const STORAGE_KEY = 'saunako_recent';
const EMPTY: number[] = [];

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

export default function RecentlyViewed({ allFacilities }: { allFacilities: Facility[] }) {
  const recentIds = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const recentFacilities = useMemo(() => {
    if (recentIds.length === 0) return [];
    const facilityMap = new Map(allFacilities.map((f) => [f.id, f]));
    return recentIds.map((id) => facilityMap.get(id)).filter((f): f is Facility => !!f);
  }, [recentIds, allFacilities]);

  if (recentFacilities.length === 0) return null;

  return (
    <section className="bg-bg py-6 md:py-12">
      <div className="max-w-7xl mx-auto px-5 md:px-20">
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-text-primary">最近見た施設</h2>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 pr-5 md:grid md:grid-cols-3 md:gap-6 md:overflow-x-visible md:pb-0 md:pr-0 scrollbar-hide">
          {recentFacilities.slice(0, 6).map((facility) => (
            <Link
              key={facility.id}
              href={`/facilities/${facility.id}`}
              className="min-w-[72vw] w-[72vw] md:min-w-0 md:w-auto bg-surface rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden flex-shrink-0 md:flex-shrink"
            >
              <div className="relative h-[140px] md:h-[180px] bg-gray-200 flex items-center justify-center overflow-hidden">
                <Image
                  src={facility.images.length > 0 ? facility.images[0] : '/placeholder-facility.svg'}
                  alt={facility.name}
                  fill
                  sizes="(max-width: 768px) 72vw, 33vw"
                  className={facility.images.length > 0 ? 'object-cover' : 'object-contain p-4'}
                />
              </div>

              <div className="p-4 md:p-5">
                <h3 className="text-base md:text-lg font-semibold text-text-primary mb-1">
                  {facility.name}
                </h3>
                <p className="text-[13px] text-text-tertiary mb-3">
                  {facility.nearestStation && facility.walkMinutes > 0
                    ? `${facility.nearestStation}${facility.nearestStation.includes('駅') ? '' : '駅'} 徒歩${facility.walkMinutes}分 | `
                    : ''}{facility.area}
                </p>

                <div className="flex items-center justify-between">
                  <p className="text-saunako text-sm md:text-base font-bold">
                    {facility.priceMin > 0 ? (
                      <>
                        ¥{facility.priceMin.toLocaleString()}〜
                        <span className="text-text-tertiary text-xs md:text-sm font-normal ml-1">/ 1時間</span>
                      </>
                    ) : (
                      <span className="text-text-tertiary text-xs md:text-sm font-normal">要問合せ</span>
                    )}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
