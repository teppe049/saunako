'use client';

import { useEffect, useState } from 'react';
import type { FacilityAvailability } from '@/lib/coubic';

interface Props {
  facilityId: number;
  className?: string;
}

/**
 * 本日・明日の空き枠バッジ（STORES予約対応施設のみ）。
 * 取得できない場合は何も描画しない。
 */
export default function AvailabilityBadge({ facilityId, className = '' }: Props) {
  const [data, setData] = useState<FacilityAvailability | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/availability/${facilityId}`)
      .then((res) => (res.ok && res.status !== 204 ? res.json() : null))
      .then((json: FacilityAvailability | null) => {
        if (!cancelled && json) setData(json);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [facilityId]);

  if (!data) return null;

  const { today, tomorrow } = data;
  const todayOpen = today.slotCount > 0;
  const tomorrowOpen = tomorrow.slotCount > 0;

  return (
    <div className={`rounded-lg border px-3 py-2 text-sm ${todayOpen ? 'border-available/40 bg-green-50' : 'border-border bg-bg'} ${className}`}>
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={`inline-block h-2 w-2 rounded-full ${todayOpen ? 'bg-available' : 'bg-unavailable'}`}
        />
        <span className="font-medium text-text-primary">
          {todayOpen ? `本日 空きあり（最短 ${today.earliest}〜）` : '本日は満枠'}
        </span>
      </div>
      <p className="mt-1 pl-4 text-xs text-text-secondary">
        {tomorrowOpen ? `明日 空きあり（最短 ${tomorrow.earliest}〜）` : '明日は満枠'}
        <span className="ml-1 text-text-tertiary">・STORES予約の枠を10分ごとに更新</span>
      </p>
    </div>
  );
}
