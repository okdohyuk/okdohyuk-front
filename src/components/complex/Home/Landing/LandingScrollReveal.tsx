'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    /** 부트스트랩 스크립트의 안전망 타이머를 해제하는 신호 */
    __landingRevealReady?: boolean;
  }
}

/** `.landing-reveal-stagger` 자식까지 포함한 리빌 대상 */
const REVEAL_SELECTOR = '.landing-reveal, .landing-reveal-stagger > *';

/**
 * 스크롤 구동 애니메이션 미지원 브라우저에서 섹션 리빌을 대신 굴리는 컨트롤러.
 *
 * 지원 브라우저(Chromium, Safari 26+)에서는 `no-sda` 가 없으므로 아무 일도 하지 않고,
 * CSS `animation-timeline: view()` 경로가 그대로 동작한다. 렌더 출력이 없어
 * 서버 컴포넌트로 짜인 섹션들(LandingBento/LandingClosing/스토리 헤더)을
 * 클라이언트 컴포넌트로 바꾸지 않아도 된다.
 */
export default function LandingScrollReveal() {
  useEffect(() => {
    const root = document.documentElement;
    // 하이드레이션이 여기까지 왔다 = 폴백을 굴릴 주체가 살아 있다.
    // (부트스트랩 인라인 스크립트와 주고받는 전역 신호라 언더스코어 접두사를 쓴다)
    // eslint-disable-next-line no-underscore-dangle
    window.__landingRevealReady = true;

    if (!root.classList.contains('no-sda')) return undefined;

    if (typeof IntersectionObserver !== 'function') {
      // 관찰이 불가능하면 숨겨둘 이유가 없다. 정적으로라도 보이는 편이 낫다.
      root.classList.remove('no-sda');
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          // 한 번 등장하면 되돌리지 않는다(SDA 경로도 스크롤을 되감지 않는 한 유지된다).
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    );

    const targets = Array.from(document.querySelectorAll(REVEAL_SELECTOR));
    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, []);

  return null;
}
