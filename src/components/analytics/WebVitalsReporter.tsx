'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { sendGAEvent } from '@libs/client/gtag';

// =============================================================================
// Core Web Vitals 임계값 (Phase 1 명세 기준)
// =============================================================================
type MetricRating = 'good' | 'ni' | 'poor';

const THRESHOLDS: Record<string, { good: number; ni: number }> = {
  LCP: { good: 2500, ni: 4000 },
  CLS: { good: 0.1, ni: 0.25 },
  INP: { good: 200, ni: 500 },
  FCP: { good: 1800, ni: 3000 },
  TTFB: { good: 800, ni: 1800 },
};

function rate(name: string, value: number): MetricRating {
  const t = THRESHOLDS[name];
  if (!t) return 'good';
  if (value < t.good) return 'good';
  if (value < t.ni) return 'ni';
  return 'poor';
}

// next/web-vitals 훅을 사용해 Core Web Vitals를 GA4로 전송
export default function WebVitalsReporter(): null {
  useReportWebVitals((metric) => {
    const { name, value } = metric;
    if (!THRESHOLDS[name]) return; // LCP/CLS/INP/FCP/TTFB만 보고
    const metricRating = rate(name, value);

    sendGAEvent('web_vitals', name, {
      metric_name: name,
      metric_id: metric.id,
      metric_value: value,
      metric_delta: metric.delta,
      metric_rating: metricRating,
      metric_navigation_type: (metric as { navigationType?: string }).navigationType ?? 'unknown',
    });
  });

  return null;
}
