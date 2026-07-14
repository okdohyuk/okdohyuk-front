/**
 * GoogleAd 노출 결과 측정(ad_render_result) 회귀 테스트.
 *
 * push() 자체는 성공해도 이후 애드블로커의 코스메틱 필터 등으로 슬롯이
 * 비어버리는 케이스(FRONT-9)가 있어, "고치는" 대신 filled/empty 비율을
 * GA4로 관찰하기로 했다.
 *
 * 초기 구현은 push() 호출 시점부터 5초 타임아웃으로 결과를 기다렸는데,
 * adsbygoogle.js가 next/script의 lazyOnload로 늦게 로드되는 사이트라
 * 실제로는 광고가 정상 채워져도 스크립트 로드 자체가 5초를 넘겨 항상
 * empty로 오분류됐다(운영 데이터 141건 중 filled 0건). 그래서 관찰 시작
 * 시점을 push() 호출이 아니라 "스크립트 로드 완료" 시점으로 옮겼다.
 * 이 파일은 스크립트가 이미 로드된 경우 / 로드가 늦게 도착하는 경우 /
 * 끝까지 로드되지 않는 경우(네트워크 차단) 세 경로를 모두 검증한다.
 */
import React from 'react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { sendGAEvent } from '@libs/client/gtag';
import { markAdsenseScriptLoaded } from '@libs/client/adsenseScript';
import GoogleAd from '../GoogleAd';

vi.mock('@libs/client/gtag', () => ({
  sendGAEvent: vi.fn(),
}));

const sendGAEventMock = vi.mocked(sendGAEvent);

// 클래스 대신 생성자 함수 + 명시적 객체 반환으로 구현(new 호출 시 반환 객체가 사용됨).
function MockResizeObserver(callback: ResizeObserverCallback) {
  return {
    observe: () => callback([], {} as ResizeObserver),
    disconnect: () => {},
    unobserve: () => {},
  };
}

function MockIntersectionObserver(callback: IntersectionObserverCallback) {
  return {
    observe: (target: Element) =>
      callback(
        [{ isIntersecting: true, target } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      ),
    disconnect: () => {},
    unobserve: () => {},
  };
}

function getInsEl() {
  return document.querySelector('ins.adsbygoogle') as HTMLModElement;
}

describe('<GoogleAd />', () => {
  beforeEach(() => {
    sendGAEventMock.mockClear();
    window.adsbygoogle = [];
    // 테스트 간 스크립트 로드 상태 격리 (markAdsenseScriptLoaded는 window에 플래그를 남긴다).
    window.adsenseScriptLoaded = false;
    vi.stubGlobal('ResizeObserver', MockResizeObserver);
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    // jsdom의 offsetWidth는 항상 0이라 폭 가드(MIN_AD_WIDTH)를 통과시키기 위해 스텁한다.
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      value: 300,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('스크립트가 이미 로드돼 있으면 곧바로 관찰을 시작해 filled를 보낸다', async () => {
    markAdsenseScriptLoaded();
    render(<GoogleAd slotId="1234" />);
    const ins = getInsEl();
    ins.appendChild(document.createElement('iframe'));
    ins.setAttribute('data-adsbygoogle-status', 'done');

    await vi.waitFor(() => {
      expect(sendGAEventMock).toHaveBeenCalledWith('ad_render_result', 'filled', {
        slot_id: '1234',
      });
    });
  });

  it('스크립트 로드가 마운트 이후 도착해도 그 뒤 상태 변화를 관찰해 filled를 보낸다', async () => {
    render(<GoogleAd slotId="2222" />);
    // 아직 스크립트 로드 전 — push는 큐잉만 되고 관찰은 로드 이벤트를 기다리는 중이어야 한다.
    expect(sendGAEventMock).not.toHaveBeenCalled();

    markAdsenseScriptLoaded();
    const ins = getInsEl();
    ins.appendChild(document.createElement('iframe'));
    ins.setAttribute('data-adsbygoogle-status', 'done');

    await vi.waitFor(() => {
      expect(sendGAEventMock).toHaveBeenCalledWith('ad_render_result', 'filled', {
        slot_id: '2222',
      });
    });
  });

  it('상태는 done인데 iframe이 없으면 empty를 보낸다', async () => {
    markAdsenseScriptLoaded();
    render(<GoogleAd slotId="5678" />);
    const ins = getInsEl();
    ins.setAttribute('data-adsbygoogle-status', 'done');

    await vi.waitFor(() => {
      expect(sendGAEventMock).toHaveBeenCalledWith('ad_render_result', 'empty', {
        slot_id: '5678',
      });
    });
  });

  it('스크립트 로드 후 타임아웃까지 상태 갱신이 없으면 empty를 보낸다', () => {
    vi.useFakeTimers();
    markAdsenseScriptLoaded();
    render(<GoogleAd slotId="9999" />);

    vi.advanceTimersByTime(5000);

    expect(sendGAEventMock).toHaveBeenCalledWith('ad_render_result', 'empty', {
      slot_id: '9999',
    });
  });

  it('스크립트 자체가 끝내 로드되지 않으면(네트워크 차단 추정) empty를 보낸다', () => {
    vi.useFakeTimers();
    render(<GoogleAd slotId="3333" />);

    vi.advanceTimersByTime(8000);

    expect(sendGAEventMock).toHaveBeenCalledWith('ad_render_result', 'empty', {
      slot_id: '3333',
    });
  });

  it('결과가 확정된 후에는 추가로 이벤트를 보내지 않는다', async () => {
    markAdsenseScriptLoaded();
    render(<GoogleAd slotId="1111" />);
    const ins = getInsEl();
    ins.appendChild(document.createElement('iframe'));
    ins.setAttribute('data-adsbygoogle-status', 'done');

    await vi.waitFor(() => {
      expect(sendGAEventMock).toHaveBeenCalledTimes(1);
    });

    ins.setAttribute('data-adsbygoogle-status', 'done');
    ins.removeChild(ins.firstChild as ChildNode);
    await Promise.resolve();

    expect(sendGAEventMock).toHaveBeenCalledTimes(1);
  });
});
