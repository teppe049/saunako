'use client';

import { useState } from 'react';
import { getSlotsByDay, type OpenHoursInput } from '@/lib/openHours';
import { useNow } from '@/lib/useNow';

interface TodaySlotsProps {
  facility: OpenHoursInput;
}

/** これより枠が多いグループは、終わった枠を件数だけにして畳む（30分刻みの施設でパネルが長くなりすぎるため） */
const COLLAPSE_PAST_OVER = 12;

const CHIP_CLASS = {
  past: 'bg-bg text-text-tertiary line-through border-border',
  next: 'bg-primary-strong text-white border-primary-strong',
  upcoming: 'bg-surface text-text-primary border-border',
} as const;

/**
 * 時間枠のある施設の「今日・明日・明後日」の枠（予約パネル用）。
 * 時刻依存なのでハイドレーション後に描画する。左カラムの TimeSlotTable（SEO本文）はそのまま残す。
 */
export default function TodaySlots({ facility }: TodaySlotsProps) {
  const now = useNow();
  const [dayIndex, setDayIndex] = useState(0);
  if (!now) return null;

  const days = getSlotsByDay(facility, now);
  if (days.every((d) => d.groups.length === 0)) return null;
  const day = days[dayIndex];

  return (
    <section aria-label="時間枠" className="flex flex-col gap-3">
      <div role="tablist" className="grid grid-cols-3 border-b border-border">
        {days.map((d, i) => (
          <button
            key={d.label}
            type="button"
            role="tab"
            aria-selected={i === dayIndex}
            onClick={() => setDayIndex(i)}
            data-track-click="slot_day_tab"
            data-track-day={i}
            className={`h-11 text-sm border-b-2 transition-colors ${
              i === dayIndex ? 'border-primary-strong text-primary-strong font-bold' : 'border-transparent text-text-secondary'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {day.holiday ? (
        <p className="text-sm text-text-secondary py-2">この日は定休日だよ</p>
      ) : day.groups.length === 0 ? (
        <p className="text-sm text-text-secondary py-2">この日の枠は予約ページで確認してね</p>
      ) : (
        day.groups.map((g) => (
          <div key={g.label} className="flex flex-col gap-2">
            <p className="text-xs font-bold text-text-secondary">
              {g.label}
              {g.note && <span className="ml-1 font-normal text-text-tertiary">（{g.note}）</span>}
            </p>
            {g.times.length > COLLAPSE_PAST_OVER && g.times.some((t) => t.state === 'past') && (
              <p className="text-xs text-text-tertiary">終わった枠 {g.times.filter((t) => t.state === 'past').length}件は省略</p>
            )}
            <ul className="grid grid-cols-4 gap-1.5">
              {(g.times.length > COLLAPSE_PAST_OVER ? g.times.filter((t) => t.state !== 'past') : g.times).map((t) => (
                <li
                  key={t.time}
                  className={`h-10 flex items-center justify-center rounded-lg border text-sm font-bold tabular-nums ${CHIP_CLASS[t.state]}`}
                >
                  {t.state === 'past' && <span className="sr-only">終了 </span>}
                  {t.state === 'next' && <span className="sr-only">次の枠 </span>}
                  {t.time}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
      <p className="text-xs text-text-tertiary">枠は掲載時点の情報。空きは予約ページで確認してね</p>
    </section>
  );
}
