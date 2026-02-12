'use client';

import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';
import Link from 'next/link';
import type { Facility } from '@/lib/types';

const FacilityMap = dynamic(() => import('./FacilityMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <p className="text-text-tertiary">地図を読み込み中...</p>
    </div>
  ),
});

interface MobileMapOverlayProps {
  facilities: Facility[];
  onClose: () => void;
}

export default function MobileMapOverlay({ facilities, onClose }: MobileMapOverlayProps) {
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  const handleSelect = useCallback((facility: Facility) => {
    setSelectedFacility(facility);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedFacility(null);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
        <span className="text-base font-semibold text-text-primary">
          エリアマップ
          <span className="ml-2 text-sm font-normal text-text-secondary">
            {facilities.filter((f) => f.lat && f.lng).length}件
          </span>
        </span>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F0F0F0] rounded-full text-sm text-text-primary hover:bg-gray-200 transition-colors"
          aria-label="地図を閉じる"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>閉じる</span>
        </button>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <FacilityMap
          facilities={facilities}
          selectedId={selectedFacility?.id}
          onSelect={handleSelect}
        />

        {/* Selected facility card */}
        {selectedFacility && (
          <div className="absolute bottom-4 left-4 right-4 z-[1000]">
            <div className="bg-white rounded-xl shadow-lg border border-border p-4">
              <button
                onClick={handleClearSelection}
                className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="選択を解除"
              >
                <svg className="w-3.5 h-3.5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="font-bold text-sm text-text-primary pr-8 mb-1">
                {selectedFacility.name}
              </h3>
              {selectedFacility.nearestStation && selectedFacility.walkMinutes > 0 && (
                <p className="text-xs text-text-secondary mb-1.5">
                  {selectedFacility.nearestStation}
                  {selectedFacility.nearestStation.includes('駅') ? '' : '駅'} 徒歩{selectedFacility.walkMinutes}分
                </p>
              )}
              <p className="text-sm font-bold text-saunako mb-2.5">
                {selectedFacility.priceMin > 0
                  ? `\u00A5${selectedFacility.priceMin.toLocaleString()}/${selectedFacility.duration}分〜`
                  : '要問合せ'}
              </p>
              <Link
                href={`/facilities/${selectedFacility.id}`}
                className="block w-full text-center py-2 bg-saunako text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                詳細を見る
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
