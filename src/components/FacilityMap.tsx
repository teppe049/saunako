'use client';

import { useEffect, useRef } from 'react';
import { Facility } from '@/lib/types';

interface FacilityMapProps {
  facilities: Facility[];
  selectedId?: number;
  onSelect?: (facility: Facility) => void;
}

export default function FacilityMap({ facilities, selectedId, onSelect }: FacilityMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  // 中心座標を計算
  const center = facilities.length > 0
    ? {
        lat: facilities.reduce((sum, f) => sum + (f.lat || 0), 0) / facilities.length,
        lng: facilities.reduce((sum, f) => sum + (f.lng || 0), 0) / facilities.length,
      }
    : { lat: 35.6762, lng: 139.6503 }; // 東京駅

  return (
    <div ref={mapRef} className="w-full h-full bg-gray-200 rounded-xl relative overflow-hidden">
      {/* Map placeholder - Google Maps or Leaflet would go here */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-tertiary mb-2">エリアマップ</p>
          <p className="text-sm text-text-tertiary">
            {facilities.length}件の施設
          </p>
        </div>
      </div>

      {/* Facility markers (placeholder) */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
        {facilities.slice(0, 5).map((facility, index) => (
          <button
            key={facility.id}
            onClick={() => onSelect?.(facility)}
            className={`
              w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
              ${selectedId === facility.id ? 'bg-primary text-white' : 'bg-white text-primary border border-primary'}
            `}
          >
            {index + 1}
          </button>
        ))}
        {facilities.length > 5 && (
          <span className="text-xs text-text-tertiary self-center">+{facilities.length - 5}</span>
        )}
      </div>
    </div>
  );
}
