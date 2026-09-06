import { MAX_PICK } from '@/lib/pick';

export { MAX_PICK };

// 旧 saunako_compare（比較機能・28日間PV0）からの移行はしない
const PICK_KEY = 'saunako_pick';

export interface PickItem {
  id: number;
  name: string;
  image: string | null;
}

const EMPTY: PickItem[] = [];

const listeners: Set<() => void> = new Set();
let cached: { raw: string | null; items: PickItem[] } = { raw: null, items: EMPTY };

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

export function getSnapshot(): PickItem[] {
  try {
    const raw = localStorage.getItem(PICK_KEY);
    if (raw !== cached.raw) {
      cached = { raw, items: raw ? JSON.parse(raw) : EMPTY };
    }
    return cached.items;
  } catch {
    return EMPTY;
  }
}

export function getServerSnapshot(): PickItem[] {
  return EMPTY;
}

function save(items: PickItem[]): void {
  localStorage.setItem(PICK_KEY, JSON.stringify(items));
  cached = { raw: null, items: EMPTY }; // invalidate cache
  emitChange();
}

/** 追加/削除をトグル。上限超過で追加できなかった場合は false を返す */
export function togglePick(item: PickItem): boolean {
  const current = getSnapshot();
  if (current.some((i) => i.id === item.id)) {
    save(current.filter((i) => i.id !== item.id));
    return true;
  }
  if (current.length >= MAX_PICK) return false;
  save([...current, item]);
  return true;
}

export function removePick(facilityId: number): void {
  save(getSnapshot().filter((i) => i.id !== facilityId));
}

export function clearPick(): void {
  save([]);
}

export function isPicked(facilityId: number): boolean {
  return getSnapshot().some((i) => i.id === facilityId);
}
