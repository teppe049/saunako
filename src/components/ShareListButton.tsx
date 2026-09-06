'use client';

import { useState } from 'react';
import { buildPickPath, MAX_PICK } from '@/lib/pick';

interface ShareListButtonProps {
  ids: number[];
}

// 共有URLは本番ドメインで固定する（ローカル・プレビューのURLを相手に送っても開けないため）
const SITE_URL = 'https://www.saunako.jp';

const meta = { title: 'お気に入りの個室サウナ', label: 'リストを共有', track: 'share_favorites_list' };

/** お気に入りリストの共有。候補数なら受け取り体験の良い /pick に、それ以上は一覧のまま /favorites に */
export default function ShareListButton({ ids }: ShareListButtonProps) {
  const [copied, setCopied] = useState(false);

  if (ids.length === 0) return null;

  const shareUrl = ids.length <= MAX_PICK
    ? `${SITE_URL}${buildPickPath(ids)}`
    : `${SITE_URL}/favorites?ids=${ids.join(',')}`;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: meta.title, url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // user cancelled or clipboard unavailable
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 text-text-secondary hover:text-text-primary text-sm rounded-lg px-3 py-2"
      style={{ background: '#F0F0F0' }}
      data-track-click={meta.track}
      aria-label={`${meta.title}を共有`}
    >
      {copied ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>コピーしました</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span>{meta.label}</span>
        </>
      )}
    </button>
  );
}
