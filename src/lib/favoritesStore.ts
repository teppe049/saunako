const FAVORITES_KEY = 'saunako_favorites';
const EMPTY: number[] = [];

const listeners: Set<() => void> = new Set();
let cached: { raw: string | null; ids: number[] } = { raw: null, ids: EMPTY };

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  window.addEventListener('storage', callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', callback);
  };
}

export function getSnapshot(): number[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (raw !== cached.raw) {
      cached = { raw, ids: raw ? JSON.parse(raw) : EMPTY };
    }
    return cached.ids;
  } catch {
    return EMPTY;
  }
}

export function getServerSnapshot(): number[] {
  return EMPTY;
}

export function toggleFavorite(facilityId: number): void {
  const current = getSnapshot();
  const next = current.includes(facilityId)
    ? current.filter((id) => id !== facilityId)
    : [facilityId, ...current];
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  cached = { raw: null, ids: EMPTY }; // invalidate cache
  emitChange();
}

export function isFavorite(facilityId: number): boolean {
  return getSnapshot().includes(facilityId);
}
