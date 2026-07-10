/**
 * GoogleAd 노출 결과 측정(ad_render_result) 회귀 테스트.
 *
 * push() 자체는 성공해도 이후 애드블로커의 코스메틱 필터 등으로 슬롯이
 * 비어버리는 케이스(FRONT-9)가 있어, "고치는" 대신 filled/empty 비율을
 * GA4로 관찰하기로 했다. data-adsbygoogle-status 변화 관찰과 타임아웃
 * fallback이 각 케이스에서 올바른 값을 보내는지 검증한다.
 */
import React from 'react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { sendGAEvent } from '@libs/client/gtag';
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

  it('슬롯에 iframe이 채워지면 filled를 보낸다', async () => {
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

  it('상태는 done인데 iframe이 없으면 empty를 보낸다', async () => {
    render(<GoogleAd slotId="5678" />);
    const ins = getInsEl();
    ins.setAttribute('data-adsbygoogle-status', 'done');

    await vi.waitFor(() => {
      expect(sendGAEventMock).toHaveBeenCalledWith('ad_render_result', 'empty', {
        slot_id: '5678',
      });
    });
  });

  it('타임아웃까지 상태 갱신이 없으면(차단 추정) empty를 보낸다', () => {
    vi.useFakeTimers();
    render(<GoogleAd slotId="9999" />);

    vi.advanceTimersByTime(5000);

    expect(sendGAEventMock).toHaveBeenCalledWith('ad_render_result', 'empty', {
      slot_id: '9999',
    });
  });

  it('결과가 확정된 후에는 추가로 이벤트를 보내지 않는다', async () => {
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
