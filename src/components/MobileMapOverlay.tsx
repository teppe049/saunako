'use client';

import dynamic from 'next/dynamic';
import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  const [nearbyFacilities, setNearbyFacilities] = useState<Facility[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback((facility: Facility) => {
    setSelectedFacility(facility);

    // Find nearby facilities for the carousel (same area or closest)
    const validFacilities = facilities.filter((f) => f.lat && f.lng && f.id !== facility.id);
    const withDistance = validFacilities.map((f) => ({
      facility: f,
      distance: Math.sqrt(
        Math.pow((f.lat! - facility.lat!) * 111, 2) +
        Math.pow((f.lng! - facility.lng!) * 91, 2)
      ),
    }));
    withDistance.sort((a, b) => a.distance - b.distance);
    setNearbyFacilities([facility, ...withDistance.slice(0, 9).map((d) => d.facility)]);

    // Reset carousel scroll
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [facilities]);

  const handleCardTap = useCallback((facility: Facility) => {
    setSelectedFacility(facility);
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
          className="flex items-center justify-center w-8 h-8 rounded-full bg-[#F0F0F0] hover:bg-gray-200 transition-colors"
          aria-label="地図を閉じる"
        >
          <svg className="w-4 h-4 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <FacilityMap
          facilities={facilities}
          selectedId={selectedFacility?.id}
          onSelect={handleSelect}
          hideHeader
        />

        {/* Bottom sheet: card carousel */}
        {selectedFacility && nearbyFacilities.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 z-[1000] pb-4">
            {/* Carousel */}
            <div
              ref={carouselRef}
              className="flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide snap-x snap-mandatory"
            >
              {nearbyFacilities.map((facility) => (
                <BottomSheetCard
                  key={facility.id}
                  facility={facility}
                  isSelected={selectedFacility.id === facility.id}
                  onTap={handleCardTap}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BottomSheetCard({
  facility,
  isSelected,
  onTap,
}: {
  facility: Facility;
  isSelected: boolean;
  onTap: (f: Facility) => void;
}) {
  const hasImage = facility.images.length > 0;

  return (
    <div
      onClick={() => onTap(facility)}
      className={`flex-shrink-0 w-[280px] snap-start bg-white rounded-xl shadow-lg border overflow-hidden transition-all ${
        isSelected ? 'border-saunako ring-1 ring-saunako' : 'border-gray-200'
      }`}
    >
      <div className="flex gap-3 p-3">
        {/* Thumbnail */}
        <div className="relative flex-shrink-0 w-[80px] h-[80px] bg-gray-200 rounded-lg overflow-hidden">
          {hasImage ? (
            <Image
              src={facility.images[0]}
              alt={facility.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <h3 className="font-bold text-sm text-text-primary truncate">{facility.name}</h3>
            {facility.nearestStation && facility.walkMinutes > 0 && (
              <p className="text-[11px] text-text-tertiary mt-0.5">
                {facility.nearestStation}{facility.nearestStation.includes('駅') ? '' : '駅'} 徒歩{facility.walkMinutes}分
              </p>
            )}
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm font-bold text-saunako">
              {facility.priceMin > 0 ? `¥${facility.priceMin.toLocaleString()}〜` : '要問合せ'}
            </span>
            <Link
              href={`/facilities/${facility.id}`}
              className="text-[11px] text-saunako font-medium hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              詳細 →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
