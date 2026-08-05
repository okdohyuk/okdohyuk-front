/**
 * 랜딩 전용 클래스 토큰.
 * 서비스 패널 토큰(interactiveStyles.ts)과 같은 계열이지만, 랜딩은 풀블리드 섹션과
 * 큰 타이포 스케일을 쓰므로 별도 상수로 분리한다.
 */

/** 섹션 공통 좌우 여백 + 컨테이너 */
export const LANDING_CONTAINER = 'mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10';

/**
 * 제품 샷을 크게 보여주는 씬 전용 컨테이너.
 *
 * 제품 샷 안의 글자 크기는 `표시 폭 / 캔버스 폭` 에 정비례하므로 프레임을 키우는 것이
 * 곧 가독성이다. 그래서 일반 섹션(max-w-6xl)보다 훨씬 넓게 쓴다.
 */
export const LANDING_WIDE_CONTAINER = 'mx-auto w-full max-w-[94rem] px-5 sm:px-8 lg:px-10';

/** 모노 아이브로우 (globals.css .landing-eyebrow 와 함께 사용) */
export const LANDING_EYEBROW = 'landing-eyebrow uppercase text-point-fg';

/** 섹션 h2 — 2줄 타이틀용 */
export const LANDING_SECTION_TITLE =
  'text-[clamp(2.1rem,5.2vw,3.75rem)] font-extrabold leading-[1.04] tracking-[-0.045em] text-fg-1';

/** 챕터/카드 h3 */
export const LANDING_CHAPTER_TITLE =
  'text-[clamp(1.9rem,3.6vw,3.1rem)] font-extrabold leading-[1.06] tracking-[-0.045em] text-fg-1 [word-break:keep-all]';

/** 본문 */
export const LANDING_BODY =
  'text-[15px] leading-[1.7] text-fg-4 [word-break:keep-all] sm:text-base';

/** 유리 카드 표면 */
export const LANDING_GLASS_CARD =
  'landing-glass rounded-[24px] border border-basic-3/70 bg-basic-0/72 backdrop-blur-xl backdrop-saturate-150';

/** 알약 CTA — 주 버튼 */
export const LANDING_CTA_PRIMARY =
  'inline-flex items-center justify-center gap-1.5 rounded-full bg-point-1 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-point-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-point-2';

/** 알약 CTA — 보조 버튼 */
export const LANDING_CTA_SECONDARY =
  'inline-flex items-center justify-center gap-1.5 rounded-full border border-basic-3 bg-basic-0/70 px-6 py-3 text-sm font-semibold text-fg-2 backdrop-blur-md transition-colors hover:border-point-2/70 hover:text-point-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-point-2';

/** 도구 링크 알약 */
export const LANDING_TOOL_PILL =
  'group inline-flex items-center gap-2 rounded-full border border-basic-3/80 bg-basic-1/70 px-3 py-1.5 text-[13px] font-medium text-fg-3 transition-colors hover:border-point-2/70 hover:bg-point-soft/60 hover:text-point-fg';
