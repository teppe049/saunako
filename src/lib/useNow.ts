'use client';

import { useSyncExternalStore } from 'react';

/** 「次の枠まで◯分」の表示を古くしないための更新間隔 */
const TICK_MS = 60 * 1000;

const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;
let current = floorToMinute(Date.now());

function floorToMinute(ms: number): number {
  return ms - (ms % TICK_MS);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (!timer) {
    current = floorToMinute(Date.now());
    timer = setInterval(() => {
      current = floorToMinute(Date.now());
      listeners.forEach((l) => l());
    }, TICK_MS);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

const getSnapshot = () => current;
const getServerSnapshot = () => null;

/**
 * 現在時刻（分単位で更新）。SSR とハイドレーション中は null。
 * 時刻依存の表示をサーバー描画に混ぜると hydration error #418 になるため、null の間は何も出さない。
 */
export function useNow(): Date | null {
  const ms = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return ms === null ? null : new Date(ms);
}
