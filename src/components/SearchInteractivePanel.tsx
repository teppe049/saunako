'use client';

import { useState, useRef, useCallback, useMemo, useSyncExternalStore } from 'react';
import FacilityListCard from './FacilityListCard';
import FacilityMapWrapper from './FacilityMapWrapper';
import MobileMapOverlay from './MobileMapOverlay';
import AdUnit from './AdUnit';
import type { MapBounds } from './FacilityMap';
import { Facility } from '@/lib/types';

interface Props {
  facilities: Facility[];
}

function isInBounds(facility: Facility, bounds: MapBounds): boolean {
  if (!facility.lat || !facility.lng) return false;
  return (
    facility.lat >= bounds.south &&
    facility.lat <= bounds.north &&
    facility.lng >= bounds.west &&
    facility.lng <= bounds.east
  );
}

export default function SearchInteractivePanel({ facilities }: Props) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [mobileMapOpen, setMobileMapOpen] = useState(false);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Track whether the map is visible (md breakpoint = 768px)
  const isMapVisible = useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia('(min-width: 768px)');
      mql.addEventListener('change', callback);
      return () => mql.removeEventListener('change', callback);
    },
    () => window.matchMedia('(min-width: 768px)').matches,
    () => false, // SSR snapshot: assume mobile (map hidden)
  );

  const visibleFacilities = useMemo(() => {
    // Skip bounds filtering when the map is not visible (mobile)
    if (!isMapVisible || !mapBounds) return facilities;
    return facilities.filter((f) => isInBounds(f, mapBounds));
  }, [facilities, mapBounds, isMapVisible]);

  const handleMapSelect = useCallback((facility: Facility) => {
    setSelectedId(facility.id);
    const cardEl = cardRefs.current.get(facility.id);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleCardHover = useCallback((id: number | null) => {
    setHoveredId(id);
  }, []);

  const handleBoundsChange = useCallback((bounds: MapBounds) => {
    setMapBounds(bounds);
  }, []);

  const setCardRef = useCallback((id: number, el: HTMLDivElement | null) => {
    if (el) {
      cardRefs.current.set(id, el);
    } else {
      cardRefs.current.delete(id);
    }
  }, []);

  return (
    <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
      {/* Left: List */}
      <div className="flex-1 md:flex-none md:w-[820px] overflow-y-auto">
        {/* Bounds filter indicator (only when map is visible) */}
        {isMapVisible && mapBounds && visibleFacilities.length !== facilities.length && (
          <div className="px-4 md:px-5 py-2 bg-[#F8F9FA] border-b border-border text-xs text-text-secondary">
            この範囲に <span className="font-bold text-text-primary">{visibleFacilities.length}件</span> の施設（全{facilities.length}件中）
          </div>
        )}

        <div className="px-4 md:px-0 py-2 md:py-0 flex flex-col gap-3 md:gap-0">
          {visibleFacilities.map((facility, index) => (
            <FacilityListCard
              key={facility.id}
              ref={(el) => setCardRef(facility.id, el)}
              facility={facility}
              index={index}
              isHovered={hoveredId === facility.id}
              isSelected={selectedId === facility.id}
              onHover={handleCardHover}
            />
          ))}
        </div>

        {/* 広告ユニット: リスト下部 */}
        {visibleFacilities.length > 0 && (
          <AdUnit
            slot="XXXXXXXXXX"
            format="horizontal"
            className="px-4 md:px-5 py-4 border-t border-border"
          />
        )}

        {visibleFacilities.length === 0 && (
          <div className="p-8 md:p-12 text-center">
            <div className="text-4xl md:text-5xl mb-4">🧖</div>
            <p className="text-text-secondary mb-2">
              {isMapVisible && mapBounds ? 'この範囲に施設がありません' : 'この条件に合う施設が見つかりませんでした'}
            </p>
            <p className="text-sm text-text-tertiary">
              {isMapVisible && mapBounds ? '地図を移動・縮小して範囲を広げてみてください' : '条件を変更して再検索してみてください'}
            </p>
          </div>
        )}
      </div>

      {/* Right: Map */}
      <div className="hidden md:block flex-1 bg-surface shadow-[-1px_0_3px_rgba(0,0,0,0.03)]">
        <FacilityMapWrapper
          facilities={facilities}
          hoveredId={hoveredId}
          selectedId={selectedId}
          onSelect={handleMapSelect}
          onBoundsChange={handleBoundsChange}
        />
      </div>

      {/* Mobile: Floating map button */}
      {!isMapVisible && facilities.length > 0 && (
        <button
          onClick={() => setMobileMapOpen(true)}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 md:hidden flex items-center gap-2 bg-saunako text-white rounded-full shadow-lg px-4 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
          aria-label="地図で見る"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>地図で見る</span>
        </button>
      )}

      {/* Mobile: Fullscreen map overlay */}
      {mobileMapOpen && (
        <MobileMapOverlay
          facilities={facilities}
          onClose={() => setMobileMapOpen(false)}
        />
      )}
    </div>
  );
}
