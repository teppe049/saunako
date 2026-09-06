'use client';

import { useState, useSyncExternalStore } from 'react';
import { subscribe, getSnapshot, getServerSnapshot, togglePick, MAX_PICK } from '@/lib/pickStore';

interface PickToggleButtonProps {
  facilityId: number;
  facilityName: string;
  image: string | null;
  /** compact: 固定CTAバー内のアイコン＋短いラベル / full: パネル内のフル幅ボタン */
  variant?: 'compact' | 'full';
}

/** 施設ページの「行きたい候補に入れる」トグル。状態は pickStore（localStorage） */
export default function PickToggleButton({ facilityId, facilityName, image, variant = 'full' }: PickToggleButtonProps) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const picked = items.some((i) => i.id === facilityId);
  const [full, setFull] = useState(false);

  const handleClick = () => {
    const ok = togglePick({ id: facilityId, name: facilityName, image });
    if (!ok) {
      setFull(true);
      setTimeout(() => setFull(false), 2000);
    }
  };

  const label = full ? `候補は${MAX_PICK}件まで` : picked ? '候補に入れた' : '候補に入れる';

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={picked}
        className={`flex-shrink-0 h-11 px-3 rounded-[10px] border text-xs font-bold flex flex-col items-center justify-center leading-tight transition-colors ${
          picked ? 'bg-primary border-primary text-white' : 'bg-white border-primary text-primary'
        }`}
        data-track-click="pick_toggle"
        data-track-facility={facilityId}
      >
        <span className="text-base leading-none">{picked ? '✓' : '＋'}</span>
        <span>{full ? `${MAX_PICK}件まで` : '候補'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={picked}
      className={`flex items-center justify-center gap-1.5 w-full h-12 rounded-[10px] border text-sm font-semibold transition-colors ${
        picked ? 'bg-primary border-primary text-white' : 'bg-white border-primary text-primary hover:bg-primary-light'
      }`}
      data-track-click="pick_toggle"
      data-track-facility={facilityId}
    >
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        {picked ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14M5 12h14" />
        )}
      </svg>
      {picked ? `${label}（友だちに送れる）` : `行きたい${label}`}
    </button>
  );
}
