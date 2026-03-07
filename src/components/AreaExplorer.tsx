'use client';

import { useState } from 'react';
import Link from 'next/link';
import { REGION_GROUPS } from '@/lib/types';

interface AreaExplorerProps {
  /** prefecture code → facility count */
  counts: Record<string, number>;
}

export default function AreaExplorer({ counts }: AreaExplorerProps) {
  const [selectedRegion, setSelectedRegion] = useState(0);
  const region = REGION_GROUPS[selectedRegion];

  return (
    <section className="bg-surface py-6 md:py-12">
      <div className="max-w-7xl mx-auto px-5 md:px-20">
        <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-4 md:mb-6">
          エリアから探す
        </h2>

        {/* Region tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
          {REGION_GROUPS.map((r, i) => (
            <button
              key={r.code}
              onClick={() => setSelectedRegion(i)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                i === selectedRegion
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Prefecture chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {region.prefectures.map((pref) => {
            const count = counts[pref.code] || 0;
            return (
              <Link
                key={pref.code}
                href={`/area/${pref.code}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border bg-bg text-text-primary hover:border-primary hover:text-primary transition-colors"
              >
                <span className="text-sm font-medium">{pref.label}</span>
                <span className="text-xs text-text-tertiary">({count})</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
