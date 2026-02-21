'use client';

import { useEffect } from 'react';
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
import { sendGAEvent } from '@/lib/analytics';

export default function WebVitalsReporter() {
  useEffect(() => {
    const reportMetric = ({ name, value, id, rating }: { name: string; value: number; id: string; rating: string }) => {
      sendGAEvent('web_vitals', {
        metric_name: name,
        metric_value: Math.round(name === 'CLS' ? value * 1000 : value),
        metric_id: id,
        metric_rating: rating,
      });
    };

    onCLS(reportMetric);
    onFCP(reportMetric);
    onINP(reportMetric);
    onLCP(reportMetric);
    onTTFB(reportMetric);
  }, []);

  return null;
}
