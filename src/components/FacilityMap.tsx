'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import Image from 'next/image';
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
  showSearchAreaButton?: boolean;
  onSearchArea?: () => void;
}

type MarkerState = 'default' | 'hovered' | 'selected' | 'visited';

const RECENT_STORAGE_KEY = 'saunako_recent';

function getVisitedIds(): Set<number> {
  try {
    const stored = localStorage.getItem(RECENT_STORAGE_KEY);
    return new Set(stored ? JSON.parse(stored) : []);
  } catch {
    return new Set();
  }
}

const iconCache = new Map<string, L.DivIcon>();
function getCachedPriceIcon(price: number, state: MarkerState): L.DivIcon {
  const key = `${price}-${state}`;
  if (!iconCache.has(key)) {
    iconCache.set(key, createPriceIcon(price, state));
  }
  return iconCache.get(key)!;
}

function createPriceIcon(price: number, state: MarkerState) {
  const label = price > 0 ? `¥${price.toLocaleString()}` : '--';
  const styles = {
    default: { bg: '#fff', color: '#222', border: '1px solid #ddd', shadow: '0 2px 6px rgba(0,0,0,0.08)', scale: 'scale(1)', opacity: '1' },
    visited: { bg: '#f3f4f6', color: '#9ca3af', border: '1px solid #e5e7eb', shadow: '0 1px 3px rgba(0,0,0,0.06)', scale: 'scale(1)', opacity: '0.75' },
    hovered: { bg: '#222', color: '#fff', border: '1px solid #222', shadow: '0 4px 12px rgba(0,0,0,0.25)', scale: 'scale(1.15)', opacity: '1' },
    selected: { bg: '#E85A4F', color: '#fff', border: '1px solid #E85A4F', shadow: '0 4px 12px rgba(0,0,0,0.3)', scale: 'scale(1.15)', opacity: '1' },
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
      opacity:${s.opacity};
      transition:all 0.15s ease;
      cursor:pointer;
    ">${label}</div>`,
    iconSize: [80, 28],
    iconAnchor: [40, 14],
    popupAnchor: [0, -16],
  });
}

// Find the cluster with the most facilities (within ~1 degree ≈ 100km radius)
function findDensestCluster(facilities: Facility[]): Facility[] {
  if (facilities.length <= 3) return facilities;

  let bestCenter: Facility | null = null;
  let bestCount = 0;
  const RADIUS = 1.0; // ~1 degree latitude/longitude ≈ 100km

  for (const f of facilities) {
    const nearby = facilities.filter(
      (other) => Math.abs(f.lat! - other.lat!) < RADIUS && Math.abs(f.lng! - other.lng!) < RADIUS
    );
    if (nearby.length > bestCount) {
      bestCount = nearby.length;
      bestCenter = f;
    }
  }

  if (!bestCenter) return facilities;
  return facilities.filter(
    (f) => Math.abs(f.lat! - bestCenter!.lat!) < RADIUS && Math.abs(f.lng! - bestCenter!.lng!) < RADIUS
  );
}

