import LocalStorage from '../localStorage';

describe('LocalStorage', () => {
  // 각 테스트 전에 localStorage를 초기화합니다.
  beforeEach(() => {
    localStorage.clear();
    // Jest가 localStorage의 각 메서드 호출을 감시하도록 spy를 설정합니다.
    jest.spyOn(Storage.prototype, 'setItem');
    jest.spyOn(Storage.prototype, 'getItem');
    jest.spyOn(Storage.prototype, 'removeItem');
  });

  // 각 테스트 후에 spy를 복원합니다.
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('setItem', () => {
    it('localStorage.setItem을 올바른 키와 값으로 호출해야 합니다', () => {
      const key = 'testKey';
      const value = 'testValue';
      LocalStorage.setItem(key, value);
      expect(localStorage.setItem).toHaveBeenCalledWith(key, value);
      // 실제 값이 저장되었는지도 확인합니다.
      expect(localStorage.getItem(key)).toBe(value);
    });
  });

  describe('getItem', () => {
    it('localStorage.getItem을 올바른 키로 호출하고 값을 반환해야 합니다', () => {
      const key = 'testKey';
      const value = 'testValue';
      localStorage.setItem(key, value); // 테스트를 위해 직접 설정

      const result = LocalStorage.getItem(key);
      expect(localStorage.getItem).toHaveBeenCalledWith(key);
      expect(result).toBe(value);
    });

    it('키가 존재하지 않으면 null을 반환해야 합니다', () => {
      const key = 'nonExistentKey';
      const result = LocalStorage.getItem(key);
      expect(localStorage.getItem).toHaveBeenCalledWith(key);
      expect(result).toBeNull();
    });
  });

  describe('removeItem', () => {
    it('localStorage.removeItem을 올바른 키로 호출해야 합니다', () => {
      const key = 'testKey';
      localStorage.setItem(key, 'testValue'); // 삭제할 아이템 미리 설정

      LocalStorage.removeItem(key);
      expect(localStorage.removeItem).toHaveBeenCalledWith(key);
      // 실제 값이 삭제되었는지도 확인합니다.
      expect(localStorage.getItem(key)).toBeNull();
    });

    it('존재하지 않는 키를 삭제하려고 해도 에러가 발생하지 않아야 합니다', () => {
      const key = 'nonExistentKey';
      expect(() => LocalStorage.removeItem(key)).not.toThrow();
      expect(localStorage.removeItem).toHaveBeenCalledWith(key);
    });
  });

  // window 객체가 없는 환경 (예: SSR)을 시뮬레이션하기 위한 테스트는
  // Jest 설정을 변경하거나, global.window를 undefined로 설정하는 등의 추가 작업이 필요할 수 있습니다.
  // 여기서는 JSDOM 환경을 기준으로 테스트합니다.
});
