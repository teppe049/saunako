'use client';

import { useState } from 'react';
import type { Plan } from '@/lib/types';
import { defaultSelection, durationOptions, matchPlans, peopleOptions } from '@/lib/planPicker';

interface PlanPickerProps {
  plans: Plan[];
}

function Choice({ label, selected, onClick, track }: { label: string; selected: boolean; onClick: () => void; track: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      data-track-click="plan_picker"
      data-track-field={track}
      className={`h-10 px-3 rounded-lg border text-sm font-bold transition-colors ${
        selected ? 'border-primary-strong bg-saunako-bg text-primary-strong' : 'border-border bg-surface text-text-primary hover:border-primary'
      }`}
    >
      {label}
    </button>
  );
}

/**
 * 「何人で・何分」を選ぶと、使えるプランと料金を出す（予約パネル用）。
 * プラン名の平日/土日・会員/ビジター等は構造化されていないので、条件に合うプランを全部並べる。
 */
export default function PlanPicker({ plans }: PlanPickerProps) {
  const initial = defaultSelection(plans);
  const [people, setPeople] = useState(initial?.people ?? 1);
  const [duration, setDuration] = useState(initial?.duration ?? 0);

  const peopleChoices = peopleOptions(plans);
  if (!initial || peopleChoices.length === 0) return null;

  const durations = durationOptions(plans, people);
  // 人数を変えて今の時間が選べなくなったら、その人数で一番短い時間に寄せる
  const activeDuration = durations.includes(duration) ? duration : durations[0];
  const matches = matchPlans(plans, people, activeDuration);

  return (
    <section aria-label="人数と時間から料金を見る" className="flex flex-col gap-3 rounded-xl border border-border p-3">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-bold text-text-secondary">人数</p>
        <div className="flex flex-wrap gap-1.5">
          {peopleChoices.map((n) => (
            <Choice key={n} label={`${n}名`} selected={n === people} onClick={() => setPeople(n)} track="people" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-bold text-text-secondary">時間</p>
        <div className="flex flex-wrap gap-1.5">
          {durations.map((d) => (
            <Choice key={d} label={`${d}分`} selected={d === activeDuration} onClick={() => setDuration(d)} track="duration" />
          ))}
        </div>
      </div>

      {matches.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-text-primary">¥{matches[0].price.toLocaleString()}</span>
            {matches.length > 1 && <span className="text-sm text-text-secondary">〜</span>}
            {people > 1 && (
              <span className="text-sm text-text-secondary">（1人あたり ¥{matches[0].perPerson.toLocaleString()}）</span>
            )}
          </p>
          <ul className="flex flex-col gap-0.5 text-xs text-text-secondary">
            {matches.map((p) => (
              <li key={`${p.name}-${p.price}`} className="flex justify-between gap-2">
                <span className="truncate">{p.name}</span>
                <span className="flex-shrink-0 tabular-nums">¥{p.price.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
