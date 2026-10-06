'use client';

import { describeOpenStatus, getOpenStatus, type OpenHoursInput } from '@/lib/openHours';
import { useNow } from '@/lib/useNow';

const TONE_CLASS = {
  slot: 'text-primary-strong',
  open: 'text-open-now',
  muted: 'text-text-tertiary',
} as const;

const DOT_CLASS = {
  slot: 'bg-primary-strong',
  open: 'bg-open-now',
  muted: 'bg-unavailable',
} as const;

interface OpenStatusProps {
  facility: OpenHoursInput & { closedAt?: string | null };
  className?: string;
}

/** 「営業中・23:00まで」「次の枠 18:30〜（30分後）」などの今の状態。判定できない施設とSSR中は何も出さない */
export default function OpenStatus({ facility, className = '' }: OpenStatusProps) {
  const now = useNow();
  // 閉店済み（closedAt が過去）の施設には出さない
  if (!now || (facility.closedAt && new Date(facility.closedAt) <= now)) return null;
  const label = describeOpenStatus(getOpenStatus(facility, now));
  if (!label) return null;
  return (
    <p className={`flex items-center gap-1.5 text-xs font-bold ${TONE_CLASS[label.tone]} ${className}`}>
      <span aria-hidden="true" className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${DOT_CLASS[label.tone]}`} />
      {label.text}
    </p>
  );
}
