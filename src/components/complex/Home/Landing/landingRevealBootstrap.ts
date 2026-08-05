/**
 * 스크롤 구동 애니메이션(SDA) 지원 여부를 **첫 페인트 전에** 판정하는 인라인 부트스트랩.
 *
 * 랜딩의 섹션 리빌은 `@supports (animation-timeline: view())` 블록으로 구현돼 있어
 * 미지원 브라우저(Safari 26 미만 등)에서는 통째로 무시되고 "정적으로만" 보인다.
 * 그런 브라우저에는 `<html class="no-sda">` 를 붙여 IntersectionObserver + transition 폴백
 * (globals.css 의 `html.no-sda` 블록 + `LandingScrollReveal`)으로 전환한다.
 *
 * 반드시 인라인 동기 스크립트여야 한다. `no-sda` 는 대상 요소를 숨기는 규칙이므로,
 * 하이드레이션 이후에 클래스를 붙이면 "보였다가 사라졌다가 다시 나타나는" 깜빡임이 생긴다.
 *
 * 안전망: `LandingScrollReveal` 이 마운트되면 `__landingRevealReady` 를 세운다.
 * 하이드레이션이 실패해 그 신호가 오지 않으면 타이머가 `no-sda` 를 걷어내 콘텐츠가
 * 영영 안 보이는 사태를 막는다("기본 = 보이는 상태" 원칙).
 */

/** 하이드레이션 실패 시 콘텐츠를 되살리기까지 기다리는 시간 */
const REVEAL_SAFETY_TIMEOUT_MS = 2500;

export const LANDING_REVEAL_BOOTSTRAP = `(function(){try{
var d=document.documentElement;
if(!window.matchMedia||!window.matchMedia('(prefers-reduced-motion: no-preference)').matches)return;
if(window.CSS&&CSS.supports&&CSS.supports('animation-timeline','view()'))return;
d.classList.add('no-sda');
setTimeout(function(){if(!window.__landingRevealReady)d.classList.remove('no-sda');},${REVEAL_SAFETY_TIMEOUT_MS});
}catch(e){}})();`;
