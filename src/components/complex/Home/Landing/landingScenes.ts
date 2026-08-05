import type { ShowcaseChapterId } from '@assets/datas/landingShowcase';
import { messageValues, type MessageTiming, type SceneValue } from './sceneEngine';

/**
 * 랜딩 씬 구성 — 인프런 애플 클론 강의의 `sceneInfo` 배열에 대응하는 **정적 정의**.
 *
 * 런타임 상태(scrollHeight, currentScene, 로드된 이미지…)는 여기 두지 않는다.
 * 타이밍이나 씬 순서를 바꾸고 싶으면 이 파일만 고치면 된다(강의의 유지보수 원칙 그대로).
 */

/** 히어로 카피 3개가 순차로 등장/퇴장하는 리듬. 등장 0.1 → 유지 0.05 → 퇴장 0.05 → 쉼 0.05 */
export const HERO_MESSAGE_TIMINGS: MessageTiming[] = [
  { in: { start: 0.05, end: 0.15 }, out: { start: 0.2, end: 0.25 }, split: 0.18 },
  { in: { start: 0.3, end: 0.4 }, out: { start: 0.45, end: 0.5 }, split: 0.42 },
  { in: { start: 0.55, end: 0.65 }, out: { start: 0.7, end: 0.75 }, split: 0.67 },
];

/** 히어로 배경 워시는 씬 끝에서 걷힌다. */
export const HERO_WASH_OPACITY: SceneValue = [1, 0, { start: 0.85, end: 1 }];

/**
 * 씬 진입 페이드가 끝나는 지점 — **미끄러져 들어오는 구간(마지막 1vh)의 비율**.
 *
 * sticky 씬은 앞 씬의 마지막 1vh 동안 화면 아래에서 올라온다. 그 구간에서 씬의 자체
 * 비율(scrollRatio)은 아직 0 이라, 진입 연출을 비율 기준으로 잡으면 **올라오는 내내
 * opacity 0** 이 되어 앞 씬과의 사이가 통째로 빈다(실측 약 950px 공백).
 * 그래서 진입만은 비율이 아니라 "미끄러진 거리" 기준으로 계산하고, 고정되기 전에
 * 이미 1 이 되도록 1 보다 작은 값을 쓴다.
 */
export const SCENE_ENTER_SPAN = 0.72;

/** 도구 씬 공통 타이밍 (씬 높이를 1로 본 비율) */
export const TOOL_SCENE_VALUES = {
  /**
   * 제품 샷(브라우저 프레임) 스케일.
   *
   * opacity 는 여기서 다루지 않는다. 등장은 `SCENE_ENTER_SPAN` 기준(위 주석),
   * 퇴장은 **sticky 가 풀리며 위로 흘러가는 것 자체**가 퇴장이라 따로 페이드하지 않는다.
   * 예전에는 `opacityOut` 이 비율 0.92~1 에서 0 까지 떨어졌는데, 비율 1 = sticky 가
   * 풀리기 시작하는 지점이라 **아직 화면 한가운데 있는 프레임이 먼저 사라져** 버렸다.
   */
  frame: {
    scaleIn: [0.95, 1, { start: 0.02, end: 0.2 }] as SceneValue,
    scaleOut: [1, 0.97, { start: 0.92, end: 1 }] as SceneValue,
    split: 0.6,
  },
  /**
   * 헤드라인: 등장 후 **씬이 미끄러져 나가는 동안** 퇴장(비율 1 초과 구간).
   * 고정된 상태에서 먼저 지워 버리면 제품 샷만 덩그러니 남는다.
   */
  headline: messageValues({
    in: { start: 0.05, end: 0.16 },
    out: { start: 1.02, end: 1.18 },
    split: 0.6,
  }),
  /** CTA: 조금 늦게 등장해 씬 끝까지 유지(퇴장 없음 → out 을 no-op 으로 둔다) */
  cta: {
    opacity: [0, 1, { start: 0.18, end: 0.3 }] as SceneValue,
    translate: [16, 0, { start: 0.18, end: 0.3 }] as SceneValue,
  },
} as const;

