import Cookies from 'js-cookie';
import UserTokenUtil from '../userTokenUtil';

// js-cookie 모의
jest.mock('js-cookie');

// localStorage 모의
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('UserTokenUtil', () => {
  const mockAccessToken = 'mock-access-token';
  const mockRefreshToken = 'mock-refresh-token';

  beforeEach(() => {
    // 각 테스트 전에 쿠키와 로컬 스토리지 모의 초기화
    (Cookies.get as jest.Mock).mockClear();
    (Cookies.set as jest.Mock).mockClear();
    (Cookies.remove as jest.Mock).mockClear();
    localStorageMock.clear();
  });

  describe('getAccessToken', () => {
    it('access_token 쿠키가 있으면 "Bearer " 접두사와 함께 토큰을 반환해야 합니다', () => {
      (Cookies.get as jest.Mock).mockReturnValue(mockAccessToken);
      expect(UserTokenUtil.getAccessToken()).toBe(`Bearer ${mockAccessToken}`);
    });

    it('access_token 쿠키가 없으면 빈 문자열을 반환해야 합니다', () => {
      (Cookies.get as jest.Mock).mockReturnValue(undefined);
      expect(UserTokenUtil.getAccessToken()).toBe('');
    });
  });

  describe('setAccessToken', () => {
    it('Cookies.set을 올바른 인자로 호출해야 합니다', () => {
      UserTokenUtil.setAccessToken(mockAccessToken);
      expect(Cookies.set).toHaveBeenCalledWith('access_token', mockAccessToken);
    });
  });

  describe('removeAccessToken', () => {
    it('Cookies.remove를 올바른 인자로 호출해야 합니다', () => {
      UserTokenUtil.removeAccessToken();
      expect(Cookies.remove).toHaveBeenCalledWith('access_token');
    });
  });

  describe('getRefreshToken', () => {
    it('localStorage에 refresh_token이 있으면 해당 토큰을 반환해야 합니다', () => {
      localStorageMock.setItem('refresh_token', mockRefreshToken);
      expect(UserTokenUtil.getRefreshToken()).toBe(mockRefreshToken);
    });

    it('localStorage에 refresh_token이 없으면 null을 반환해야 합니다', () => {
      expect(UserTokenUtil.getRefreshToken()).toBeNull();
    });
  });

  describe('setRefreshToken', () => {
    it('localStorage.setItem을 올바른 인자로 호출해야 합니다', () => {
      const spy = jest.spyOn(localStorageMock, 'setItem');
      UserTokenUtil.setRefreshToken(mockRefreshToken);
      expect(spy).toHaveBeenCalledWith('refresh_token', mockRefreshToken);
      spy.mockRestore();
    });
  });

  describe('removeRefreshToken', () => {
    it('localStorage.removeItem을 올바른 인자로 호출해야 합니다', () => {
      const spy = jest.spyOn(localStorageMock, 'removeItem');
      // 먼저 아이템을 설정하여 삭제할 대상이 있도록 합니다.
      localStorageMock.setItem('refresh_token', mockRefreshToken);
      UserTokenUtil.removeRefreshToken();
      expect(spy).toHaveBeenCalledWith('refresh_token');
      spy.mockRestore();
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
