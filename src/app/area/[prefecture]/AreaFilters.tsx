'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FacilityCard from '@/components/FacilityCard';
import { Facility } from '@/lib/types';

interface AreaFiltersProps {
  facilities: Facility[];
  prefectureLabel: string;
}

export default function AreaFilters({ facilities, prefectureLabel }: AreaFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    waterBath: searchParams.get('waterBath') === 'true',
    selfLoyly: searchParams.get('selfLoyly') === 'true',
    outdoorAir: searchParams.get('outdoorAir') === 'true',
    coupleOk: searchParams.get('coupleOk') === 'true',
  });

  const toggleFilter = (key: keyof typeof filters) => {
    const newFilters = { ...filters, [key]: !filters[key] };
    setFilters(newFilters);

    const params = new URLSearchParams(searchParams.toString());
    if (newFilters[key]) {
      params.set(key, 'true');
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const filteredFacilities = useMemo(() => {
    return facilities.filter((facility) => {
      if (filters.waterBath && !facility.features.waterBath) return false;
      if (filters.selfLoyly && !facility.features.selfLoyly) return false;
      if (filters.outdoorAir && !facility.features.outdoorAir) return false;
      if (filters.coupleOk && !facility.features.coupleOk) return false;
      return true;
    });
  }, [facilities, filters]);

  // エリア内の人気の駅を集計
  const popularStations = useMemo(() => {
    const stationCount: Record<string, number> = {};
    facilities.forEach((f) => {
      const station = f.nearestStation;
      if (!station) return;
      stationCount[station] = (stationCount[station] || 0) + 1;
    });
    return Object.entries(stationCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([station, count]) => ({ station, count }));
  }, [facilities]);

  // 価格帯を算出
  const priceRange = useMemo(() => {
    if (facilities.length === 0) return { min: 0, max: 0, avg: 0 };
    const prices = facilities.map((f) => f.priceMin);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    return { min, max, avg };
  }, [facilities]);

  return (
    <>
      {/* Filters Section */}
      <div className="bg-surface border border-border rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-text-secondary mr-2">絞り込み:</span>
          <button
            onClick={() => toggleFilter('waterBath')}
            className={`tag ${filters.waterBath ? 'tag-primary' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'} transition-colors`}
          >
            水風呂あり
          </button>
          <button
            onClick={() => toggleFilter('selfLoyly')}
            className={`tag ${filters.selfLoyly ? 'tag-primary' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'} transition-colors`}
          >
            ロウリュ可
          </button>
          <button
            onClick={() => toggleFilter('outdoorAir')}
            className={`tag ${filters.outdoorAir ? 'tag-primary' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'} transition-colors`}
          >
            外気浴あり
          </button>
          <button
            onClick={() => toggleFilter('coupleOk')}
            className={`tag ${filters.coupleOk ? 'tag-primary' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'} transition-colors`}
          >
            カップルOK
          </button>
          <span className="ml-auto text-sm text-text-secondary">
            {filteredFacilities.length}/{facilities.length}件
          </span>
        </div>
      </div>

      {/* Area Features Section */}
      {facilities.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-5 mb-8">
          <h2 className="text-lg font-bold text-text-primary mb-4">
            {prefectureLabel}の個室サウナ情報
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 人気の駅 */}
            <div>
              <h3 className="text-sm font-semibold text-text-secondary mb-2">
                人気の駅
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularStations.map(({ station, count }) => (
                  <span
                    key={station}
                    className="inline-flex items-center px-3 py-1.5 bg-gray-50 text-text-primary rounded-lg text-sm"
                  >
                    {station}
                    <span className="ml-1.5 text-xs text-text-tertiary">({count}件)</span>
                  </span>
                ))}
              </div>
            </div>

            {/* 価格帯 */}
            <div>
              <h3 className="text-sm font-semibold text-text-secondary mb-2">
                価格帯
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-primary">
                  {priceRange.min.toLocaleString()}円
                </span>
                <span className="text-text-secondary">〜</span>
                <span className="text-lg font-semibold text-text-primary">
                  {priceRange.max.toLocaleString()}円
                </span>
              </div>
              <p className="text-sm text-text-tertiary mt-1">
                平均: {priceRange.avg.toLocaleString()}円
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Facility List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFacilities.map((facility) => (
          <FacilityCard key={facility.id} facility={facility} />
        ))}
      </div>

      {filteredFacilities.length === 0 && facilities.length > 0 && (
        <div className="text-center py-12 bg-surface rounded-xl border border-border">
          <p className="text-text-secondary mb-2">条件に一致する施設がありません</p>
          <p className="text-sm text-text-tertiary">
            フィルターを変更してお試しください
          </p>
        </div>
      )}

      {facilities.length === 0 && (
        <div className="text-center py-12 bg-surface rounded-xl border border-border">
          <p className="text-text-secondary">このエリアには施設がありません</p>
        </div>
      )}
    </>
  );
}
