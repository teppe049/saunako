'use client';

import { useCallback, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import { Facility } from '@/lib/types';

interface FacilityMapProps {
  facilities: Facility[];
  selectedId?: number;
  onSelect?: (facility: Facility) => void;
}

function createNumberedIcon(index: number, isActive: boolean) {
  return new L.DivIcon({
    className: '',
    html: `<div style="
      width:40px;height:40px;border-radius:50%;
      background:#E85A4F;
      color:#fff;font-size:16px;font-weight:600;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
      transform:${isActive ? 'scale(1.25)' : 'scale(1)'};
      transition:transform 0.15s;
    ">${index}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
  });
}

export default function FacilityMap({ facilities, selectedId, onSelect }: FacilityMapProps) {
  const [activeMarker, setActiveMarker] = useState<number | null>(selectedId || null);
  const [isVisible, setIsVisible] = useState(true);

  const validFacilities = facilities.filter((f) => f.lat && f.lng);
  const center: [number, number] = validFacilities.length > 0
    ? [
        validFacilities.reduce((sum, f) => sum + (f.lat || 0), 0) / validFacilities.length,
        validFacilities.reduce((sum, f) => sum + (f.lng || 0), 0) / validFacilities.length,
      ]
    : [35.6762, 139.6503];

  const handleMarkerClick = useCallback((facility: Facility) => {
    setActiveMarker(facility.id);
    onSelect?.(facility);
  }, [onSelect]);

  return (
    <div className="w-full h-full flex flex-col">
      <MapHeader isVisible={isVisible} onToggle={() => setIsVisible(!isVisible)} />

      {isVisible && (
        <div className="flex-1">
          <MapContainer
            center={center}
            zoom={12}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {validFacilities.map((facility, index) => (
              <Marker
                key={facility.id}
                position={[facility.lat!, facility.lng!]}
                icon={createNumberedIcon(index + 1, activeMarker === facility.id)}
                eventHandlers={{
                  click: () => handleMarkerClick(facility),
                }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-bold text-sm mb-1">{facility.name}</h3>
                    {facility.nearestStation && facility.walkMinutes > 0 && (
                      <p className="text-xs text-gray-600 mb-2">
                        {facility.nearestStation}{facility.nearestStation.endsWith('駅') ? '' : '駅'} 徒歩{facility.walkMinutes}分
                      </p>
                    )}
                    <p className="text-sm font-bold text-[#E85A4F] mb-2">
                      {facility.priceMin > 0 ? `¥${facility.priceMin.toLocaleString()}/${facility.duration}分` : '要問合せ'}
                    </p>
                    <Link
                      href={`/facilities/${facility.slug}`}
                      className="text-xs text-[#E85A4F] hover:underline"
                    >
                      詳細を見る →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
}

function MapHeader({ isVisible, onToggle }: { isVisible: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-border">
      <span className="text-base font-semibold text-text-primary">エリアマップ</span>
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-3 py-1.5 bg-[#F0F0F0] rounded-full text-sm text-text-tertiary hover:bg-gray-200 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <span>{isVisible ? '地図を隠す' : '地図を表示'}</span>
      </button>
    </div>
  );
}
