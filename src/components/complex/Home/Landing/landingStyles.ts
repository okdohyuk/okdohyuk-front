/**
 * 랜딩 전용 클래스 토큰 (unslop 2026-11-19).
 *
 * 크롬은 조용하게: 그라디언트·글래스·알약 CTA 없음, 굵기 400/500, 대문자 아이브로우 없음.
 * 색과 디테일은 제품 샷(DeviceFrame) 한 곳에 몰아 둔다. 버튼은 `@components/basic/Button`.
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

/**
 * 챕터 번호·개수 같은 메타 — 뮤트, 문장형(대문자·자간 없음), 표 숫자.
 * 모노 스택에는 한글/가나 글리프가 없어 섞이면 자간이 벌어지므로 본문 서체를 쓴다.
 */
export const LANDING_META = 'text-xs leading-4 text-fg-5 tabular-nums';

/** 섹션 h2 — 2줄 타이틀용. 40px 이상에서만 살짝 좁힌다. */
export const LANDING_SECTION_TITLE =
  'text-3xl font-medium leading-[1.15] text-fg-1 [word-break:keep-all] sm:text-4xl sm:tracking-[-0.02em] lg:text-5xl lg:leading-[1.1]';

/** 챕터/카드 h2·h3 */
export const LANDING_CHAPTER_TITLE =
  'text-3xl font-medium leading-[1.15] text-fg-1 [word-break:keep-all] lg:text-4xl lg:tracking-[-0.02em]';

/** 본문 — 보조 텍스트 역할(fg-4) */
export const LANDING_BODY = 'text-base leading-7 text-fg-4 [word-break:keep-all]';

/** 단일 레이어 카드 — 헤어라인 + 표면 한 단계, 그림자·블러 없음 */
export const LANDING_CARD = 'rounded-2xl border border-basic-3 bg-basic-0 dark:bg-basic-1';

/** 도구 링크 칩 — 컨트롤 반경(8), 호버는 표면 변화만 */
export const LANDING_TOOL_LINK =
  'inline-flex h-8 items-center gap-2 rounded-md border border-basic-3 px-3 text-sm text-fg-3 transition-colors hover:bg-basic-2 hover:text-fg-1 focus-ring';
