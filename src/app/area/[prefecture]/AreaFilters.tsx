'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import FacilityCard from '@/components/FacilityCard';
import { Facility } from '@/lib/types';
import { getOpenStatus, isAvailableNow } from '@/lib/openHours';
import { useNow } from '@/lib/useNow';

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
  const [openNow, setOpenNow] = useState(searchParams.get('now') === '1');
  const now = useNow();

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

  const toggleOpenNow = () => {
    const next = !openNow;
    setOpenNow(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next) {
      params.set('now', '1');
    } else {
      params.delete('now');
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const featureFiltered = useMemo(() => {
    return facilities.filter((facility) => {
      if (filters.waterBath && !facility.features.waterBath) return false;
      if (filters.selfLoyly && !facility.features.selfLoyly) return false;
      if (filters.outdoorAir && !facility.features.outdoorAir) return false;
      if (filters.coupleOk && !facility.features.coupleOk) return false;
      return true;
    });
  }, [facilities, filters]);

  // 「今から行ける」は時刻依存なのでハイドレーション後（now が入ってから）に絞る。
  // 営業時間を読み取れない施設は隠しきらず、別枠で残す
  const { filteredFacilities, unknownHours } = useMemo(() => {
    if (!openNow || !now) return { filteredFacilities: featureFiltered, unknownHours: [] as Facility[] };
    const available: Facility[] = [];
    const unknown: Facility[] = [];
    for (const f of featureFiltered) {
      const status = getOpenStatus(f, now);
      if (isAvailableNow(status)) available.push(f);
      else if (status.kind === 'unknown') unknown.push(f);
    }
    return { filteredFacilities: available, unknownHours: unknown };
  }, [featureFiltered, openNow, now]);

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
            type="button"
            onClick={toggleOpenNow}
            aria-pressed={openNow}
            data-track-click="filter_chip"
            data-track-filter="openNow"
            data-track-page-type="area"
            className={`tag inline-flex items-center gap-1 font-bold transition-colors ${openNow ? 'bg-primary-strong text-white' : 'bg-gray-100 text-text-primary hover:bg-gray-200'}`}
          >
            <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            今から行ける
          </button>
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
            男女OK
          </button>
          <span className="ml-auto text-sm text-text-secondary">
            {openNow && now ? `今から行ける ${filteredFacilities.length}件 / ` : ''}
            {openNow && now ? `全${facilities.length}件` : `${filteredFacilities.length}/${facilities.length}件`}
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
        {filteredFacilities.map((facility, index) => (
          <FacilityCard key={facility.id} facility={facility} index={index} />
        ))}
      </div>

      {filteredFacilities.length === 0 && facilities.length > 0 && (
        <div className="text-center py-12 bg-surface rounded-xl border border-border">
          <p className="text-text-secondary mb-2">
            {openNow ? '今から行ける施設が見つからなかったよ' : '条件に一致する施設がありません'}
          </p>
          <p className="text-sm text-text-tertiary">
            {openNow ? '「今から行ける」を外すと、ほかの時間に行ける施設も見られるよ' : 'フィルターを変更してお試しください'}
          </p>
        </div>
      )}

      {unknownHours.length > 0 && (
        <details className="mt-8 bg-surface border border-border rounded-xl p-4">
          <summary className="cursor-pointer text-sm font-bold text-text-primary">
            営業時間を確認できない施設 {unknownHours.length}件
            <span className="ml-2 font-normal text-text-tertiary">予約制など。行ける時間は予約ページで確認してね</span>
          </summary>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {unknownHours.map((facility, index) => (
              <FacilityCard key={facility.id} facility={facility} index={filteredFacilities.length + index} />
            ))}
          </div>
        </details>
      )}

      {facilities.length === 0 && (
        <div className="text-center py-12 bg-surface rounded-xl border border-border">
          <p className="text-text-secondary">このエリアには施設がありません</p>
        </div>
      )}
    </>
  );
}
