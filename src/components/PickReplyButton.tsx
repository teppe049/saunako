'use client';

import { useState } from 'react';

const SITE_URL = 'https://www.saunako.jp';

interface PickReplyButtonProps {
  index: number;
  facilityId: number;
  facilityName: string;
}

/**
 * 受け取った側が「これがいい！」を送り主に返すボタン。
 * BEを持たないので、定型文＋施設URLを端末の共有シートに渡すだけ（返信もサイト経由になる）。
 */
export default function PickReplyButton({ index, facilityId, facilityName }: PickReplyButtonProps) {
  const [copied, setCopied] = useState(false);
  const text = `${index}の ${facilityName} がいい！`;
  const url = `${SITE_URL}/facilities/${facilityId}`;

  const handleClick = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // user cancelled or clipboard unavailable
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex-1 h-11 rounded-lg border border-primary bg-white text-primary text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-primary-light transition-colors"
      data-track-click="pick_reply"
      data-track-facility={facilityId}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
      {copied ? 'コピーしました' : 'これがいい！と返す'}
    </button>
  );
}
