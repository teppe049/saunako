'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PREFECTURES } from '@/lib/types';

export default function HeroSearchForm() {
  const router = useRouter();
  const [selectedPrefecture, setSelectedPrefecture] = useState('');

  const handleSearch = () => {
    if (selectedPrefecture) {
      router.push(`/search?prefecture=${selectedPrefecture}`);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
      <select
        value={selectedPrefecture}
        onChange={(e) => setSelectedPrefecture(e.target.value)}
        className="flex-1 border border-border rounded-lg px-4 py-3 text-text-primary bg-surface"
      >
        <option value="">エリアを選択</option>
        {PREFECTURES.map((pref) => (
          <option key={pref.code} value={pref.code}>
            {pref.label}
          </option>
        ))}
      </select>
      <button
        onClick={handleSearch}
        disabled={!selectedPrefecture}
        className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        検索する
      </button>
    </div>
  );
}
