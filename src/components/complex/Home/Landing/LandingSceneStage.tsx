'use client';

/*
 * 이 엔진의 본질이 "DOM 노드를 직접 변형하는 것"이다.
 * 스크롤마다 새 객체를 만들면 React state 리렌더를 피하려는 설계 자체가 무너진다.
 */
/* eslint-disable no-param-reassign */
/* 저장소 관례: 기본값을 함수 시그니처에서 주므로 defaultProps 규칙은 끈다. */
/* eslint-disable react/require-default-props */

import React, { useEffect, useRef } from 'react';
import NextImage from 'next/image';
import NextLink from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { SHOWCASE_SEQUENCES } from '@assets/datas/landingSequences';
import { sendGAEvent } from '@libs/client/gtag';
import { cn } from '@utils/cn';
import useMediaQuery from '@hooks/useMediaQuery';
import type { LandingCopy } from '@libs/server/landingCopy';
import { Language } from '~/app/i18n/settings';
import type { StoryChapterData } from './landingStoryTypes';
import {
  BLEND_FEATHER_RATIO,
  BLEND_IMAGE_SRC,
  BLEND_RECT_WIDTH_RATIO,
  BLEND_SCENE_TIMING,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  HERO_MESSAGE_TIMINGS,
  HERO_WASH_OPACITY,
  LANDING_SCENES,
  SCENE_ENTER_SPAN,
  SCROLL_ACCELERATION,
  TOOL_SCENE_VALUES,
} from './landingScenes';
import {
  calcInOut,
  calcValue,
  enterAlpha as calcEnterAlpha,
  messageValues,
  type SceneValue,
} from './sceneEngine';
import {
  createFrameStore,
  nearestLoadedFrame,
  startLoading,
  whenIdle,
  type FrameStore,
} from './landingFrameLoader';
import {
  LANDING_CONTAINER,
  LANDING_CTA_PRIMARY,
  LANDING_CTA_SECONDARY,
  LANDING_EYEBROW,
  LANDING_TOOL_PILL,
  LANDING_WIDE_CONTAINER,
} from './landingStyles';

/** 제품 샷 프레임의 주소 표시줄에 넣을 도메인 */
const SITE_HOST = 'okdohyuk.dev';

/**
 * 라운드 브라우저 창 프레임 — 스크린샷을 "제품 샷"으로 읽히게 하는 장치.
 *
 * 안쪽 화면은 `aspect-ratio: 16/10` 이라 1600×1000 프레임이 잘림 없이 그대로 들어간다.
 * 포스터(`NextImage`)는 항상 DOM 에 남고, 엔진이 돌 때만 캔버스가 그 위를 덮는다.
 */
function DeviceFrame({
  url,
  baseUrl,
  poster,
  alt,
  priority = false,
}: {
  url: string;
  /**
   * 블렌딩 씬처럼 시작 화면과 도착 화면이 다른 경우의 시작 주소.
   * 엔진이 씬에 `data-blend-phase="base"` 를 걸면 이쪽이 보인다(텍스트를 직접
   * 갈아끼우지 않고 CSS 로만 토글해야 React 가 소유한 노드를 건드리지 않는다).
   */
  baseUrl?: string;
  poster: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <figure className="landing-device">
      <div className="landing-device-bar" aria-hidden>
        <span className="landing-device-dot" />
        <span className="landing-device-dot" />
        <span className="landing-device-dot" />
        <span className="landing-device-url">
          {baseUrl ? (
            <>
              <span className="landing-device-url-base">{baseUrl}</span>
              <span className="landing-device-url-main">{url}</span>
            </>
          ) : (
            url
          )}
        </span>
      </div>
      <div className="landing-device-screen">
        <NextImage
          src={poster}
          alt={alt}
          fill
          sizes="(min-width: 768px) 62vw, 100vw"
          priority={priority}
          className="object-cover"
        />
        <canvas
          aria-hidden
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="landing-scene-canvas"
        />
      </div>
    </figure>
  );
}

type HeroCopy = LandingCopy['hero'];

type LandingSceneStageProps = {
  lng: Language;
  hero: HeroCopy;
  story: LandingCopy['story'];
  chapters: StoryChapterData[];
  /** 씬 흐름이 끝난 뒤 이어지는 일반 스크롤 콘텐츠(벤토 + 클로징) */
  children: React.ReactNode;
  /** 히어로 CTA(클라이언트 상호작용)와 지표 등 서버에서 만든 노드 */
  heroActions: React.ReactNode;
  heroStats: React.ReactNode;
  blendCaption: { title: string; body: string; cta: string };
};

