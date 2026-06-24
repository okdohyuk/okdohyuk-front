/**
 * sendGAEvent 회귀 테스트.
 *
 * 막으려는 버그: 공통 전송 유틸 sendGAEvent 가 @next/third-parties/google 의
 * sendGAEvent(별칭 sE) 를 잘못된 시그니처로 호출(sE(object) 단일 객체)하여
 * gtag.js 가 GTM 식 객체로 보고 모든 커스텀 이벤트를 무시했던 문제.
 *
 * 현재(수정 후) 코드는 sE('event', '<이름>', { ...params }) 형태로 호출해야 하며
 * params 에는 custom_session_id(과거 session_id 였던 키), page_group, lng, value,
 * id, 그리고 호출 시 넘긴 extraParams 가 포함되어야 한다.
 * admin 라우트(page_group === 'admin')는 전송하지 않는다.
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { sendGAEvent as sE } from '@next/third-parties/google';

import Cookies from 'js-cookie';
import { sendGAEvent } from '../gtag';

// @next/third-parties/google 의 sendGAEvent 모킹 — 실제 dataLayer push 를 막고 호출 인자만 캡처.
vi.mock('@next/third-parties/google', () => ({
  sendGAEvent: vi.fn(),
}));

// js-cookie 모킹 — SessionId / access_token 반환 제어.
vi.mock('js-cookie', () => ({
  default: {
    get: vi.fn(),
  },
}));

// jwtUtils 모킹 — access_token 이 없을 땐 호출되지 않으나, 시그니처 고정을 위해 모킹.
vi.mock('@utils/jwtUtils', () => ({
  default: {
    getPayload: vi.fn(),
  },
}));

const seMock = vi.mocked(sE);
const cookiesGetMock = Cookies.get as unknown as ReturnType<typeof vi.fn>;

const MOCK_SESSION_ID = 'sess-abc-123';
const TOOL_PATH = '/ko/coin-flip';
const ADMIN_PATH = '/ko/admin/x';

/** window.location.pathname 을 원하는 경로로 스텁한다. */
function stubPathname(pathname: string) {
  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: { ...window.location, pathname },
  });
}

beforeEach(() => {
  // access_token 없음 → SessionId 경로 사용. SessionId 는 모킹 값 반환.
  cookiesGetMock.mockImplementation((key: string) => {
    if (key === 'access_token') return undefined;
    if (key === 'SessionId') return MOCK_SESSION_ID;
    return undefined;
  });
  stubPathname(TOOL_PATH);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('sendGAEvent', () => {
  describe('시그니처 정확성 (핵심 회귀)', () => {
    it("sE 를 정확히 1회, ('event', '<이름>', params) 3개 인자로 호출한다", () => {
      sendGAEvent('tool_use', 'coin-flip', {
        tool_id: 'coin-flip',
        tool_category: 'generator',
        action_type: 'flip',
      });

      // 단일 객체 인자(과거 버그) 형태면 여기서 실패한다.
      expect(seMock).toHaveBeenCalledTimes(1);

      const args = seMock.mock.calls[0];
      expect(args).toHaveLength(3);
      expect(args[0]).toBe('event');
      expect(args[1]).toBe('tool_use');
      expect(typeof args[2]).toBe('object');
      expect(args[2]).not.toBeNull();
    });

    it('과거 버그(첫 인자가 객체)를 회귀로 잡는다', () => {
      sendGAEvent('tool_use', 'coin-flip');

      const firstArg = seMock.mock.calls[0][0];
      // 버그 시절엔 firstArg 가 payload 객체였다. 반드시 'event' 문자열이어야 한다.
      expect(firstArg).not.toBeTypeOf('object');
      expect(firstArg).toBe('event');
    });
  });

  describe('파라미터명 일치', () => {
    it('custom_session_id 가 SessionId 값과 같고 session_id 키는 존재하지 않는다', () => {
      sendGAEvent('tool_use', 'coin-flip');

      const params = seMock.mock.calls[0][2] as Record<string, unknown>;

      expect(params.custom_session_id).toBe(MOCK_SESSION_ID);
      // 과거 키였던 session_id 는 더 이상 존재하면 안 된다.
      expect('session_id' in params).toBe(false);
    });

    it('extraParams 와 기본 params(page_group/lng/value)가 모두 포함된다', () => {
      sendGAEvent('tool_use', 'coin-flip', {
        tool_id: 'coin-flip',
        tool_category: 'generator',
        action_type: 'flip',
      });

      const params = seMock.mock.calls[0][2] as Record<string, unknown>;

      // extraParams
      expect(params.tool_id).toBe('coin-flip');
      expect(params.tool_category).toBe('generator');
      expect(params.action_type).toBe('flip');

      // 기본 params
      expect(params.page_group).toBe('tool'); // /ko/coin-flip → tool
      expect(params.lng).toBe('ko');
      expect(params.value).toBe('coin-flip');
      // 명세상 포함되어야 하는 id / pathname 도 함께 확인.
      expect(params).toHaveProperty('id');
      expect(params.pathname).toBe(TOOL_PATH);
    });

    it('access_token 이 없으면 id 는 SessionId 로 채워진다', () => {
      sendGAEvent('tool_use', 'coin-flip');

      const params = seMock.mock.calls[0][2] as Record<string, unknown>;
      expect(params.id).toBe(MOCK_SESSION_ID);
    });
  });

  describe('admin 제외', () => {
    it("page_group === 'admin' 이면 sE 를 호출하지 않는다", () => {
      stubPathname(ADMIN_PATH);

      sendGAEvent('tool_use', 'coin-flip', { tool_id: 'coin-flip' });

      expect(seMock).not.toHaveBeenCalled();
    });
  });

  describe('SSR 가드', () => {
    it('window 가 없으면 throw 없이 no-op 한다', () => {
      // gtag.ts 는 호출 시점에 typeof window 를 평가하므로, 일시적으로 window 를 제거한다.
      const originalWindow = globalThis.window;
      // @ts-expect-error 테스트를 위해 의도적으로 window 제거 (SSR 환경 모사)
      delete globalThis.window;

      try {
        expect(() => sendGAEvent('tool_use', 'coin-flip')).not.toThrow();
        expect(seMock).not.toHaveBeenCalled();
      } finally {
        globalThis.window = originalWindow;
      }
    });
  });
});
