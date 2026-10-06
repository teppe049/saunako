/**
 * 「どこから」（起点の駅・現在地）を localStorage に保持するストア。
 * 一覧ページをまたいで同じ起点で距離順にするため。favoritesStore と同じ useSyncExternalStore 向けの形。
 */

export interface Origin {
  label: string;
  lat: number;
  lng: number;
}

const ORIGIN_KEY = 'saunako_origin';

const listeners: Set<() => void> = new Set();
let cached: { raw: string | null; origin: Origin | null } = { raw: null, origin: null };

function emitChange() {
  for (const listener of listeners) listener();
}

function isOrigin(v: unknown): v is Origin {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.label === 'string' && Number.isFinite(o.lat) && Number.isFinite(o.lng);
}

export function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  window.addEventListener('storage', callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', callback);
  };
}

export function getSnapshot(): Origin | null {
  try {
    const raw = localStorage.getItem(ORIGIN_KEY);
    if (raw !== cached.raw) {
      const parsed: unknown = raw ? JSON.parse(raw) : null;
      cached = { raw, origin: isOrigin(parsed) ? parsed : null };
    }
    return cached.origin;
  } catch {
    return null;
  }
}

export function getServerSnapshot(): Origin | null {
  return null;
}

export function setOrigin(origin: Origin | null): void {
  try {
    if (origin) {
      localStorage.setItem(ORIGIN_KEY, JSON.stringify(origin));
    } else {
      localStorage.removeItem(ORIGIN_KEY);
    }
  } catch {
    // プライベートモード等で保存できなくても、その場の操作は続ける
  }
  cached = { raw: null, origin: null };
  emitChange();
}
