import { describe, expect, it, vi } from 'vitest';
import { isAdEligiblePath } from '../adPolicy';

vi.mock('@next/third-parties/google', () => ({
  sendGAEvent: vi.fn(),
}));

describe('isAdEligiblePath', () => {
  it('도구와 solve 결과 경로를 광고 허용 대상으로 분류한다', () => {
    expect(isAdEligiblePath('/ko/pokemon-type-calculator')).toBe(true);
    expect(isAdEligiblePath('/ja/solve/subject')).toBe(true);
  });

  it('기능 실행 전 공용·민감 경로를 광고 제외 대상으로 분류한다', () => {
    expect(isAdEligiblePath('/ko')).toBe(false);
    expect(isAdEligiblePath('/ko/auth/login')).toBe(false);
    expect(isAdEligiblePath('/ko/privacy')).toBe(false);
    expect(isAdEligiblePath('/ko/multi-live')).toBe(false);
    expect(isAdEligiblePath('/ko/menu')).toBe(false);
    expect(isAdEligiblePath('/ko/admin/blog')).toBe(false);
  });
});