/**
 * 블렌딩 씬 — 마지막 도구 화면이 "전체 도구 목록"으로 바뀐다.
 *
 * 좌우 흰 박스가 바깥으로 밀려나며 캔버스가 커지는 것처럼 보이는 착시(강의 5-3)와,
 * 아래에서부터 새 화면이 열리는 블렌딩(강의 5-6)을 쓴다.
 *
 * 다만 **경계를 페더링(soft edge)한다.** 강의는 같은 제품의 두 프레임을 겹치므로 자른
 * 경계선이 애초에 안 보이지만, 우리는 어두운 라이브 화면 ↔ 밝은 메뉴 목록이라 딱 자른
 * 경계가 **어두운 가로 띠**로 남아 연출이 아니라 렌더링 오류로 읽혔다.
 * 경계를 캔버스 높이의 `BLEND_FEATHER_RATIO` 만큼 그라디언트로 풀면 띠가 사라진다.
 *
 * 좌표는 창 크기에 따라 달라지므로 전부 런타임 계산이고, 여기서는 타이밍만 정의한다.
 */
export const BLEND_SCENE_TIMING = {
  /** 프레임(브라우저 창) 스케일 */
  frame: { start: 0.02, end: 0.12 },
  /** 흰 박스가 바깥으로 열리는 구간 */
  rectOpen: { start: 0.1, end: 0.34 },
  /** 목록 화면이 아래에서 차오르는 구간 (직전 구간의 end 를 그대로 이어받는다) */
  reveal: { start: 0.34, end: 0.6 },
  /** 캡션 등장 */
  caption: { start: 0.62, end: 0.76 },
} as const;

/**
 * 블렌딩 경계를 푸는 폭 — **캔버스 높이 기준 비율**.
 *
 * 0 이면 강의 원본과 같은 하드 엣지(= 어두운 가로 띠). 너무 크면 두 화면이 오래 겹쳐
 * 이중 노출로 보인다(0.22 로 찍어 보니 라이브 화면 글자가 목록 위에 오래 남았다).
 * 화면 높이의 1/8 쯤이 "경계가 안 보이면서도 차오르는 방향은 읽히는" 지점이었다.
 */
export const BLEND_FEATHER_RATIO = 0.13;

/**
 * 좌우 흰 박스의 폭 — **캔버스 폭 기준 비율**.
 *
 * 강의는 캔버스를 창보다 크게 키워 놓고 `window.innerWidth / canvasScaleRatio` 로
 * "캔버스 좌표계에서 본 창 폭"을 역산했다. 우리는 캔버스를 제품 샷 프레임 안에
 * contain 으로 눕혀 **캔버스 = 보이는 영역**이므로 역산 자체가 필요 없다.
 */
export const BLEND_RECT_WIDTH_RATIO = 0.16;

/*
 * 강의 씬 3에는 블렌딩 뒤 "캔버스 축소 → fixed 해제 → 자연 스크롤 복귀"(5-7 / 5-8)가 이어진다.
 * 여기서는 넣지 않았다. 축소가 끝나면 화면 중앙에 작아진 캔버스와 그 뒤 포스터가 동시에 보여
 * "무엇을 봐야 하는지"가 흐려졌고, 우리 씬 흐름은 곧바로 벤토(실물 DOM)로 이어지므로
 * 축소본을 한 번 더 보여줄 이유가 없다. 열림 → 블렌딩 → 캡션까지만 쓴다.
 */

export type LandingSceneId = 'hero' | ShowcaseChapterId | 'blend' | 'closing';

export type LandingSceneSpec = {
  id: LandingSceneId;
  type: 'sticky' | 'normal';
  heightNum?: number;
};

/**
 * 씬 순서와 높이.
 *
 * `heightNum` 은 "브라우저 높이의 N배"다. 고정 픽셀이면 기기마다 체감 속도가 달라진다.
 * - 히어로 4: 카피 3개 × 약 0.25 구간
 * - 도구 5: 90프레임을 5×vh 동안 재생 = 900px 창에서 프레임당 50px
 * - 블렌딩 4: 열림 0.24 + 블렌딩 0.26 + 캡션 0.14 + 여백
 */
export const LANDING_SCENES: LandingSceneSpec[] = [
  { id: 'hero', type: 'sticky', heightNum: 4 },
  { id: 'pokemon', type: 'sticky', heightNum: 5 },
  { id: 'clock', type: 'sticky', heightNum: 5 },
  { id: 'live', type: 'sticky', heightNum: 5 },
  { id: 'blend', type: 'sticky', heightNum: 4 },
  { id: 'closing', type: 'normal' },
];

/** 블렌딩 씬에서 아래로부터 드러날 이미지 */
export const BLEND_IMAGE_SRC = '/landing/seq/blend.webp';

/** 감속 계수. 작을수록 더 부드럽고 느리게 따라온다(강의 기본 0.1). */
export const SCROLL_ACCELERATION = 0.14;

/** 캔버스 원본 해상도 — `scripts/captureLandingFrames.js` 의 출력과 반드시 일치해야 한다. */
export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 800;
