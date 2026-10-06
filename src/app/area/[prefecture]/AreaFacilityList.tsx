'use client';

import { useRef, useState, useSyncExternalStore } from 'react';
import FacilityCard from '@/components/FacilityCard';
import FacilityMapWrapper from '@/components/FacilityMapWrapper';
import type { Facility } from '@/lib/types';
import type { Origin } from '@/lib/originStore';

interface AreaFacilityListProps {
  facilities: Facility[];
  origin: Origin | null;
  distanceLabelOf: (facility: Facility) => string | undefined;
}

const WIDE_QUERY = '(min-width: 1024px)';

/**
 * エリアページの施設一覧。PC（lg以上）では右に地図を並べ、カードにマウスを乗せるとピンを強調、
 * ピンを押すとカードまでスクロールする。モバイルでは地図（Leaflet）を読み込まない。
 */
export default function AreaFacilityList({ facilities, origin, distanceLabelOf }: AreaFacilityListProps) {
  const isWide = useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia(WIDE_QUERY);
      mql.addEventListener('change', callback);
      return () => mql.removeEventListener('change', callback);
    },
    () => window.matchMedia(WIDE_QUERY).matches,
    () => false,
  );
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const handleMapSelect = (facility: Facility) => {
    setSelectedId(facility.id);
    cardRefs.current.get(facility.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="lg:flex lg:items-start lg:gap-6">
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 lg:flex-1 lg:min-w-0 ${isWide ? 'lg:grid-cols-2' : 'lg:grid-cols-3'}`}>
        {facilities.map((facility, index) => (
          <div
            key={facility.id}
            ref={(el) => {
              if (el) cardRefs.current.set(facility.id, el);
              else cardRefs.current.delete(facility.id);
            }}
            onMouseEnter={() => setHoveredId(facility.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={`rounded-xl ${selectedId === facility.id ? 'ring-2 ring-saunako' : ''}`}
          >
            <FacilityCard facility={facility} index={index} distanceLabel={distanceLabelOf(facility)} />
          </div>
        ))}
      </div>
      {isWide && facilities.length > 0 && (
        <div className="lg:w-2/5 lg:flex-shrink-0 lg:sticky lg:top-4 h-[calc(100vh-2rem)] rounded-xl overflow-hidden border border-border bg-surface">
          <FacilityMapWrapper
            facilities={facilities}
            hoveredId={hoveredId}
            selectedId={selectedId}
            onSelect={handleMapSelect}
            origin={origin ?? undefined}
          />
        </div>
      )}
    </div>
  );
}
