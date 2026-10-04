'use client';

import { useEffect } from 'react';
import { onCLS, onFCP, onINP, onLCP, onTTFB, type INPMetricWithAttribution } from 'web-vitals/attribution';
import { sendGAEvent } from '@/lib/analytics';

// GA4 のイベントパラメータ値は100文字まで。超過分は GA4 側で切られるので先に丸める
const GA_PARAM_MAX_LENGTH = 100;

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

    // INP はモバイルで基準未達（2026-09: good 86.6%）。どの操作のどの段階が遅いかを特定するため、
    // 要素セレクタと最長フェーズ（入力待ち／処理／描画）を付けて送る
    const reportINP = (metric: INPMetricWithAttribution) => {
      const { interactionTarget, interactionType, inputDelay, processingDuration, presentationDelay, loadState } =
        metric.attribution;
      const phases = { input_delay: inputDelay, processing: processingDuration, presentation: presentationDelay };
      const slowestPhase = (Object.keys(phases) as (keyof typeof phases)[]).reduce((a, b) =>
        phases[a] >= phases[b] ? a : b
      );
      sendGAEvent('web_vitals', {
        metric_name: metric.name,
        metric_value: Math.round(metric.value),
        metric_id: metric.id,
        metric_rating: metric.rating,
        inp_target: interactionTarget.slice(0, GA_PARAM_MAX_LENGTH),
        inp_type: interactionType,
        inp_phase: slowestPhase,
        inp_load_state: loadState,
      });
    };

    onCLS(reportMetric);
    onFCP(reportMetric);
    onINP(reportINP);
    onLCP(reportMetric);
    onTTFB(reportMetric);
  }, []);

  return null;
}
