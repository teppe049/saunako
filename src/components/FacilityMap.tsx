'use client';

import { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
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
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
};

export default function FacilityMap({ facilities, selectedId, onSelect }: FacilityMapProps) {
  const [activeMarker, setActiveMarker] = useState<number | null>(selectedId || null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  // 中心座標を計算
  const validFacilities = facilities.filter((f) => f.lat && f.lng);
  const center = validFacilities.length > 0
    ? {
        lat: validFacilities.reduce((sum, f) => sum + (f.lat || 0), 0) / validFacilities.length,
        lng: validFacilities.reduce((sum, f) => sum + (f.lng || 0), 0) / validFacilities.length,
      }
    : { lat: 35.6762, lng: 139.6503 }; // 東京駅

  const handleMarkerClick = useCallback((facility: Facility) => {
    setActiveMarker(facility.id);
    onSelect?.(facility);
  }, [onSelect]);

  const handleInfoWindowClose = useCallback(() => {
    setActiveMarker(null);
  }, []);

  if (loadError) {
    return (
      <div className="w-full h-full bg-gray-200 rounded-xl flex items-center justify-center">
        <p className="text-text-tertiary">地図の読み込みに失敗しました</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full bg-gray-200 rounded-xl flex items-center justify-center">
        <p className="text-text-tertiary">地図を読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-xl overflow-hidden">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
        options={mapOptions}
      >
        {validFacilities.map((facility) => (
          <Marker
            key={facility.id}
            position={{ lat: facility.lat!, lng: facility.lng! }}
            onClick={() => handleMarkerClick(facility)}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: activeMarker === facility.id ? '#E85A4F' : '#FFFFFF',
              fillOpacity: 1,
              strokeColor: '#E85A4F',
              strokeWeight: 2,
            }}
          />
        ))}

        {activeMarker && (
          <InfoWindow
            position={{
              lat: validFacilities.find((f) => f.id === activeMarker)?.lat || 0,
              lng: validFacilities.find((f) => f.id === activeMarker)?.lng || 0,
            }}
            onCloseClick={handleInfoWindowClose}
          >
            <div className="p-2 min-w-[200px]">
              {(() => {
                const facility = validFacilities.find((f) => f.id === activeMarker);
                if (!facility) return null;
                return (
                  <>
                    <h3 className="font-bold text-sm mb-1">{facility.name}</h3>
                    <p className="text-xs text-gray-600 mb-2">
                      {facility.nearestStation} 徒歩{facility.walkMinutes}分
                    </p>
                    <p className="text-sm font-bold text-[#E85A4F] mb-2">
                      ¥{facility.priceMin.toLocaleString()}〜
                    </p>
                    <Link
                      href={`/facilities/${facility.slug}`}
                      className="text-xs text-[#E85A4F] hover:underline"
                    >
                      詳細を見る →
                    </Link>
                  </>
                );
              })()}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