function MapPanHandler({ selectedId, facilities }: { selectedId?: number; facilities: Facility[] }) {
  const map = useMap();
  const prevFacilityIdsRef = useRef<string>('');

  // fitBounds when facilities change (e.g. prefecture filter)
  useEffect(() => {
    if (facilities.length === 0) return;

    const currentIds = facilities.map((f) => f.id).sort((a, b) => a - b).join(',');
    if (currentIds === prevFacilityIdsRef.current) return;
    prevFacilityIdsRef.current = currentIds;

    // Find the densest cluster to avoid centering between distant groups (e.g. Tokyo + Osaka)
    const targetFacilities = findDensestCluster(facilities);
    const bounds = L.latLngBounds(targetFacilities.map((f) => [f.lat!, f.lng!]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [facilities, map]);

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

function MapBoundsHandler({ onBoundsChange, onMapMoved }: { onBoundsChange?: (bounds: MapBounds) => void; onMapMoved?: () => void }) {
  const map = useMap();
  const isInitialLoad = useRef(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

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

  const debouncedEmitBounds = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(emitBounds, 150);
  }, [emitBounds]);

  useMapEvents({
    moveend: () => {
      debouncedEmitBounds();
      if (!isInitialLoad.current) {
        onMapMoved?.();
      }
      isInitialLoad.current = false;
    },
    zoomend: () => {
      debouncedEmitBounds();
      if (!isInitialLoad.current) {
        onMapMoved?.();
      }
    },
  });

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

function LocateButton() {
  const map = useMap();
  const [locating, setLocating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    // Prevent map click/drag events from propagating through the button
    L.DomEvent.disableClickPropagation(containerRef.current);
    L.DomEvent.disableScrollPropagation(containerRef.current);
  }, []);

  const handleLocate = useCallback(() => {
    setLocating(true);
    map.locate({ setView: true, maxZoom: 14 });
    map.once('locationfound', () => setLocating(false));
    map.once('locationerror', () => setLocating(false));
  }, [map]);

  return (
    <div ref={containerRef} className="leaflet-bottom leaflet-right" style={{ pointerEvents: 'auto' }}>
      <div className="leaflet-control" style={{ marginBottom: '16px', marginRight: '10px' }}>
        <button
          onClick={handleLocate}
          className="w-10 h-10 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          aria-label="現在地を表示"
          title="現在地を表示"
        >
          {locating ? (
            <svg className="w-5 h-5 text-[#E85A4F] animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" strokeWidth={2} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4m10-10h-4M6 12H2" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default function FacilityMap({
  facilities,
  hoveredId,
  selectedId,
  onSelect,
  onBoundsChange,
  showSearchAreaButton,
  onSearchArea,
}: FacilityMapProps) {
  const [activeMarker, setActiveMarker] = useState<number | null>(selectedId || null);
  const [visitedIds] = useState<Set<number>>(() => getVisitedIds());
  const [mapMoved, setMapMoved] = useState(false);

  const validFacilities = facilities.filter((f) => f.lat && f.lng);
  const center: [number, number] = validFacilities.length > 0
    ? [
        validFacilities.reduce((sum, f) => sum + (f.lat || 0), 0) / validFacilities.length,
        validFacilities.reduce((sum, f) => sum + (f.lng || 0), 0) / validFacilities.length,
      ]
    : [35.6762, 139.6503];

  const activeFacility = validFacilities.find((f) => f.id === activeMarker) || null;

  const handleMarkerClick = useCallback((facility: Facility) => {
    setActiveMarker(facility.id);
    onSelect?.(facility);
  }, [onSelect]);

  const handleMapClick = useCallback(() => {
    setActiveMarker(null);
  }, []);

  const handleMapMoved = useCallback(() => {
    if (showSearchAreaButton) {
      setMapMoved(true);
    }
  }, [showSearchAreaButton]);

  const handleSearchArea = useCallback(() => {
    setMapMoved(false);
    onSearchArea?.();
  }, [onSearchArea]);

  function getMarkerState(facilityId: number): MarkerState {
    if (selectedId === facilityId || activeMarker === facilityId) return 'selected';
    if (hoveredId === facilityId) return 'hovered';
    if (visitedIds.has(facilityId)) return 'visited';
    return 'default';
  }

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={12}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.jp/styles/osm-bright-ja/{z}/{x}/{y}.png"
        />
        <MapPanHandler selectedId={selectedId} facilities={validFacilities} />
        <MapBoundsHandler onBoundsChange={onBoundsChange} onMapMoved={handleMapMoved} />
        <MapClickHandler onMapClick={handleMapClick} />
        <LocateButton />
        {validFacilities.map((facility) => {
          const state = getMarkerState(facility.id);
          return (
            <Marker
              key={facility.id}
              position={[facility.lat!, facility.lng!]}
              icon={getCachedPriceIcon(facility.priceMin, state)}
              zIndexOffset={state === 'selected' ? 1000 : state === 'hovered' ? 500 : state === 'visited' ? -100 : 0}
              eventHandlers={{
                click: () => handleMarkerClick(facility),
              }}
            />
          );
        })}
      </MapContainer>

      {/* Facility info card overlay */}
      {activeFacility && (
        <div className="absolute bottom-16 left-3 z-[1000]">
          <OverlayCard facility={activeFacility} onClose={() => setActiveMarker(null)} />
        </div>
      )}

      {/* Search this area button */}
      {showSearchAreaButton && mapMoved && (
        <button
          onClick={handleSearchArea}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-1.5 bg-text-primary text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg hover:bg-black transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          このエリアで検索
        </button>
      )}
    </div>
  );
}

function OverlayCard({ facility, onClose }: { facility: Facility; onClose: () => void }) {
  const hasImage = facility.images.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-[fadeSlideUp_0.15s_ease-out] w-[280px]">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 z-10 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-100 transition-colors"
        aria-label="閉じる"
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <Link href={`/facilities/${facility.id}`}>
        {/* Image */}
        {hasImage && (
          <div className="relative w-full h-[140px]">
            <Image
              src={facility.images[0]}
              alt={facility.name}
              fill
              sizes="280px"
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-3">
          <h3 className="font-bold text-sm text-text-primary mb-1 line-clamp-1">{facility.name}</h3>

          {facility.nearestStation && facility.walkMinutes > 0 && (
            <p className="text-xs text-text-tertiary mb-1.5">
              {facility.nearestStation}{facility.nearestStation.includes('駅') ? '' : '駅'} 徒歩{facility.walkMinutes}分
            </p>
          )}

          <p className="text-base font-bold text-saunako mb-2">
            {facility.priceMin > 0 ? `¥${facility.priceMin.toLocaleString()}〜` : '要問合せ'}
            {facility.priceMin > 0 && (
              <span className="text-xs font-normal text-text-tertiary ml-1">/ {facility.duration}分</span>
            )}
          </p>

          {/* Feature tags */}
          <div className="flex flex-wrap gap-1">
            {facility.features.waterBath && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 bg-primary-light text-primary rounded">水風呂</span>
            )}
            {facility.features.selfLoyly && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 bg-primary-light text-primary rounded">ロウリュ</span>
            )}
            {facility.features.outdoorAir && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 bg-primary-light text-primary rounded">外気浴</span>
            )}
            {facility.features.coupleOk && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 bg-[#E8F5E9] text-[#4CAF50] rounded">男女OK</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

