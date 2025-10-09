import { vi } from 'vitest';
import Cookies from 'js-cookie';
import UserTokenUtil from '../userTokenUtil';

// js-cookie 모의
vi.mock('js-cookie');
const mockedCookies = vi.mocked(Cookies, true);

describe('UserTokenUtil', () => {
  const mockAccessToken = 'mock-access-token';
  const mockRefreshToken = 'mock-refresh-token';

  beforeAll(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    // 각 테스트 전에 쿠키 모의 초기화
    mockedCookies.get.mockClear();
    mockedCookies.set.mockClear();
    mockedCookies.remove.mockClear();
  });

  describe('getAccessToken', () => {
    it('access_token 쿠키가 있으면 "Bearer " 접두사와 함께 토큰을 반환해야 합니다', () => {
      mockedCookies.get.mockReturnValue(mockAccessToken);
      expect(UserTokenUtil.getAccessToken()).toBe(`Bearer ${mockAccessToken}`);
    });

    it('access_token 쿠키가 없으면 빈 문자열을 반환해야 합니다', () => {
      mockedCookies.get.mockReturnValue(undefined);
      expect(UserTokenUtil.getAccessToken()).toBe('');
    });
  });

  describe('setAccessToken', () => {
    it('Cookies.set을 올바른 인자로 호출해야 합니다', () => {
      UserTokenUtil.setAccessToken(mockAccessToken);
      expect(Cookies.set).toHaveBeenCalledWith(
        'access_token',
        mockAccessToken,
        expect.objectContaining({ sameSite: 'strict' }),
      );
    });
  });

  describe('removeAccessToken', () => {
    it('Cookies.remove를 올바른 인자로 호출해야 합니다', () => {
      UserTokenUtil.removeAccessToken();
      expect(Cookies.remove).toHaveBeenCalledWith('access_token');
    });
  });

  describe('getRefreshToken', () => {
    it('refresh_token 쿠키가 있으면 해당 토큰을 반환해야 합니다', () => {
      mockedCookies.get.mockReturnValue(mockRefreshToken);
      expect(UserTokenUtil.getRefreshToken()).toBe(mockRefreshToken);
    });

    it('refresh_token 쿠키가 없으면 빈 문자열을 반환해야 합니다', () => {
      mockedCookies.get.mockReturnValue(undefined);
      expect(UserTokenUtil.getRefreshToken()).toBe('');
    });
  });

  describe('setRefreshToken', () => {
    it('Cookies.set을 올바른 인자로 호출해야 합니다', () => {
      UserTokenUtil.setRefreshToken(mockRefreshToken);
      expect(Cookies.set).toHaveBeenCalledWith(
        'refresh_token',
        mockRefreshToken,
        expect.objectContaining({ sameSite: 'strict' }),
      );
    });
  });

  describe('removeRefreshToken', () => {
    it('Cookies.remove를 올바른 인자로 호출해야 합니다', () => {
      UserTokenUtil.removeRefreshToken();
      expect(Cookies.remove).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('getTokenBearer', () => {
    it('주어진 토큰에 "Bearer " 접두사를 붙여 반환해야 합니다', () => {
      const token = 'some-random-token';
      expect(UserTokenUtil.getTokenBearer(token)).toBe(`Bearer ${token}`);
    });

    it('빈 토큰 문자열에도 "Bearer " 접두사를 붙여 반환해야 합니다', () => {
      expect(UserTokenUtil.getTokenBearer('')).toBe('Bearer ');
    });
  });
});
