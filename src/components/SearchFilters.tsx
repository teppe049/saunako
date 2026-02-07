'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchFiltersProps {
  totalCount: number;
  filteredCount: number;
}

export default function SearchFilters({ totalCount, filteredCount }: SearchFiltersProps) {
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

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm text-text-secondary mr-2">絞り込み:</span>
      <button
        onClick={() => toggleFilter('waterBath')}
        className={`tag ${filters.waterBath ? 'tag-primary' : 'bg-gray-100 text-text-secondary'}`}
      >
        水風呂あり
      </button>
      <button
        onClick={() => toggleFilter('selfLoyly')}
        className={`tag ${filters.selfLoyly ? 'tag-primary' : 'bg-gray-100 text-text-secondary'}`}
      >
        ロウリュ可
      </button>
      <button
        onClick={() => toggleFilter('outdoorAir')}
        className={`tag ${filters.outdoorAir ? 'tag-primary' : 'bg-gray-100 text-text-secondary'}`}
      >
        外気浴あり
      </button>
      <button
        onClick={() => toggleFilter('coupleOk')}
        className={`tag ${filters.coupleOk ? 'tag-primary' : 'bg-gray-100 text-text-secondary'}`}
      >
        カップルOK
      </button>
      <span className="ml-auto text-sm text-text-secondary">
        {filteredCount}/{totalCount}件
      </span>
    </div>
  );
}