/**
 * 스크롤 스크럽을 켜는 조건. `globals.css` 의 씬 트랙 미디어 쿼리와 **정확히 같아야 한다**
 * (어긋나면 문서 높이와 엔진 판정이 갈려 빈 화면/잘림이 생긴다).
 *
 * `prefers-reduced-motion` 은 여기 넣지 않는다. 스크럽은 **사용자가 스크롤한 만큼만**
 * 움직이는 사용자 주도 동작이라 "동작 줄이기"가 끄려는 대상(자동 재생·자동 등장·장식 모션)이
 * 아니다. 끄면 화면이 통째로 정지 포스터가 되어 "아무것도 안 바뀐다"가 된다.
 * 대신 감속(관성)·카운트업·리빌처럼 **스크롤과 1:1이 아닌 자동 모션만** 아래에서 끈다.
 */
const SCRUB_QUERY = '(min-width: 768px)';

/** 자동/장식 모션을 끄는 조건. 스크럽 자체는 이 값과 무관하게 유지된다. */
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** 감속 루프 종료 임계값(px) */
const SETTLE_EPSILON = 1;

/** 씬 인덱스 상수 — LANDING_SCENES 순서와 짝을 이룬다. */
const HERO_SCENE = 0;
const FIRST_TOOL_SCENE = 1;
const TOOL_SCENE_COUNT = 3;
const BLEND_SCENE = FIRST_TOOL_SCENE + TOOL_SCENE_COUNT;

const HERO_MESSAGE_VALUES = HERO_MESSAGE_TIMINGS.map(messageValues);

type SceneRuntime = {
  section: HTMLElement;
  sticky: HTMLElement | null;
  messages: HTMLElement[];
  canvas: HTMLCanvasElement | null;
  context: CanvasRenderingContext2D | null;
  wash: HTMLElement | null;
  cta: HTMLElement | null;
  /** 제품 샷 프레임 컨테이너(포스터 + 캔버스를 함께 페이드/스케일) */
  frame: HTMLElement | null;
  /** 씬이 차지하는 실제 문서 높이(씬 전환 판정용) */
  scrollHeight: number;
  /**
   * 애니메이션 비율의 기준 높이.
   *
   * 강의는 `position: fixed` + 씬별 표시 토글이라 0~1 전 구간을 다 쓸 수 있다.
   * 우리는 `position: sticky` 라 **마지막 1vh 는 고정이 풀리며 위로 흘러가는 구간**이다.
   * 그 몫을 빼지 않으면 타이밍표의 뒷부분(캡션·퇴장)이 이미 화면 밖에서 재생된다.
   */
  animHeight: number;
  /**
   * sticky 가 풀려 씬이 화면 밖으로 미끄러지는 거리(= 뷰포트 높이).
   *
   * 다음 씬은 **이 구간 동안 화면 아래에서 올라온다**. 그때 다음 씬의 자체 비율은
   * 아직 0 이므로, 진입 연출은 비율이 아니라 이 거리로 계산해야 한다.
   */
  slideHeight: number;
};

/** 씬 진입 알파(`sceneEngine.enterAlpha`)에 랜딩 공통 구간 값을 묶어 둔다. */
const enterAlpha = (offset: number, slideHeight: number) =>
  calcEnterAlpha(offset, slideHeight, SCENE_ENTER_SPAN);

