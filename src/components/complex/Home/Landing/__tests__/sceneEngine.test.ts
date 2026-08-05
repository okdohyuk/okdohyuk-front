/**
 * sceneEngine: 스크롤 씬 키프레임 보간 단위 테스트.
 *
 * 회귀 방지 핵심
 * - `position: sticky` 구조에서는 씬 비율이 1을 넘을 수 있다. 가두지 않으면
 *   이미지 시퀀스 인덱스가 프레임 수를 초과한다.
 * - 부분 구간(키프레임)은 구간 전후에서 시작/끝값으로 고정되어야 한다.
 * - in/out 은 분기점 기준으로 **둘 중 하나만** 계산해야 서로 덮어쓰지 않는다.
 * - 씬 진입은 비율이 아니라 "미끄러진 거리"로 계산해야 씬 사이가 비지 않는다.
 */
import { describe, it, expect } from 'vitest';
import { calcValue, calcInOut, enterAlpha, messageValues, type SceneValue } from '../sceneEngine';

const SCENE_HEIGHT = 1000;

describe('calcValue — 전 구간 선형', () => {
  it('시작/중간/끝을 선형 보간한다', () => {
    const value: SceneValue = [0, 100];
    expect(calcValue(value, 0, SCENE_HEIGHT)).toBe(0);
    expect(calcValue(value, 500, SCENE_HEIGHT)).toBe(50);
    expect(calcValue(value, 1000, SCENE_HEIGHT)).toBe(100);
  });

  it('비율이 1을 넘어도 끝값을 넘지 않는다 (sticky 해제 구간 방어)', () => {
    expect(calcValue([0, 89], 1800, SCENE_HEIGHT)).toBe(89);
  });

  it('음수 스크롤(모바일 바운스)에서도 시작값 아래로 내려가지 않는다', () => {
    expect(calcValue([0, 89], -400, SCENE_HEIGHT)).toBe(0);
  });

  it('높이가 0이면 시작값을 돌려준다', () => {
    expect(calcValue([7, 42], 100, 0)).toBe(7);
  });
});

describe('calcValue — 부분 구간(키프레임)', () => {
  const value: SceneValue = [0, 1, { start: 0.2, end: 0.4 }];

  it('구간 이전에는 시작값으로 고정', () => {
    expect(calcValue(value, 0, SCENE_HEIGHT)).toBe(0);
    expect(calcValue(value, 199, SCENE_HEIGHT)).toBe(0);
  });

  it('구간 안에서 선형 보간', () => {
    expect(calcValue(value, 300, SCENE_HEIGHT)).toBeCloseTo(0.5);
  });

  it('구간 이후에는 끝값으로 고정', () => {
    expect(calcValue(value, 401, SCENE_HEIGHT)).toBe(1);
    expect(calcValue(value, 5000, SCENE_HEIGHT)).toBe(1);
  });

  it('start === end 인 잘못된 구간에서도 NaN 을 만들지 않는다', () => {
    expect(calcValue([0, 1, { start: 0.3, end: 0.3 }], 300, SCENE_HEIGHT)).toBe(1);
  });
});

describe('calcInOut', () => {
  const { opacityIn, opacityOut, split } = messageValues({
    in: { start: 0.1, end: 0.2 },
    out: { start: 0.25, end: 0.3 },
    split: 0.22,
  });

  it('분기점 이전에는 in 값만 계산한다', () => {
    expect(calcInOut(opacityIn, opacityOut, split, 150, SCENE_HEIGHT)).toBeCloseTo(0.5);
  });

  it('분기점 이후에는 out 값만 계산한다', () => {
    // out 구간(0.25~0.3)의 중간 → 0.5
    expect(calcInOut(opacityIn, opacityOut, split, 275, SCENE_HEIGHT)).toBeCloseTo(0.5);
  });

  it('분기점 직전/직후가 모두 최댓값이라 튀지 않는다', () => {
    expect(calcInOut(opacityIn, opacityOut, split, 219, SCENE_HEIGHT)).toBe(1);
    expect(calcInOut(opacityIn, opacityOut, split, 221, SCENE_HEIGHT)).toBe(1);
  });
});

describe('enterAlpha — 씬 사이 공백 방어', () => {
  const SLIDE = 900; // 뷰포트 높이 = sticky 가 풀려 미끄러지는 거리
  const SPAN = 0.72;

  it('화면 아래에 완전히 숨어 있을 때는 0', () => {
    expect(enterAlpha(-SLIDE, SLIDE, SPAN)).toBe(0);
    expect(enterAlpha(-SLIDE * 2, SLIDE, SPAN)).toBe(0);
  });

  it('올라오는 도중에 서서히 차오른다', () => {
    expect(enterAlpha(-SLIDE * 0.8, SLIDE, SPAN)).toBeGreaterThan(0);
    expect(enterAlpha(-SLIDE * 0.5, SLIDE, SPAN)).toBeGreaterThan(
      enterAlpha(-SLIDE * 0.8, SLIDE, SPAN),
    );
  });

  it('sticky 로 고정되기 전에 이미 완전히 불투명하다 (핵심 회귀 방어)', () => {
    // span < 1 이므로 offset 이 0 에 닿기 전에 1 이 되어야 한다.
    expect(enterAlpha(-SLIDE * 0.2, SLIDE, SPAN)).toBe(1);
    expect(enterAlpha(0, SLIDE, SPAN)).toBe(1);
  });

  it('고정 구간과 퇴장 구간 내내 1 을 유지한다 (퇴장은 sticky 해제가 담당)', () => {
    expect(enterAlpha(1800, SLIDE, SPAN)).toBe(1);
    expect(enterAlpha(99999, SLIDE, SPAN)).toBe(1);
  });

  it('slideHeight 가 0 이어도 NaN/Infinity 를 만들지 않는다', () => {
    expect(Number.isFinite(enterAlpha(0, 0, SPAN))).toBe(true);
  });
});

describe('messageValues', () => {
  it('등장은 아래에서 위로, 퇴장은 위로 빠진다', () => {
    const values = messageValues({
      in: { start: 0.1, end: 0.2 },
      out: { start: 0.25, end: 0.3 },
      split: 0.22,
    });
    expect(values.translateIn[0]).toBeGreaterThan(0);
    expect(values.translateIn[1]).toBe(0);
    expect(values.translateOut[0]).toBe(0);
    expect(values.translateOut[1]).toBeLessThan(0);
  });
});
