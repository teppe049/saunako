/**
 * 2点間の距離を計算するユーティリティ（Haversine公式）
 */

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** 2つの緯度経度間の距離をkmで返す */
export function getDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** 距離を表示用にフォーマット（例: "0.8km", "12.3km"） */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 100) / 100}km`;
  if (km < 10) return `${Math.round(km * 10) / 10}km`;
  return `${Math.round(km)}km`;
}
