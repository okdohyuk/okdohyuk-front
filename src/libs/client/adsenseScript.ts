// adsbygoogle.js는 GoogleAdsense 컴포넌트에서 next/script의 lazyOnload 전략으로 로드된다.
// 즉 페이지 로드가 끝나고 브라우저가 idle 상태가 될 때까지 로딩 자체가 미뤄질 수 있다.
// GoogleAd는 이 로드 완료 시점을 알아야 "언제부터 슬롯 처리 결과를 기다릴지" 정확히 잴 수 있다.
export const ADSENSE_SCRIPT_LOADED_EVENT = 'adsbygoogle-script-loaded';

declare global {
  interface Window {
    adsenseScriptLoaded?: boolean;
  }
}

export function markAdsenseScriptLoaded() {
  if (typeof window === 'undefined') return;
  window.adsenseScriptLoaded = true;
  window.dispatchEvent(new Event(ADSENSE_SCRIPT_LOADED_EVENT));
}

export function isAdsenseScriptLoaded(): boolean {
  return typeof window !== 'undefined' && window.adsenseScriptLoaded === true;
}