export default function LandingSceneStage({
  lng,
  hero,
  story,
  chapters,
  children,
  heroActions,
  heroStats,
  blendCaption,
}: LandingSceneStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const scrub = useMediaQuery(SCRUB_QUERY);
  const reducedMotion = useMediaQuery(REDUCED_MOTION_QUERY);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    /* ------------------------------------------------------------------
     * 상태는 전부 ref/지역 변수다. React state 로 두면 스크롤마다 리렌더가 나서
     * 이 엔진이 피하려던 부하가 그대로 돌아온다. DOM 은 직접 조작한다.
     * ------------------------------------------------------------------ */
    let yOffset = 0;
    let delayedYOffset = 0;
    let prevScrollHeight = 0;
    let currentScene = 0;
    let enterNewScene = false;
    let rafId = 0;
    let rafRunning = false;
    let disposed = false;
    let lastWidth = window.innerWidth;

    /*
     * 감속(관성)은 스크롤이 멈춘 뒤에도 화면이 혼자 몇 프레임 더 움직이는 **자동 모션**이다.
     * 동작 줄이기에서는 계수를 1 로 둬 스크롤 위치가 그대로 즉시 반영되게 한다
     * (스크럽 자체는 유지, 관성만 제거).
     */
    const acceleration = reducedMotion ? 1 : SCROLL_ACCELERATION;

    const sections = Array.from(stage.querySelectorAll<HTMLElement>('[data-scene-index]')).sort(
      (a, b) => Number(a.dataset.sceneIndex) - Number(b.dataset.sceneIndex),
    );

    const scenes: SceneRuntime[] = sections.map((section) => {
      const canvas = section.querySelector<HTMLCanvasElement>('canvas');
      return {
        section,
        sticky: section.querySelector<HTMLElement>('[data-scene-sticky]'),
        messages: Array.from(section.querySelectorAll<HTMLElement>('[data-scene-message]')),
        canvas,
        context: canvas ? canvas.getContext('2d') : null,
        wash: section.querySelector<HTMLElement>('[data-scene-wash]'),
        cta: section.querySelector<HTMLElement>('[data-scene-cta]'),
        frame: section.querySelector<HTMLElement>('[data-scene-frame]'),
        scrollHeight: 0,
        animHeight: 0,
        slideHeight: 1,
      };
    });

    if (scenes.length !== LANDING_SCENES.length) return undefined;

    /* ---------------------------------------------------------------- 프레임 로딩 */

    const stores: FrameStore[] = LANDING_SCENES.map(() => createFrameStore());
    const blendImage = new Image();
    let blendImageReady = false;

    const toolSpecFor = (sceneIndex: number) => {
      const spec = LANDING_SCENES[sceneIndex];
      if (spec.id === 'pokemon' || spec.id === 'clock' || spec.id === 'live') {
        return SHOWCASE_SEQUENCES[spec.id];
      }
      return null;
    };

    const requestDraw = () => {
      if (!rafRunning && !disposed) {
        rafRunning = true;
        // loop 과 requestDraw 는 상호 재귀다(loop 이 끝나며 다음 스크롤을 기다림).
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        rafId = window.requestAnimationFrame(loop);
      }
    };

    /**
     * 시퀀스 로딩은 **순차 체인**이다(강의 74372 「캔버스 이미지 부분 로딩」).
     * 3도구 × 90프레임을 한꺼번에 요청하면 첫 화면이 늦고 커넥션도 포화된다.
     * 지금 볼 씬부터 받고, 그게 끝나면 유휴 시간에 다음 도구를 잇는다.
     */
    const ensureSequence = (sceneIndex: number) => {
      const spec = toolSpecFor(sceneIndex);
      if (!spec || stores[sceneIndex].started) return;

      startLoading(stores[sceneIndex], spec, () => {
        requestDraw();
        // ensureSequence 와 chainNextSequence 는 상호 재귀(하나가 끝나면 다음을 잇는다).
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        if (stores[sceneIndex].finished) chainNextSequence();
      });
    };

    /** 아직 시작하지 않은 도구 시퀀스 중 현재 씬에서 가장 가까운 것 하나를 잇는다. */
    function chainNextSequence() {
      if (disposed) return;
      const pending: number[] = [];
      for (let i = FIRST_TOOL_SCENE; i < FIRST_TOOL_SCENE + TOOL_SCENE_COUNT; i += 1) {
        if (!stores[i].started) pending.push(i);
      }
      if (pending.length === 0) return;

      pending.sort((a, b) => Math.abs(a - currentScene) - Math.abs(b - currentScene));
      whenIdle(() => {
        if (!disposed) ensureSequence(pending[0]);
      });
    }

    /* ---------------------------------------------------------------- 레이아웃 */

    /*
     * 강의는 `heightNum × innerHeight` 를 JS 로 써넣고 리사이즈마다 다시 계산한다.
     * 여기서는 섹션 높이를 CSS(`calc(N * 100svh)`)로 선언해 **SSR 시점에 이미 확정**되게 했다.
     * → 하이드레이션 후 문서 높이가 튀지 않고(CLS 0), 리사이즈 시 `location.reload`(강의 52392)
     *   같은 SPA 금기 수단도 필요 없다. JS 는 실제 높이를 "읽기만" 한다.
     */
    const measure = () => {
      for (let i = 0; i < scenes.length; i += 1) {
        const height = scenes[i].section.offsetHeight;
        scenes[i].scrollHeight = height;
        scenes[i].animHeight =
          LANDING_SCENES[i].type === 'sticky'
            ? Math.max(1, height - window.innerHeight)
            : Math.max(1, height);
        scenes[i].slideHeight = Math.max(1, height - scenes[i].animHeight);
      }
    };

    /*
     * 강의는 캔버스를 화면 전체에 깔고 `transform: scale(innerHeight / 1080)` 으로 키웠다.
     * 그 방식은 "높이 기준 fit"이라 프레임 비율(16:10)과 창 비율이 다르면 좌우가 잘린다.
     * 여기서는 캔버스를 제품 샷 프레임(`aspect-ratio: 16/10`) 안에 100%/100% 로 눕혀
     * **CSS 가 contain 을 보장**하게 했다 → JS 스케일 계산 자체가 필요 없고, 어떤 창
     * 비율에서도 촬영본 전체가 잘림 없이 보인다.
     */

    /* ---------------------------------------------------------------- 그리기 */

    const setStyle = (el: HTMLElement | null, opacity: number, translatePercent?: number) => {
      if (!el) return;
      el.style.opacity = String(opacity);
      if (translatePercent !== undefined) {
        // translate3d = 하드웨어 가속 보장(강의 41944)
        el.style.transform = `translate3d(0, ${translatePercent}%, 0)`;
      }
    };

    /**
     * 제품 샷 프레임의 등장/퇴장.
     *
     * - 등장: 씬이 아래에서 미끄러져 들어오는 동안 `enterAlpha` 로 살아난다.
     * - 퇴장: **따로 페이드하지 않는다.** sticky 가 풀려 위로 흘러가는 것이 곧 퇴장이다.
     *   페이드로 지우면 아직 화면 한가운데 있는 프레임이 먼저 사라져 공백이 생긴다.
     *
     * 포스터와 캔버스가 같은 컨테이너 안에 있으므로 둘이 겹쳐 보이는 고스팅이 없다.
     */
    const setFrameStyle = (scene: SceneRuntime, offset: number) => {
      const el = scene.frame;
      if (!el) return;
      const { frame } = TOOL_SCENE_VALUES;
      el.style.opacity = String(enterAlpha(offset, scene.slideHeight));
      const scale = calcInOut(frame.scaleIn, frame.scaleOut, frame.split, offset, scene.animHeight);
      el.style.transform = `translate3d(0, 0, 0) scale(${scale})`;
    };

    const drawToolCanvas = (sceneIndex: number, canvasYOffset: number) => {
      const scene = scenes[sceneIndex];
      const spec = toolSpecFor(sceneIndex);
      if (!scene.canvas || !scene.context || !spec) return;

      const store = stores[sceneIndex];
      if (!store.started) return;

      const sequence: SceneValue = [0, spec.frameCount - 1];
      const index = Math.min(
        spec.frameCount - 1,
        Math.max(0, Math.round(calcValue(sequence, canvasYOffset, scene.animHeight))),
      );
      const image = nearestLoadedFrame(store.images, index);
      if (!image) return;

      scene.context.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      scene.canvas.dataset.frame = String(index + 1);
    };

    /*
     * 블렌딩용 오프스크린 캔버스.
     *
     * 경계를 부드럽게 풀려면 "라이브 화면 레이어만" 아래에서부터 지워야 하는데,
     * 화면 캔버스에 바로 `destination-out` 을 걸면 밑에 깔린 목록까지 함께 지워진다.
     * 그래서 라이브 화면을 여기에 먼저 그려 페더링한 뒤, 통째로 한 번에 얹는다.
     */
    const overlay = document.createElement('canvas');
    overlay.width = CANVAS_WIDTH;
    overlay.height = CANVAS_HEIGHT;
    const overlayContext = overlay.getContext('2d');

    /**
     * 블렌딩 씬 — 좌우 흰 박스가 바깥으로 밀려나며 캔버스가 커지는 착시(강의 5-3) →
     * 아래에서부터 전체 도구 목록이 차오름(강의 5-6).
     *
     * 강의와 다른 점은 **경계를 페더링**한다는 것 하나다. 강의는 같은 제품의 두 프레임이라
     * 딱 자른 경계가 안 보이지만, 우리는 어두운 라이브 화면 ↔ 밝은 메뉴 목록이라 그 경계가
     * **어두운 가로 띠**로 남아 렌더링 오류처럼 읽혔다.
     *
     * 레이어 순서: 흰 바탕 → 목록(불투명) → 라이브 화면(아래부터 그라디언트로 지워짐) → 흰 박스.
     * 항상 불투명한 레이어가 캔버스를 덮으므로 중간에 화면이 옅어지는 구간이 없다.
     *
     * 좌표는 창 크기에 따라 달라져 전부 런타임 계산이다.
     */
    const drawBlendScene = (currentYOffset: number) => {
      const scene = scenes[BLEND_SCENE];
      const { context, canvas } = scene;
      if (!context || !canvas) return;

      const lastToolStore = stores[FIRST_TOOL_SCENE + TOOL_SCENE_COUNT - 1];
      const baseFrame = nearestLoadedFrame(
        lastToolStore.images,
        Math.max(0, lastToolStore.images.length - 1),
      );

      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      if (blendImageReady) context.drawImage(blendImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      /*
       * 실제 변수는 "차오른 높이" 하나뿐이고 경계 y 는 거기서 도출된다(강의 43081).
       * 페더 폭만큼 앞뒤로 넉넉히 잡아야 시작/끝에서 반쯤 지워진 띠가 남지 않는다.
       */
      const feather = CANVAS_HEIGHT * BLEND_FEATHER_RATIO;
      const revealHeight = calcValue(
        [-feather, CANVAS_HEIGHT + feather, BLEND_SCENE_TIMING.reveal],
        currentYOffset,
        scene.animHeight,
      );

      /*
       * 주소 표시줄은 지금 화면을 채우고 있는 쪽을 가리켜야 한다. 절반 넘게 열리기 전에는
       * 아직 직전 도구 화면이므로 그 주소를 보여준다(텍스트 교체가 아니라 CSS 토글).
       */
      scene.section.dataset.blendPhase =
        revealHeight < CANVAS_HEIGHT * 0.5 && baseFrame ? 'base' : 'reveal';

      if (baseFrame && overlayContext && revealHeight < CANVAS_HEIGHT + feather) {
        overlayContext.globalCompositeOperation = 'source-over';
        overlayContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        overlayContext.drawImage(baseFrame, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        if (revealHeight > -feather) {
          const edge = CANVAS_HEIGHT - revealHeight;
          const mask = overlayContext.createLinearGradient(0, edge - feather, 0, edge + feather);
          mask.addColorStop(0, 'rgba(0,0,0,0)');
          mask.addColorStop(1, 'rgba(0,0,0,1)');
          overlayContext.globalCompositeOperation = 'destination-out';
          overlayContext.fillStyle = mask;
          overlayContext.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          overlayContext.globalCompositeOperation = 'source-over';
        }

        context.drawImage(overlay, 0, 0);
      }

      /*
       * 흰 박스는 **맨 위**에 그린다. 예전에는 목록 이미지보다 먼저 그려서 아래쪽 절반이
       * 이미지에 덮여, 열리다 만 것처럼 보였다. 위에 두면 "가려져 있던 폭이 열린다"가 그대로 읽힌다.
       *
       * 강의는 캔버스가 창보다 크게 확대돼 있어 `innerWidth / canvasScaleRatio` 로
       * "캔버스 좌표계에서 본 창 폭"을 역산해야 했다. 우리는 캔버스가 곧 보이는 영역이라
       * 캔버스 폭을 그대로 쓰면 된다(창 크기·스크롤바 폭에 영향받지 않는다).
       */
      const rectWidth = CANVAS_WIDTH * BLEND_RECT_WIDTH_RATIO;
      const rect1Start = 0;
      const rect2Start = CANVAS_WIDTH - rectWidth;

      const rect1: SceneValue = [rect1Start, rect1Start - rectWidth, BLEND_SCENE_TIMING.rectOpen];
      const rect2: SceneValue = [rect2Start, rect2Start + rectWidth, BLEND_SCENE_TIMING.rectOpen];

      // 정수 좌표를 쓰면 캔버스 렌더링이 가볍다(강의 42821).
      context.fillStyle = '#ffffff';
      context.fillRect(
        Math.round(calcValue(rect1, currentYOffset, scene.animHeight)),
        0,
        Math.ceil(rectWidth),
        CANVAS_HEIGHT,
      );
      context.fillRect(
        Math.round(calcValue(rect2, currentYOffset, scene.animHeight)),
        0,
        Math.ceil(rectWidth),
        CANVAS_HEIGHT,
      );
    };

    /**
     * 씬 하나를 그린다.
     *
     * `sceneTop` 을 인자로 받는 이유: 전환 구간에서는 **현재 씬과 다음 씬을 함께** 그려야 하고,
     * 다음 씬의 offset 은 음수(아직 아래에서 올라오는 중)가 된다. `calcValue` 는 구간 밖을
     * 시작/끝값으로 고정하므로 음수 offset 도 안전하다.
     */
    const playScene = (sceneIndex: number, sceneTop: number) => {
      const scene = scenes[sceneIndex];
      if (!scene) return;
      const scrollHeight = scene.animHeight;
      if (scrollHeight <= 0) return;

      const textYOffset = yOffset - sceneTop;
      // 캔버스만 감속된 좌표를 쓴다. 텍스트까지 걸면 "부드럽다"가 아니라 "반응이 늦다"로 읽힌다.
      const canvasYOffset = delayedYOffset - sceneTop;

      if (sceneIndex === HERO_SCENE) {
        HERO_MESSAGE_VALUES.forEach((values, index) => {
          const message = scene.messages[index];
          if (!message) return;
          setStyle(
            message,
            calcInOut(values.opacityIn, values.opacityOut, values.split, textYOffset, scrollHeight),
            calcInOut(
              values.translateIn,
              values.translateOut,
              values.split,
              textYOffset,
              scrollHeight,
            ),
          );
        });
        if (scene.wash) {
          scene.wash.style.opacity = String(
            calcValue(HERO_WASH_OPACITY, textYOffset, scrollHeight),
          );
        }
        return;
      }

      if (sceneIndex >= FIRST_TOOL_SCENE && sceneIndex < BLEND_SCENE) {
        drawToolCanvas(sceneIndex, canvasYOffset);
        setFrameStyle(scene, textYOffset);

        const { headline } = TOOL_SCENE_VALUES;
        setStyle(
          scene.messages[0],
          calcInOut(
            headline.opacityIn,
            headline.opacityOut,
            headline.split,
            textYOffset,
            scrollHeight,
          ),
          calcInOut(
            headline.translateIn,
            headline.translateOut,
            headline.split,
            textYOffset,
            scrollHeight,
          ),
        );
        setStyle(
          scene.cta,
          calcValue(TOOL_SCENE_VALUES.cta.opacity, textYOffset, scrollHeight),
          calcValue(TOOL_SCENE_VALUES.cta.translate, textYOffset, scrollHeight),
        );
        return;
      }

      if (sceneIndex === BLEND_SCENE) {
        drawBlendScene(canvasYOffset);
        if (scene.frame) {
          // 도구 씬과 같은 규칙: 올라오는 동안 살아나고, 퇴장은 sticky 가 풀리는 것으로 대신한다.
          scene.frame.style.opacity = String(enterAlpha(textYOffset, scene.slideHeight));
          const scale = calcValue([0.95, 1, BLEND_SCENE_TIMING.frame], textYOffset, scrollHeight);
          scene.frame.style.transform = `translate3d(0, 0, 0) scale(${scale})`;
        }
        setStyle(
          scene.messages[0],
          calcValue([0, 1, BLEND_SCENE_TIMING.caption], textYOffset, scrollHeight),
          calcValue([20, 0, BLEND_SCENE_TIMING.caption], textYOffset, scrollHeight),
        );
      }
    };

    /**
     * 현재 씬 + (전환 중이면) 다음 씬을 그린다.
     *
     * sticky 씬의 마지막 1vh 는 고정이 풀려 위로 흘러가는 구간이고, 그동안 **다음 씬은 이미
     * 화면 아래에서 올라와 있다**. 현재 씬 하나만 그리면 그 겹침 구간에서 다음 씬이 CSS 기본값
     * (`opacity: 0`)으로 남아 화면이 통째로 빈다 — 실측 약 950px.
     */
    const playAnimation = () => {
      playScene(currentScene, prevScrollHeight);

      const current = scenes[currentScene];
      const isTail = delayedYOffset - prevScrollHeight > current.animHeight;
      if (!isTail || currentScene >= scenes.length - 1) return;

      const nextIndex = currentScene + 1;
      ensureSequence(nextIndex);
      playScene(nextIndex, prevScrollHeight + current.scrollHeight);
    };

    /* ---------------------------------------------------------------- 씬 판정 */

    const viewedScenes = new Set<number>();

    const applySceneAttributes = () => {
      stage.dataset.scene = String(currentScene);
      scenes.forEach((scene, index) => {
        const isSticky = LANDING_SCENES[index].type === 'sticky';
        const inactive = isSticky && index !== currentScene;
        // 화면 밖 씬의 링크가 Tab 포커스를 가로채지 않게 한다.
        if (inactive) scene.section.setAttribute('inert', '');
        else scene.section.removeAttribute('inert');
      });

      if (!viewedScenes.has(currentScene)) {
        viewedScenes.add(currentScene);
        sendGAEvent('landing_section_view', `scene_${LANDING_SCENES[currentScene].id}`, {
          scene_index: currentScene,
        });
      }
    };

    /**
     * 씬 전환 판정. 강의 43168 대로 **감속된 좌표(delayedYOffset)** 를 기준으로 삼는다.
     * yOffset 으로 판정하면 감속 지연 때문에 전환 순간 엉뚱한 도구의 프레임이 한 번 번쩍인다.
     */
    const updateScene = () => {
      enterNewScene = false;
      prevScrollHeight = 0;
      for (let i = 0; i < currentScene; i += 1) prevScrollHeight += scenes[i].scrollHeight;

      if (delayedYOffset > prevScrollHeight + scenes[currentScene].scrollHeight) {
        if (currentScene < scenes.length - 1) {
          enterNewScene = true;
          currentScene += 1;
          ensureSequence(currentScene);
          applySceneAttributes();
        }
      } else if (delayedYOffset < prevScrollHeight) {
        // 모바일 바운스로 음수 스크롤이 들어와도 -1 로 내려가지 않게 막는다(강의 41407).
        if (currentScene > 0) {
          enterNewScene = true;
          currentScene -= 1;
          ensureSequence(currentScene);
          applySceneAttributes();
        }
      }

      if (enterNewScene) {
        prevScrollHeight = 0;
        for (let i = 0; i < currentScene; i += 1) prevScrollHeight += scenes[i].scrollHeight;
      }
    };

    function loop() {
      if (disposed) return;

      delayedYOffset += (yOffset - delayedYOffset) * acceleration;
      updateScene();

      // 씬이 바뀌는 프레임은 계산값이 튀므로 통째로 건너뛴다(강의 41597 / 43168).
      if (!enterNewScene) playAnimation();

      // Math.abs 가 없으면 위로 스크롤할 때 감속이 안 걸린다(차이가 음수라 항상 < 1).
      if (Math.abs(yOffset - delayedYOffset) < SETTLE_EPSILON) {
        delayedYOffset = yOffset;
        if (!enterNewScene) playAnimation();
        rafRunning = false;
        return;
      }
      rafId = window.requestAnimationFrame(loop);
    }

    /* ---------------------------------------------------------------- 초기화 */

    const resetInlineStyles = () => {
      scenes.forEach((scene) => {
        scene.messages.forEach((message) => {
          message.style.removeProperty('opacity');
          message.style.removeProperty('transform');
        });
        [scene.wash, scene.cta, scene.frame].forEach((el) => {
          el?.style.removeProperty('opacity');
          el?.style.removeProperty('transform');
        });
        if (scene.canvas) {
          scene.canvas.style.removeProperty('opacity');
          scene.canvas.style.removeProperty('transform');
        }
        scene.section.removeAttribute('inert');
      });
      stage.removeAttribute('data-scene');
    };

    if (!scrub) {
      // 폴백 경로: 엔진을 아예 돌리지 않는다. 포스터 + 정적 카피가 그대로 보인다.
      resetInlineStyles();
      return () => {};
    }

    const onScroll = () => {
      yOffset = window.scrollY;
      requestDraw();
    };

    /*
     * 폭이 바뀐 진짜 리사이즈만 반영한다.
     * 모바일 주소창이 접히며 높이만 바뀌는 경우까지 재계산하면 화면이 튄다(강의 43169의 SPA 버전).
     */
    const onResize = () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      measure();
      requestDraw();
    };

    const onOrientationChange = () => {
      // 방향 전환 직후에는 크기가 아직 확정되지 않는다(강의 43717).
      window.setTimeout(() => {
        lastWidth = window.innerWidth;
        measure();
        requestDraw();
      }, 500);
    };

    blendImage.decoding = 'async';
    blendImage.addEventListener(
      'load',
      () => {
        blendImageReady = true;
        requestDraw();
      },
      { once: true },
    );
    blendImage.src = BLEND_IMAGE_SRC;

    measure();
    yOffset = window.scrollY;
    delayedYOffset = yOffset;

    // 새로고침 복원 위치에 맞는 씬을 먼저 잡는다(강의 41408).
    let accumulated = 0;
    for (let i = 0; i < scenes.length; i += 1) {
      accumulated += scenes[i].scrollHeight;
      if (accumulated >= yOffset) {
        currentScene = i;
        break;
      }
    }
    applySceneAttributes();
    // 히어로에서 시작해도 곧 나올 첫 도구 시퀀스를 미리 받아 둔다.
    ensureSequence(currentScene);
    chainNextSequence();

    prevScrollHeight = 0;
    for (let i = 0; i < currentScene; i += 1) prevScrollHeight += scenes[i].scrollHeight;
    playAnimation();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onOrientationChange);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onOrientationChange);
      resetInlineStyles();
    };
  }, [scrub, reducedMotion]);

  const toolScenes = chapters.slice(0, TOOL_SCENE_COUNT);
  /* 블렌딩 씬은 마지막 도구 화면에서 출발하므로 주소 표시줄도 거기서 시작한다. */
  const LAST_TOOL_HREF = toolScenes[toolScenes.length - 1]?.primary.href ?? '/menu';

  return (
    <div ref={stageRef} className="landing-stage">
      {/* ── 씬 0: 히어로 텍스트 연출 ─────────────────────────────── */}
      <section
        data-scene-index={0}
        aria-labelledby="landing-hero-title"
        className="landing-scene"
        style={{ '--landing-scene-height': 4 } as React.CSSProperties}
      >
        <div data-scene-sticky className="landing-scene-sticky">
          <div data-scene-wash aria-hidden className="landing-wash-top absolute inset-0 -z-10" />
          <div className={cn(LANDING_CONTAINER, 'relative z-10 text-center')}>
            <p className={LANDING_EYEBROW}>{hero.eyebrow}</p>
            <h1
              id="landing-hero-title"
              /* 16ch 는 320px 화면에서 가용 폭(280px)을 넘겨 제목이 가로로 삐져나갔다. */
              className="landing-rise-lcp mx-auto mt-6 max-w-[min(16ch,100%)] text-[clamp(2.6rem,7vw,5rem)] font-extrabold leading-[1.0] tracking-[-0.05em] text-fg-1"
            >
              <span className="block [word-break:keep-all]">{hero.titleLine1}</span>
              <span className="block bg-gradient-to-r from-point-2 via-point-3 to-info-2 bg-clip-text text-transparent [word-break:keep-all]">
                {hero.titleLine2}
              </span>
            </h1>

            {/*
              고정 높이 박스 + flex center. 문단이 1줄이든 3줄이든 정렬이 흔들리지 않는다(강의 41401).
              스크럽이 꺼진 경로에서는 세로로 쌓여 전부 읽힌다.
            */}
            <div className="landing-message-track mt-10">
              {[hero.statement, hero.capabilities, `${story.titleLine1} ${story.titleLine2}`].map(
                (message) => (
                  <p
                    key={message}
                    data-scene-message
                    className="landing-scene-message mx-auto max-w-[34ch] text-[clamp(1.05rem,2vw,1.5rem)] font-semibold leading-[1.45] tracking-[-0.03em] text-fg-3 [word-break:keep-all]"
                  >
                    {message}
                  </p>
                ),
              )}
            </div>

            <div className="mt-10">{heroActions}</div>
            <div className="mt-12">{heroStats}</div>
          </div>
        </div>
      </section>

      {/* ── 씬 1~3: 도구 풀스크린 시퀀스 ─────────────────────────── */}
      {toolScenes.map((chapter, index) => {
        const sequence = SHOWCASE_SEQUENCES[chapter.id];
        return (
          <section
            key={chapter.id}
            data-scene-index={index + 1}
            aria-labelledby={`landing-scene-${chapter.id}`}
            className="landing-scene"
            style={{ '--landing-scene-height': 5 } as React.CSSProperties}
          >
            <div data-scene-sticky className="landing-scene-sticky landing-scene-tool">
              <div aria-hidden className="landing-scene-bg" />

              {/* 카피와 제품 샷을 나란히 둔다 → 스크린샷 위에 글자를 얹지 않으므로 스크림이 필요 없다. */}
              <div className={cn(LANDING_WIDE_CONTAINER, 'landing-scene-split')}>
                <div>
                  <p className={LANDING_EYEBROW}>{chapter.copy.eyebrow}</p>
                  {/* 타이포 클래스는 각 요소에 직접 준다. 래퍼에 두면 본문이 제목의 음수 자간을 상속한다. */}
                  <div data-scene-message className="landing-scene-message mt-4">
                    <h2
                      id={`landing-scene-${chapter.id}`}
                      className="max-w-[16ch] text-[clamp(1.9rem,3.2vw,2.9rem)] font-extrabold leading-[1.08] tracking-[-0.045em] text-fg-1 [word-break:keep-all]"
                    >
                      <span className="block">{chapter.copy.titleLine1}</span>
                      <span className="block">{chapter.copy.titleLine2}</span>
                    </h2>
                    <p className="mt-5 max-w-[34ch] text-[15px] font-medium leading-[1.7] tracking-normal text-fg-3 [word-break:keep-all]">
                      {chapter.copy.body}
                    </p>
                  </div>

                  <div data-scene-cta className="landing-scene-message mt-7">
                    <NextLink
                      href={`/${lng}${chapter.primary.href}`}
                      onClick={() =>
                        sendGAEvent('tool_open', chapter.primary.href, {
                          from_section: `scene_${chapter.id}`,
                          entry_point: 'landing',
                        })
                      }
                      className={LANDING_CTA_PRIMARY}
                    >
                      {chapter.primary.label}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </NextLink>

                    {chapter.related.length > 0 ? (
                      <div className="mt-5">
                        <p className="text-[11px] font-semibold tracking-[0.04em] text-fg-5">
                          {story.related}
                        </p>
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {chapter.related.map((tool) => (
                            <NextLink
                              key={tool.href}
                              href={`/${lng}${tool.href}`}
                              className={LANDING_TOOL_PILL}
                              onClick={() =>
                                sendGAEvent('tool_open', tool.href, {
                                  from_section: `scene_${chapter.id}_related`,
                                  entry_point: 'landing',
                                })
                              }
                            >
                              {tool.label}
                              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                            </NextLink>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div data-scene-frame className="landing-scene-frame w-full">
                  <DeviceFrame
                    url={`${SITE_HOST}/${lng}${chapter.primary.href}`}
                    poster={sequence.poster}
                    alt={chapter.copy.sequenceAlt}
                    priority={index === 0}
                  />
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* ── 씬 4: 블렌딩(도구 화면 → 전체 도구 목록) ─────────────── */}
      <section
        data-scene-index={4}
        aria-labelledby="landing-blend-title"
        className="landing-scene"
        style={{ '--landing-scene-height': 4 } as React.CSSProperties}
      >
        <div data-scene-sticky className="landing-scene-sticky landing-scene-blend">
          <div aria-hidden className="landing-scene-bg" />

          <div
            className={cn(LANDING_WIDE_CONTAINER, 'landing-scene-split landing-scene-split-stack')}
          >
            <div data-scene-frame className="landing-scene-frame w-full">
              <DeviceFrame
                url={`${SITE_HOST}/${lng}/menu`}
                baseUrl={`${SITE_HOST}/${lng}${LAST_TOOL_HREF}`}
                poster={BLEND_IMAGE_SRC}
                alt={blendCaption.body}
              />
            </div>

            <div data-scene-message className="landing-scene-message w-full text-center">
              <h2
                id="landing-blend-title"
                className="mx-auto max-w-[20ch] text-[clamp(1.7rem,3.2vw,2.6rem)] font-extrabold leading-[1.1] tracking-[-0.045em] text-fg-1 [word-break:keep-all]"
              >
                {blendCaption.title}
              </h2>
              <p className="mx-auto mt-4 max-w-[46ch] text-[15px] leading-[1.7] text-fg-3 [word-break:keep-all]">
                {blendCaption.body}
              </p>
              <NextLink href={`/${lng}/menu`} className={cn(LANDING_CTA_SECONDARY, 'mt-6')}>
                {blendCaption.cta}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </NextLink>
            </div>
          </div>
        </div>
      </section>

      {/* ── 씬 5: 일반 스크롤 콘텐츠 ───────────────────────────── */}
      <section data-scene-index={5} className="landing-scene-normal">
        {children}
      </section>
    </div>
  );
}
