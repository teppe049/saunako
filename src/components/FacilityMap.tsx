'use client';

import { useCallback, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import { Facility } from '@/lib/types';

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface FacilityMapProps {
  facilities: Facility[];
  hoveredId?: number | null;
  selectedId?: number;
  onSelect?: (facility: Facility) => void;
  onBoundsChange?: (bounds: MapBounds) => void;
}

type MarkerState = 'default' | 'hovered' | 'selected';

function createPriceIcon(price: number, state: MarkerState) {
  const label = price > 0 ? `¥${price.toLocaleString()}` : '--';
  const styles = {
    default: { bg: '#fff', color: '#222', border: '1px solid #ddd', shadow: '0 2px 4px rgba(0,0,0,0.1)', scale: 'scale(1)' },
    hovered: { bg: '#222', color: '#fff', border: '1px solid #222', shadow: '0 4px 12px rgba(0,0,0,0.25)', scale: 'scale(1.15)' },
    selected: { bg: '#222', color: '#fff', border: '1px solid #222', shadow: '0 4px 12px rgba(0,0,0,0.25)', scale: 'scale(1.15)' },
  };
  const s = styles[state];

  return new L.DivIcon({
    className: '',
    html: `<div style="
      padding:4px 10px;border-radius:20px;
      background:${s.bg};color:${s.color};
      border:${s.border};
      font-size:12px;font-weight:700;white-space:nowrap;
      display:inline-flex;align-items:center;justify-content:center;
      box-shadow:${s.shadow};
      transform:${s.scale};
      transition:all 0.15s ease;
      cursor:pointer;
    ">${label}</div>`,
    iconSize: [80, 28],
    iconAnchor: [40, 14],
    popupAnchor: [0, -16],
  });
}

function MapPanHandler({ selectedId, facilities }: { selectedId?: number; facilities: Facility[] }) {
  const map = useMap();

  useEffect(() => {
    if (selectedId) {
      const facility = facilities.find((f) => f.id === selectedId);
      if (facility?.lat && facility?.lng) {
        map.panTo([facility.lat, facility.lng], { animate: true });
      }
    }
  }, [selectedId, facilities, map]);

  return null;
}

function MapBoundsHandler({ onBoundsChange }: { onBoundsChange?: (bounds: MapBounds) => void }) {
  const map = useMap();

  const emitBounds = useCallback(() => {
    if (!onBoundsChange) return;
    const b = map.getBounds();
    onBoundsChange({
      north: b.getNorth(),
      south: b.getSouth(),
      east: b.getEast(),
      west: b.getWest(),
    });
  }, [map, onBoundsChange]);

  useMapEvents({
    moveend: emitBounds,
    zoomend: emitBounds,
    click: () => {},
  });

  // Emit initial bounds when map loads
  useEffect(() => {
    emitBounds();
  }, [emitBounds]);

  return null;
}

function MapClickHandler({ onMapClick }: { onMapClick: () => void }) {
  useMapEvents({
    click: () => {
      onMapClick();
    },
  });
  return null;
}

export default function FacilityMap({ facilities, hoveredId, selectedId, onSelect, onBoundsChange }: FacilityMapProps) {
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

  const handleMapClick = useCallback(() => {
    setActiveMarker(null);
  }, []);

  function getMarkerState(facilityId: number): MarkerState {
    if (selectedId === facilityId || activeMarker === facilityId) return 'selected';
    if (hoveredId === facilityId) return 'hovered';
    return 'default';
  }

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
            <MapPanHandler selectedId={selectedId} facilities={validFacilities} />
            <MapBoundsHandler onBoundsChange={onBoundsChange} />
            <MapClickHandler onMapClick={handleMapClick} />
            {validFacilities.map((facility) => {
              const state = getMarkerState(facility.id);
              return (
                <Marker
                  key={facility.id}
                  position={[facility.lat!, facility.lng!]}
                  icon={createPriceIcon(facility.priceMin, state)}
                  zIndexOffset={state === 'selected' ? 1000 : state === 'hovered' ? 500 : 0}
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
                        href={`/facilities/${facility.id}`}
                        className="text-xs text-[#E85A4F] hover:underline"
                      >
                        詳細を見る →
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
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
