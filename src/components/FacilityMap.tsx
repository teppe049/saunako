'use client';

import { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, OverlayView, InfoWindow } from '@react-google-maps/api';
import Link from 'next/link';
import { Facility } from '@/lib/types';

interface FacilityMapProps {
  facilities: Facility[];
  selectedId?: number;
  onSelect?: (facility: Facility) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
};

export default function FacilityMap({ facilities, selectedId, onSelect }: FacilityMapProps) {
  const [activeMarker, setActiveMarker] = useState<number | null>(selectedId || null);
  const [isVisible, setIsVisible] = useState(true);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const validFacilities = facilities.filter((f) => f.lat && f.lng);
  const center = validFacilities.length > 0
    ? {
        lat: validFacilities.reduce((sum, f) => sum + (f.lat || 0), 0) / validFacilities.length,
        lng: validFacilities.reduce((sum, f) => sum + (f.lng || 0), 0) / validFacilities.length,
      }
    : { lat: 35.6762, lng: 139.6503 };

  const handleMarkerClick = useCallback((facility: Facility) => {
    setActiveMarker(facility.id);
    onSelect?.(facility);
  }, [onSelect]);

  const handleInfoWindowClose = useCallback(() => {
    setActiveMarker(null);
  }, []);

  if (loadError) {
    return (
      <div className="w-full h-full flex flex-col">
        <MapHeader isVisible={isVisible} onToggle={() => setIsVisible(!isVisible)} />
        <div className="flex-1 bg-gray-100 flex items-center justify-center">
          <p className="text-text-tertiary">地図の読み込みに失敗しました</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex flex-col">
        <MapHeader isVisible={isVisible} onToggle={() => setIsVisible(!isVisible)} />
        <div className="flex-1 bg-gray-100 flex items-center justify-center">
          <p className="text-text-tertiary">地図を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <MapHeader isVisible={isVisible} onToggle={() => setIsVisible(!isVisible)} />

      {isVisible && (
        <div className="flex-1">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={12}
            options={mapOptions}
          >
            {validFacilities.map((facility, index) => (
              <OverlayView
                key={facility.id}
                position={{ lat: facility.lat!, lng: facility.lng! }}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <button
                  onClick={() => handleMarkerClick(facility)}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    text-white text-base font-semibold
                    -translate-x-1/2 -translate-y-1/2
                    transition-transform hover:scale-110
                    ${activeMarker === facility.id
                      ? 'bg-[#E85A4F] scale-125 shadow-lg'
                      : 'bg-[#E85A4F] shadow-md'
                    }
                  `}
                >
                  {index + 1}
                </button>
              </OverlayView>
            ))}

            {activeMarker && (() => {
              const facility = validFacilities.find((f) => f.id === activeMarker);
              if (!facility) return null;
              return (
                <InfoWindow
                  position={{ lat: facility.lat!, lng: facility.lng! }}
                  onCloseClick={handleInfoWindowClose}
                  options={{ pixelOffset: new google.maps.Size(0, -24) }}
                >
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-bold text-sm mb-1">{facility.name}</h3>
                    <p className="text-xs text-gray-600 mb-2">
                      {facility.nearestStation}駅 徒歩{facility.walkMinutes}分
                    </p>
                    <p className="text-sm font-bold text-[#E85A4F] mb-2">
                      ¥{facility.priceMin.toLocaleString()}/{facility.duration}分
                    </p>
                    <Link
                      href={`/facilities/${facility.slug}`}
                      className="text-xs text-[#E85A4F] hover:underline"
                    >
                      詳細を見る →
                    </Link>
                  </div>
                </InfoWindow>
              );
            })()}
          </GoogleMap>
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
