'use client';

import { useEffect } from 'react';
import { trackFacilityCardClick, trackExternalLinkClick } from '@/lib/analytics';

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
