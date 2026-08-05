/*
 * FrameStore 는 "스크롤 루프가 매 프레임 읽는 가변 저장소"다.
 * 불변 갱신으로 바꾸면 프레임마다 배열을 새로 만들게 되어 목적에 반한다.
 */
/* eslint-disable no-param-reassign */
import type { LandingSequenceSpec } from '@assets/datas/landingSequences';

/**
 * 캔버스 시퀀스 프레임 로더 — 강의 보너스 유닛 「캔버스 이미지 부분 로딩」(74372) 이식.
 *
 * 3개 도구 × 90프레임을 한꺼번에 받으면 첫 화면이 늦다.
 * 그래서 (1) 지금 보이는 씬의 시퀀스를 먼저 받고, (2) 그게 끝나면 유휴 시간에 나머지를 잇는다.
 *
 * 강의는 로드 완료 순서가 파일 번호와 달라 `sortImages()` 로 정렬해야 했지만,
 * 여기서는 인덱스 위치에 미리 넣어두므로(`images[i] = img`) 정렬이 필요 없다.
 */

export type FrameStore = {
  images: HTMLImageElement[];
  /** 로드를 시작했는가(중복 시작 방지) */
  started: boolean;
  /** 전부 정착(load 또는 error)했는가 */
  finished: boolean;
  loadedCount: number;
};

export const createFrameStore = (): FrameStore => ({
  images: [],
  started: false,
  finished: false,
  loadedCount: 0,
});

/**
 * 목표 프레임이 아직 안 왔으면 가장 가까운 "이미 로드된" 프레임을 쓴다.
 * 순차 로딩 중에도 캔버스가 비지 않게 해주는 시퀀스 재생의 핵심 트릭.
 */
export function nearestLoadedFrame(
  images: HTMLImageElement[],
  targetIndex: number,
): HTMLImageElement | null {
  const target = images[targetIndex];
  if (target?.complete && target.naturalWidth) return target;

  for (let distance = 1; distance < images.length; distance += 1) {
    const before = images[targetIndex - distance];
    if (before?.complete && before.naturalWidth) return before;
    const after = images[targetIndex + distance];
    if (after?.complete && after.naturalWidth) return after;
  }
  return null;
}

const frameSrc = (framePath: string, index: number) =>
  framePath.replace('{frame}', String(index + 1).padStart(3, '0'));

/**
 * 한 시퀀스를 통째로 받기 시작한다. 이미 시작했다면 아무 것도 하지 않는다.
 * `onSettled` 는 프레임이 하나 정착할 때마다 호출된다(캔버스 다시 그리기 트리거).
 */
export function startLoading(
  store: FrameStore,
  spec: LandingSequenceSpec,
  onSettled: () => void,
): void {
  if (store.started) return;
  store.started = true;
  store.images = new Array<HTMLImageElement>(spec.frameCount);

  for (let index = 0; index < spec.frameCount; index += 1) {
    const image = new Image();
    image.decoding = 'async';

    const settle = () => {
      store.loadedCount += 1;
      if (store.loadedCount >= spec.frameCount) store.finished = true;
      onSettled();
    };
    // 404 로 멈추지 않도록 error 도 "정착"으로 센다. nearestLoadedFrame 이 빈자리를 메운다.
    image.addEventListener('load', settle, { once: true });
    image.addEventListener('error', settle, { once: true });

    image.src = frameSrc(spec.framePath, index);
    store.images[index] = image;
  }
}

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
};

/** 유휴 시간(없으면 짧은 타이머)에 실행. 첫 화면 그리기를 방해하지 않기 위함. */
export function whenIdle(callback: () => void, timeout = 1200): () => void {
  if (typeof window === 'undefined') return () => {};

  const idleWindow = window as IdleWindow;
  if (typeof idleWindow.requestIdleCallback === 'function') {
    idleWindow.requestIdleCallback(callback, { timeout });
    // requestIdleCallback 취소는 필수적이지 않다(콜백이 멱등하고 가볍다).
    return () => {};
  }

  const timer = window.setTimeout(callback, 200);
  return () => window.clearTimeout(timer);
}
