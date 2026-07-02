const COMPARE_KEY = 'saunako_compare';

// 比較テーブルの視認性を保てる上限（横並びで比較できる列数）
export const MAX_COMPARE = 4;

export interface CompareItem {
  id: number;
  name: string;
  image: string | null;
}

const EMPTY: CompareItem[] = [];

const listeners: Set<() => void> = new Set();
let cached: { raw: string | null; items: CompareItem[] } = { raw: null, items: EMPTY };

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

export function getSnapshot(): CompareItem[] {
  try {
    const raw = localStorage.getItem(COMPARE_KEY);
    if (raw !== cached.raw) {
      cached = { raw, items: raw ? JSON.parse(raw) : EMPTY };
    }
    return cached.items;
  } catch {
    return EMPTY;
  }
}

export function getServerSnapshot(): CompareItem[] {
  return EMPTY;
}

function save(items: CompareItem[]): void {
  localStorage.setItem(COMPARE_KEY, JSON.stringify(items));
  cached = { raw: null, items: EMPTY }; // invalidate cache
  emitChange();
}

/** 追加/削除をトグル。上限超過で追加できなかった場合は false を返す */
export function toggleCompare(item: CompareItem): boolean {
  const current = getSnapshot();
  if (current.some((i) => i.id === item.id)) {
    save(current.filter((i) => i.id !== item.id));
    return true;
  }
  if (current.length >= MAX_COMPARE) return false;
  save([...current, item]);
  return true;
}

export function removeCompare(facilityId: number): void {
  save(getSnapshot().filter((i) => i.id !== facilityId));
}

export function clearCompare(): void {
  save([]);
}

export function isCompared(facilityId: number): boolean {
  return getSnapshot().some((i) => i.id === facilityId);
}
