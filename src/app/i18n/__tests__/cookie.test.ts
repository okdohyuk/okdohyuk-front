import { beforeEach, describe, expect, it } from 'vitest';
import Cookies from 'js-cookie';
import { cookieName } from '../settings';
import { getLanguageCookie, setLanguageCookie } from '../cookie';

describe('i18n cookie', () => {
  beforeEach(() => {
    Cookies.remove(cookieName);
  });

  it('언어 cookie를 저장하고 다시 읽는다', () => {
    setLanguageCookie('ja');

    expect(getLanguageCookie()).toBe('ja');
  });

  it('브라우저 cookieStore API 없이도 언어 cookie를 처리한다', () => {
    Object.defineProperty(window, 'cookieStore', {
      configurable: true,
      value: null,
    });

    expect(() => setLanguageCookie('zh')).not.toThrow();
    expect(getLanguageCookie()).toBe('zh');
  });
});
