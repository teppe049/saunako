'use client';

import { useState } from 'react';

interface ShareListButtonProps {
  ids: number[];
}

export default function ShareListButton({ ids }: ShareListButtonProps) {
  const [copied, setCopied] = useState(false);

  if (ids.length === 0) return null;

  const shareUrl = `https://www.saunako.jp/favorites?ids=${ids.join(',')}`;

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'お気に入りの個室サウナ', url: shareUrl });
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
      data-track-click="share_favorites_list"
      aria-label="お気に入りリストを共有"
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
          <span>リストを共有</span>
        </>
      )}
    </button>
  );
}
