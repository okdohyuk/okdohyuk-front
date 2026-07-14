'use client';

import React, { useEffect, useRef } from 'react';
import { sendGAEvent } from '@libs/client/gtag';
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
// adsbygoogle.js는 lazyOnload로 로드되어 push() 시점엔 아직 로드 전일 수 있다.
// 스크립트 로드 자체를 기다리는 최대 시간. 이 시간 안에 로드 신호가 없으면
// 네트워크 레벨 차단(애드블록 등)으로 보고 곧바로 empty로 집계한다.
const SCRIPT_LOAD_TIMEOUT = 8000;
// 스크립트 로드 이후 AdSense가 슬롯 처리를 끝내고 data-adsbygoogle-status를 갱신할 때까지 기다리는 최대 시간.
// 이 시간 안에 상태 갱신이 없으면(애드블로커의 코스메틱 필터로 슬롯이 붕괴된 경우 포함) empty로 집계한다.
const RENDER_RESULT_TIMEOUT = 5000;

function GoogleAd({ slotId, className = '' }: GoogleAdProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const el = insRef.current;
    if (!wrap || !el) return undefined;

    let pushed = false;
    let ro: ResizeObserver | null = null;
    let io: IntersectionObserver | null = null;
    let resultMo: MutationObserver | null = null;
    let resultTimer: ReturnType<typeof setTimeout> | null = null;
    let scriptLoadTimer: ReturnType<typeof setTimeout> | null = null;
    let removeScriptListener: (() => void) | null = null;
    let settled = false;

    // 실제 광고 노출 성공률(= 애드블로커 등에 의한 미노출 비율의 근사치)을 GA4로 측정.
    // '고침' 대상이 아니라 관찰 대상: push 성공 여부와 별개로 슬롯이 실제로 채워졌는지를 본다.
    const finish = (status: 'filled' | 'empty') => {
      if (settled) return;
      settled = true;
      resultMo?.disconnect();
      if (resultTimer) clearTimeout(resultTimer);
      if (scriptLoadTimer) clearTimeout(scriptLoadTimer);
      removeScriptListener?.();
      sendGAEvent('ad_render_result', status, { slot_id: slotId });
    };

    const observeRenderResult = () => {
      resultMo = new MutationObserver(() => {
        if (el.getAttribute('data-adsbygoogle-status') === 'done') {
          finish(el.querySelector('iframe') ? 'filled' : 'empty');
        }
      });
      resultMo.observe(el, {
        attributes: true,
        attributeFilter: ['data-adsbygoogle-status'],
        childList: true,
      });

      resultTimer = setTimeout(() => finish('empty'), RENDER_RESULT_TIMEOUT);
    };

    // adsbygoogle.js가 이미 로드되어 있으면(같은 페이지의 이전 광고가 로드를 끝낸 경우 등)
    // 곧바로 관찰을 시작하고, 아니라면 로드 완료 이벤트를 기다린다.
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

    // 폭이 확보되고 뷰포트에 들어왔을 때 1회만 push.
    // AdSense가 계산하는 availableWidth는 <ins>가 아니라 부모(래퍼)의 콘텐츠 폭이다.
    // 과거 구현은 <ins>에 min-width를 걸고 <ins>.offsetWidth로 가드했는데,
    // min-width는 부모 폭이 0이어도 offsetWidth를 그 값 이상으로 부풀려(overflow)
    // 가드가 항상 통과 → 0폭 부모에서 push가 나가 No-slot-size(availableWidth=0)를 유발했다.
    // 따라서 래퍼(실제 가용 폭)를 측정하고, <ins>는 width:100%로 래퍼를 그대로 따르게 한다.
    const tryPush = () => {
      if (pushed || !el.isConnected) return;
      if (wrap.offsetWidth < MIN_AD_WIDTH) return;
      pushed = true;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        // adsbygoogle.push의 동기 throw만 흡수. 비동기 TagError는 Sentry로 보내 모니터링 유지.
      }
      ro?.disconnect();
      io?.disconnect();
      startObservingRenderResult();
    };

    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(tryPush);
      ro.observe(wrap);
    }
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) tryPush();
      });
      io.observe(wrap);
    }

    tryPush();

    return () => {
      ro?.disconnect();
      io?.disconnect();
      resultMo?.disconnect();
      if (resultTimer) clearTimeout(resultTimer);
      if (scriptLoadTimer) clearTimeout(scriptLoadTimer);
      removeScriptListener?.();
    };
  }, []);

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
