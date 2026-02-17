'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

interface AdUnitProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal';
  className?: string;
}

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

/**
 * AdSense 広告ユニットコンポーネント
 *
 * 環境変数 NEXT_PUBLIC_ADSENSE_CLIENT_ID が未設定またはプレースホルダーの場合は
 * 何もレンダリングしない。
 */
export default function AdUnit({ slot, format = 'auto', className }: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  const isEnabled =
    ADSENSE_CLIENT_ID &&
    !ADSENSE_CLIENT_ID.includes('XXXXXXXXXXXXXXXX');

  useEffect(() => {
    if (!isEnabled) return;
    if (pushed.current) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense がブロックされている場合など
    }
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <div className={className}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
