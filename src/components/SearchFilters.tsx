'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchFiltersProps {
  totalCount: number;
  filteredCount: number;
  prefectureLabel?: string;
}

type FilterKey = 'waterBath' | 'selfLoyly' | 'outdoorAir' | 'coupleOk';

const filterLabels: Record<FilterKey, string> = {
  waterBath: '水風呂あり',
  selfLoyly: 'ロウリュ可',
  outdoorAir: '外気浴あり',
  coupleOk: '男女OK',
};

export default function SearchFilters({ totalCount, filteredCount, prefectureLabel }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    waterBath: searchParams.get('waterBath') === 'true',
    selfLoyly: searchParams.get('selfLoyly') === 'true',
    outdoorAir: searchParams.get('outdoorAir') === 'true',
    coupleOk: searchParams.get('coupleOk') === 'true',
  });

  const activeFilters = (Object.keys(filters) as FilterKey[]).filter((key) => filters[key]);

  const toggleFilter = (key: FilterKey) => {
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

  const removeFilter = (key: FilterKey) => {
    const newFilters = { ...filters, [key]: false };
    setFilters(newFilters);

    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const clearAllFilters = () => {
    setFilters({
      waterBath: false,
      selfLoyly: false,
      outdoorAir: false,
      coupleOk: false,
    });

    const params = new URLSearchParams();
    const prefecture = searchParams.get('prefecture');
    if (prefecture) params.set('prefecture', prefecture);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="border-b border-border pb-4 mb-0">
      {/* Result Count */}
      <p className="text-text-primary mb-4">
        {prefectureLabel ? `${prefectureLabel}で` : ''}
        {filteredCount}件のプライベートサウナが見つかりました
      </p>

      {/* Active Filter Tags */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {activeFilters.map((key) => (
            <button
              key={key}
              onClick={() => removeFilter(key)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <span>{filterLabels[key]}</span>
              <span className="text-white/80">×</span>
            </button>
          ))}
          <button
            onClick={clearAllFilters}
            className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
          >
            すべてクリア
          </button>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="text-sm text-text-tertiary mr-1">絞り込み:</span>
        {(Object.keys(filters) as FilterKey[]).map((key) => (
          <button
            key={key}
            onClick={() => toggleFilter(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
              filters[key]
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-text-secondary border-border hover:border-primary hover:text-primary'
            }`}
          >
            {filterLabels[key]}
          </button>
        ))}
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <select className="px-3 py-1.5 border border-border rounded-md text-sm text-text-secondary bg-white">
            <option value="recommend">おすすめ順</option>
            <option value="price-asc">価格が安い順</option>
            <option value="price-desc">価格が高い順</option>
            <option value="distance">駅から近い順</option>
          </select>
        </div>
        <span className="text-sm text-text-tertiary">
          {filteredCount}/{totalCount}件
        </span>
      </div>
    </div>
  );
}
