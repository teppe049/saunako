'use client';

import { useState, useRef, useCallback } from 'react';
import FacilityListCard from './FacilityListCard';
import FacilityMapWrapper from './FacilityMapWrapper';
import { Facility } from '@/lib/types';

interface Props {
  facilities: Facility[];
}

export default function SearchInteractivePanel({ facilities }: Props) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

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
        <div className="px-4 md:px-0 py-2 md:py-0 flex flex-col gap-3 md:gap-0">
          {facilities.map((facility, index) => (
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

        {facilities.length === 0 && (
          <div className="p-8 md:p-12 text-center">
            <div className="text-4xl md:text-5xl mb-4">🧖</div>
            <p className="text-text-secondary mb-2">
              この条件に合う施設が見つかりませんでした
            </p>
            <p className="text-sm text-text-tertiary">
              条件を変更して再検索してみてください
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
        />
      </div>
    </div>
  );
}
