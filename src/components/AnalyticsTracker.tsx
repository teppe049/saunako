'use client';

import { useEffect } from 'react';
import { trackFacilityCardClick, trackExternalLinkClick, trackAskAiClick, sendGAEvent } from '@/lib/analytics';

export default function AnalyticsTracker() {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest('[data-track-click]') as HTMLElement | null;
      if (!target) return;

      const action = target.getAttribute('data-track-click');

      if (action === 'facility_card') {
        trackFacilityCardClick(
          Number(target.getAttribute('data-track-facility-id')),
          target.getAttribute('data-track-facility-name') || '',
          Number(target.getAttribute('data-track-index'))
        );
      }

      if (action === 'ask_ai') {
        const facilityIdAttr = target.getAttribute('data-track-facility-id');
        trackAskAiClick(
          target.getAttribute('data-track-service') || '',
          target.getAttribute('data-track-page-type') || '',
          facilityIdAttr ? Number(facilityIdAttr) : undefined
        );
      }

      // 上記以外の data-track-click は汎用イベントとして送る（purpose_link / recent_chip / sns_follow / filter_chip 等）
      if (action && action !== 'facility_card' && action !== 'ask_ai') {
        const params: Record<string, string> = { action };
        for (const attr of Array.from(target.attributes)) {
          if (attr.name.startsWith('data-track-') && attr.name !== 'data-track-click') {
            params[attr.name.replace('data-track-', '').replace(/-/g, '_')] = attr.value;
          }
        }
        sendGAEvent('ui_click', params);
      }

      // 外部リンク処理
      const externalHref = target.getAttribute('data-href-external');
      if (externalHref) {
        e.preventDefault();
        trackExternalLinkClick(
          Number(target.getAttribute('data-track-facility-id')),
          'website',
          externalHref
        );
        window.open(externalHref, '_blank', 'noopener,noreferrer');
      }
    }

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
}
