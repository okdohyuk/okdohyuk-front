import { vi } from 'vitest';
import Cookies from 'js-cookie';
import {
  sanitizeRedirectUri,
  rememberLoginRedirect,
  getLoginRedirect,
  clearLoginRedirect,
  buildLoginUrl,
} from '../loginRedirect';

// js-cookie 모의
vi.mock('js-cookie');
const mockedCookies = vi.mocked(Cookies, true);

describe('loginRedirect', () => {
  beforeEach(() => {
    mockedCookies.get.mockClear();
    mockedCookies.set.mockClear();
    mockedCookies.remove.mockClear();
  });

  describe('sanitizeRedirectUri', () => {
    it('내부 절대 경로는 그대로 반환해야 합니다', () => {
      expect(sanitizeRedirectUri('/ko/shortener/me')).toBe('/ko/shortener/me');
      expect(sanitizeRedirectUri('/ko/blog/some-post?tab=reply')).toBe(
        '/ko/blog/some-post?tab=reply',
      );
    });

    it('비어있거나 없는 값은 null을 반환해야 합니다', () => {
      expect(sanitizeRedirectUri(undefined)).toBeNull();
      expect(sanitizeRedirectUri(null)).toBeNull();
      expect(sanitizeRedirectUri('')).toBeNull();
    });

    it('외부 URL과 프로토콜 상대 URL은 차단해야 합니다 (open redirect 방지)', () => {
      expect(sanitizeRedirectUri('https://evil.com')).toBeNull();
      expect(sanitizeRedirectUri('//evil.com')).toBeNull();
      // no-script-url 룰 회피를 위해 동적으로 조립 (실제 검증 대상은 스킴 자체)
      expect(sanitizeRedirectUri(`javascript${':'}alert(1)`)).toBeNull();
    });

    it('로그인 페이지 자신으로의 복귀는 제외해야 합니다', () => {
      expect(sanitizeRedirectUri('/ko/auth/login')).toBeNull();
      expect(sanitizeRedirectUri('/auth/login')).toBeNull();
    });
  });

  describe('rememberLoginRedirect', () => {
    it('유효한 경로면 redirect_uri 쿠키를 설정해야 합니다', () => {
      rememberLoginRedirect('/ko/menu');
      expect(Cookies.set).toHaveBeenCalledWith('redirect_uri', '/ko/menu');
    });

    it('유효하지 않은 경로면 쿠키를 설정하지 않아야 합니다', () => {
      rememberLoginRedirect('https://evil.com');
      rememberLoginRedirect(null);
      expect(Cookies.set).not.toHaveBeenCalled();
    });
  });

  describe('getLoginRedirect', () => {
    it('쿠키에 저장된 유효한 경로를 반환해야 합니다', () => {
      mockedCookies.get.mockReturnValue('/ko/menu' as unknown as { [key: string]: string });
      expect(getLoginRedirect()).toBe('/ko/menu');
    });

    it('쿠키가 없거나 유효하지 않으면 null을 반환해야 합니다', () => {
      mockedCookies.get.mockReturnValue(undefined as unknown as { [key: string]: string });
      expect(getLoginRedirect()).toBeNull();

      mockedCookies.get.mockReturnValue('//evil.com' as unknown as { [key: string]: string });
      expect(getLoginRedirect()).toBeNull();
    });
  });

  describe('clearLoginRedirect', () => {
    it('redirect_uri 쿠키를 제거해야 합니다', () => {
      clearLoginRedirect();
      expect(Cookies.remove).toHaveBeenCalledWith('redirect_uri');
    });
  });

  describe('buildLoginUrl', () => {
    it('복귀 경로를 인코딩해 쿼리로 담은 로그인 URL을 만들어야 합니다', () => {
      expect(buildLoginUrl('/ko/auth/login', '/ko/shortener/me')).toBe(
        '/ko/auth/login?redirect_uri=%2Fko%2Fshortener%2Fme',
      );
    });
  });
});
