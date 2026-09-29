'use client';

import { useState } from 'react';

const SITE_URL = 'https://www.saunako.jp';
// 未入力時に見せるサンプルID。数字を入れるとコードが差し替わることが伝わるように
const PLACEHOLDER_ID = '123';

type Variant = 'light' | 'dark';

const VARIANTS: { key: Variant; label: string }[] = [
  { key: 'light', label: 'ライト' },
  { key: 'dark', label: 'ダーク' },
];

function buildCode(facilityId: string, variant: Variant) {
  const id = facilityId || PLACEHOLDER_ID;
  return `<a href="${SITE_URL}/facilities/${id}?utm_source=badge&utm_medium=referral"><img src="${SITE_URL}/badge/saunako-badge-${variant}.svg" alt="サウナ子に掲載中" width="160" height="48"></a>`;
}

/**
 * 施設IDを入力すると貼り付け用HTMLが差し替わり、コピーできる。
 * 計測は data-track-* 属性 + AnalyticsTracker に任せる。
 */
export default function OwnerBadgeEmbed() {
  const [facilityId, setFacilityId] = useState('');
  const [copied, setCopied] = useState<Variant | null>(null);

  const handleChange = (value: string) => {
    // 施設IDは数値のみ。全角数字は半角に直す
    const normalized = value.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
    setFacilityId(normalized.replace(/\D/g, '').slice(0, 5));
    setCopied(null);
  };

  const handleCopy = async (variant: Variant) => {
    try {
      await navigator.clipboard.writeText(buildCode(facilityId, variant));
      setCopied(variant);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // clipboard unavailable: コードは選択してコピーできる
    }
  };

  return (
    <div className="space-y-5">
      <label className="block">
        <span className="block text-sm font-medium text-text-primary mb-1.5">施設ID（数字）</span>
        <input
          type="text"
          inputMode="numeric"
          value={facilityId}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={`例: ${PLACEHOLDER_ID}`}
          className="w-full sm:w-40 h-11 px-3 rounded-lg border border-border bg-surface text-text-primary"
        />
      </label>

      {VARIANTS.map(({ key, label }) => (
        <div key={key} className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/badge/saunako-badge-${key}.svg`}
              alt={`サウナ子に掲載中バッジ（${label}）`}
              width={160}
              height={48}
            />
            <button
              type="button"
              onClick={() => handleCopy(key)}
              className="h-10 px-4 rounded-lg bg-saunako text-white text-sm font-bold hover:opacity-90 transition-opacity"
              data-track-click="owner_badge_copy"
              data-track-variant={key}
              data-track-facility={facilityId || 'none'}
            >
              {copied === key ? 'コピーしたよ' : `${label}版をコピー`}
            </button>
          </div>
          <textarea
            readOnly
            rows={4}
            value={buildCode(facilityId, key)}
            onFocus={(e) => e.currentTarget.select()}
            aria-label={`${label}版の貼り付け用HTMLコード`}
            className="w-full p-3 rounded-lg border border-border bg-bg text-xs text-text-secondary font-mono"
          />
        </div>
      ))}
    </div>
  );
}
