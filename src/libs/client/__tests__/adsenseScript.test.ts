/**
 * adsenseScript 유틸 회귀 테스트.
 *
 * markAdsenseScriptLoaded가 플래그를 세우고 이벤트를 발화하는지,
 * isAdsenseScriptLoaded가 그 플래그를 정확히 반영하는지 검증한다.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  ADSENSE_SCRIPT_LOADED_EVENT,
  isAdsenseScriptLoaded,
  markAdsenseScriptLoaded,
} from '../adsenseScript';

describe('adsenseScript', () => {
  beforeEach(() => {
    window.adsenseScriptLoaded = false;
  });

  it('초기 상태는 로드되지 않은 것으로 본다', () => {
    expect(isAdsenseScriptLoaded()).toBe(false);
  });

  it('markAdsenseScriptLoaded 호출 후 isAdsenseScriptLoaded가 true를 반환한다', () => {
    markAdsenseScriptLoaded();
    expect(isAdsenseScriptLoaded()).toBe(true);
  });

  it('markAdsenseScriptLoaded는 ADSENSE_SCRIPT_LOADED_EVENT를 발화한다', () => {
    const listener = vi.fn();
    window.addEventListener(ADSENSE_SCRIPT_LOADED_EVENT, listener);

    markAdsenseScriptLoaded();

    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(ADSENSE_SCRIPT_LOADED_EVENT, listener);
  });
});
