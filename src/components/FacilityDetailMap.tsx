'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

interface FacilityDetailMapProps {
  lat: number;
  lng: number;
  name: string;
}

const markerIcon = new L.DivIcon({
  className: '',
  html: `<div style="width:24px;height:24px;border-radius:50%;background:#E85A4F;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -14],
});

export default function FacilityDetailMap({ lat, lng, name }: FacilityDetailMapProps) {
  return (
    <div className="w-full h-full rounded-xl overflow-hidden">
      <MapContainer
        center={[lat, lng]}
        zoom={16}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.jp/styles/osm-bright-ja/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={markerIcon}>
          <Popup>{name}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
