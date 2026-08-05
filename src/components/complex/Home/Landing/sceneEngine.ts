/**
 * 애플 제품 페이지식 스크롤 씬 엔진 — 인프런 「애플 웹사이트 인터랙션 클론!」(1분코딩) 원리 이식.
 *
 * 원리 요약
 * - 씬 = 스크롤 타임라인 한 구간. `sticky` 는 높이를 `heightNum × innerHeight` 로 강제하고,
 *   `normal` 은 콘텐츠 실제 높이를 그대로 쓴다.
 * - 스크롤 위치 → 이전 씬 높이 누적(prevScrollHeight) → 현재 씬 안에서의 비율(scrollRatio)
 *   → `calcValues` 키프레임 보간 → DOM 스타일 직접 반영.
 * - 화면에 보이는 씬 하나만 계산한다(퍼포먼스의 근간).
 *
 * React 이식 시 원 강의와 달리한 점은 `landingScenes.ts` / `LandingSceneStage.tsx` 주석 참조.
 */

/** `[시작값, 끝값]` 또는 `[시작값, 끝값, { start, end }]` (start/end 는 씬 높이를 1로 본 비율) */
export type SceneValue = [number, number] | [number, number, { start: number; end: number }];

export type SceneTiming = { start: number; end: number };

/**
 * 씬 비율(0~1) 기준 키프레임 보간.
 *
 * 강의 `calcValues` 그대로다.
 * - 3번째 인자가 없으면 씬 전 구간 선형 매핑
 * - 있으면 해당 구간에서만 변화하고, 구간 전후는 시작/끝값으로 고정(clamp)
 *
 * `value = ratio × (end - start) + start`
 */
export function calcValue(value: SceneValue, currentYOffset: number, scrollHeight: number): number {
  const [from, to] = value;

  if (value.length === 3) {
    const timing = value[2];
    const partStart = timing.start * scrollHeight;
    const partEnd = timing.end * scrollHeight;
    const partHeight = partEnd - partStart;

    if (partHeight <= 0) return to;
    if (currentYOffset < partStart) return from;
    if (currentYOffset > partEnd) return to;
    return ((currentYOffset - partStart) / partHeight) * (to - from) + from;
  }

  if (scrollHeight <= 0) return from;
  /*
   * 비율을 0~1 로 가둔다.
   * 강의는 `position: fixed` 라 씬 안에서 비율이 1을 넘지 않지만, 우리는 `position: sticky` 라
   * 마지막 1vh(고정이 풀리는 구간)에서 비율이 1을 넘는다. 가두지 않으면 이미지 시퀀스 인덱스가
   * 프레임 수를 초과해 버린다.
   */
  const ratio = Math.min(1, Math.max(0, currentYOffset / scrollHeight));
  return ratio * (to - from) + from;
}

/**
 * 메시지 in/out 한 쌍을 하나의 값으로 합친다.
 *
 * 같은 요소에 등장/퇴장 두 벌을 각각 적용하면 서로 덮어쓰므로,
 * 강의처럼 `scrollRatio` 기준으로 **둘 중 하나만** 계산한다(연산량도 절반).
 */
export function calcInOut(
  inValue: SceneValue,
  outValue: SceneValue,
  splitRatio: number,
  currentYOffset: number,
  scrollHeight: number,
): number {
  const scrollRatio = scrollHeight > 0 ? currentYOffset / scrollHeight : 0;
  return scrollRatio <= splitRatio
    ? calcValue(inValue, currentYOffset, scrollHeight)
    : calcValue(outValue, currentYOffset, scrollHeight);
}

/**
 * 씬 **진입** 알파 — 씬 비율이 아니라 "미끄러진 거리"로 계산한다.
 *
 * `position: sticky` 구조에서 다음 씬은 앞 씬의 마지막 1vh 동안 화면 아래에서 올라온다.
 * 그 구간에서 다음 씬의 자체 offset 은 아직 음수라, 진입 연출을 비율(`calcValue`)로 잡으면
 * **올라오는 내내 시작값(=0)** 에 고정돼 앞 씬과의 사이가 통째로 빈다.
 *
 * @param offset      씬 시작점 기준 스크롤. 음수면 아직 아래에서 올라오는 중이다.
 * @param slideHeight 미끄러지는 거리(= 뷰포트 높이)
 * @param span        `slideHeight` 중 페이드에 쓸 비율. 1 보다 작아야 **고정 시점 이전에** 1 이 된다.
 */
export function enterAlpha(offset: number, slideHeight: number, span: number): number {
  const fadeDistance = Math.max(1, slideHeight * span);
  return Math.min(1, Math.max(0, (offset + slideHeight) / fadeDistance));
}

/** 등장(in) / 퇴장(out) 타이밍 한 세트 + 분기점 */
export type MessageTiming = {
  in: SceneTiming;
  out: SceneTiming;
  /** in/out 분기 scrollRatio. 보통 in.end 와 out.start 사이 */
  split: number;
};

/** 메시지 등장/퇴장 기본 이동량(%) — 강의의 20% 를 그대로 쓴다. */
export const MESSAGE_TRANSLATE_PERCENT = 20;

/** `MessageTiming` 에서 opacity/translateY 값 4벌을 만들어 준다(선언 반복 제거). */
export function messageValues(timing: MessageTiming) {
  return {
    opacityIn: [0, 1, timing.in] as SceneValue,
    opacityOut: [1, 0, timing.out] as SceneValue,
    translateIn: [MESSAGE_TRANSLATE_PERCENT, 0, timing.in] as SceneValue,
    translateOut: [0, -MESSAGE_TRANSLATE_PERCENT, timing.out] as SceneValue,
    split: timing.split,
  };
}

export type MessageValues = ReturnType<typeof messageValues>;
