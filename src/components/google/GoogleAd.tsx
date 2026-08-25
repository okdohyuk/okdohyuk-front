'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { sendGAEvent } from '@libs/client/gtag';
import { isAdEligiblePath } from '@libs/client/adPolicy';
import { ADSENSE_SCRIPT_LOADED_EVENT, isAdsenseScriptLoaded } from '@libs/client/adsenseScript';

declare global {
  interface Window {
    adsbygoogle: any;
  }
}

type GoogleAdProps = {
  slotId: string;
  className?: string;
};

const MIN_AD_WIDTH = 250;
const SCRIPT_LOAD_TIMEOUT = 8000;
const RENDER_RESULT_TIMEOUT = 5000;

function getAvailableWidth(element: HTMLDivElement): number {
  if (!element.isConnected) return 0;

  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') return 0;

  const rectWidth = element.getBoundingClientRect().width;
  return Math.max(rectWidth, element.offsetWidth);
}

function GoogleAd({ slotId, className = '' }: GoogleAdProps) {
  const pathname = usePathname();
  const wrapRef = useRef<HTMLDivElement>(null);
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const el = insRef.current;
    if (!wrap || !el || !isAdEligiblePath(pathname ?? window.location.pathname)) return undefined;

    let pushed = false;
    let pushScheduled = false;
    let pushTimer: ReturnType<typeof setTimeout> | null = null;
    let ro: ResizeObserver | null = null;
    let io: IntersectionObserver | null = null;
    let resultMo: MutationObserver | null = null;
    let resultTimer: ReturnType<typeof setTimeout> | null = null;
    let scriptLoadTimer: ReturnType<typeof setTimeout> | null = null;
    let removeScriptListener: (() => void) | null = null;
    let settled = false;

    const finish = (status: 'filled' | 'empty') => {
      if (settled) return;
      settled = true;
      resultMo?.disconnect();
      if (resultTimer) clearTimeout(resultTimer);
      if (scriptLoadTimer) clearTimeout(scriptLoadTimer);
      removeScriptListener?.();
      sendGAEvent('ad_render_result', status, { slot_id: slotId });
    };

    const settleRenderResult = () => {
      const status = el.getAttribute('data-adsbygoogle-status');
      if (status === 'done') {
        finish(el.querySelector('iframe') ? 'filled' : 'empty');
      } else if (status === 'unfilled') {
        finish('empty');
      }
    };

    const observeRenderResult = () => {
      if (resultMo) return;

      resultMo = new MutationObserver(settleRenderResult);
      resultMo.observe(el, {
        attributes: true,
        attributeFilter: ['data-adsbygoogle-status'],
        childList: true,
      });

      // AdSense가 observer 등록보다 먼저 동기적으로 상태를 기록할 수 있다.
      settleRenderResult();
      resultTimer = setTimeout(() => finish('empty'), RENDER_RESULT_TIMEOUT);
    };

    const startObservingRenderResult = () => {
      if (isAdsenseScriptLoaded()) {
        observeRenderResult();
        return;
      }

      const onScriptLoaded = () => {
        removeScriptListener?.();
        if (scriptLoadTimer) clearTimeout(scriptLoadTimer);
        observeRenderResult();
      };

      window.addEventListener(ADSENSE_SCRIPT_LOADED_EVENT, onScriptLoaded);
      removeScriptListener = () =>
        window.removeEventListener(ADSENSE_SCRIPT_LOADED_EVENT, onScriptLoaded);
      scriptLoadTimer = setTimeout(() => finish('empty'), SCRIPT_LOAD_TIMEOUT);
    };

    const pushNow = () => {
      if (pushed || !el.isConnected || getAvailableWidth(wrap) < MIN_AD_WIDTH) return;

      // 이미 처리된 ins는 전역 큐에 다시 넣지 않는다.
      if (el.hasAttribute('data-adsbygoogle-status')) {
        observeRenderResult();
        return;
      }

      pushed = true;
      startObservingRenderResult();
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        // adsbygoogle.push의 동기 throw는 슬롯 하나의 렌더링을 중단시키지 않는다.
      }
      ro?.disconnect();
      io?.disconnect();
    };

    const tryPush = () => {
      if (pushed || pushScheduled || getAvailableWidth(wrap) < MIN_AD_WIDTH) return;
      pushScheduled = true;

      pushTimer = setTimeout(() => {
        pushScheduled = false;
        pushTimer = null;
        pushNow();
      }, 0);
    };

    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(tryPush);
      ro.observe(wrap);
    }
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) tryPush();
      });
      io.observe(wrap);
    }

    tryPush();

    return () => {
      ro?.disconnect();
      io?.disconnect();
      resultMo?.disconnect();
      if (pushTimer) clearTimeout(pushTimer);
      if (resultTimer) clearTimeout(resultTimer);
      if (scriptLoadTimer) clearTimeout(scriptLoadTimer);
      removeScriptListener?.();
    };
  }, [pathname, slotId]);

  if (!isAdEligiblePath(pathname ?? '')) return null;

  return (
    <div ref={wrapRef} className={className} style={{ minHeight: 100 }}>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', minHeight: 100 }}
        data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID}
        data-ad-slot={String(slotId)}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

export default GoogleAd;

GoogleAd.defaultProps = {
  className: '',
};
