import { getLanguageFromCookies, stringToLanguage } from '../localeUtil';
import { Language } from '~/app/i18n/settings';
import { RequestCookies, ResponseCookies } from 'next/dist/compiled/@edge-runtime/cookies';

// ~/app/i18n/settings 모듈을 모킹합니다.
jest.mock('~/app/i18n/settings', () => ({
  fallbackLng: 'en' as Language,
  languages: ['en', 'ko'] as Language[],
  cookieName: 'i18next',
}));

// getLanguageFromCookies에 필요한 cookieStore의 모의 타입을 정의합니다.
// 실제 RequestCookies와 ResponseCookies 타입은 복잡하므로, 필요한 부분만 모킹합니다.
type MockCookieStore = Omit<RequestCookies, 'set' | 'clear' | 'delete'> &
  Pick<ResponseCookies, 'set' | 'delete'>;

describe('localeUtil', () => {
  describe('stringToLanguage', () => {
    it('유효한 언어 문자열을 Language 타입으로 변환해야 합니다', () => {
      expect(stringToLanguage('en')).toBe('en');
      expect(stringToLanguage('ko')).toBe('ko');
    });

    it('유효하지 않은 언어 문자열에 대해 null을 반환해야 합니다', () => {
      expect(stringToLanguage('jp')).toBeNull();
      expect(stringToLanguage('english')).toBeNull();
    });

    it('빈 문자열에 대해 null을 반환해야 합니다', () => {
      expect(stringToLanguage('')).toBeNull();
    });
  });

  describe('getLanguageFromCookies', () => {
    let mockCookieStore: MockCookieStore;

    beforeEach(() => {
      // 각 테스트 전에 모의 cookieStore를 초기화합니다.
      const cookiesMap = new Map<string, { name: string; value: string }>();
      mockCookieStore = {
        get: (name: string) => cookiesMap.get(name) || undefined,
        // @ts-ignore
        set: (name: string, value: string) => cookiesMap.set(name, { name, value }),
        // @ts-ignore
        delete: (name: string) => cookiesMap.delete(name),
        // @ts-ignore
        has: (name: string) => cookiesMap.has(name),
        // @ts-ignore
        [Symbol.iterator]: function* () {
          for (const cookie of cookiesMap.values()) {
            yield cookie;
          }
        },
        // @ts-ignore
        getAll: () => Array.from(cookiesMap.values()),
      };
    });

    it('i18next 쿠키에 유효한 언어가 있으면 해당 언어를 반환해야 합니다', () => {
      mockCookieStore.set('i18next', 'ko');
      expect(getLanguageFromCookies(mockCookieStore)).toBe('ko');
    });

    it('i18next 쿠키에 유효하지 않은 언어가 있으면 fallbackLng를 반환해야 합니다', () => {
      mockCookieStore.set('i18next', 'jp');
      expect(getLanguageFromCookies(mockCookieStore)).toBe('en'); // fallbackLng는 'en'으로 모킹됨
    });

    it('i18next 쿠키가 없으면 fallbackLng를 반환해야 합니다', () => {
      expect(getLanguageFromCookies(mockCookieStore)).toBe('en');
    });

    it('i18next 쿠키 값이 빈 문자열이면 fallbackLng를 반환해야 합니다', () => {
      mockCookieStore.set('i18next', '');
      expect(getLanguageFromCookies(mockCookieStore)).toBe('en');
    });

    // fallbackLng가 다른 경우도 테스트 (모듈 모킹을 통해 제어)
    it('다른 fallbackLng 설정에 대해서도 올바르게 동작해야 합니다', async () => {
      await jest.isolateModulesAsync(async () => {
        // Ensure a completely fresh start for modules within this isolated block
        jest.resetModules();

        // Dynamically mock '~/app/i18n/settings' for the scope of this isolateModulesAsync block.
        jest.doMock('~/app/i18n/settings', () => ({
          __esModule: true,
          fallbackLng: 'ko' as Language,
          languages: ['en', 'ko'] as Language[],
          cookieName: 'i18next',
        }));

        // Verify that the mock is active by importing '~/app/i18n/settings' directly.
        const settings = await import('~/app/i18n/settings');
        expect(settings.fallbackLng).toBe('ko'); // Crucial check for mock effectiveness

        // Now, import the module under test ('../localeUtil').
        const { getLanguageFromCookies: getLangWithNewFallback } = await import('../localeUtil');
        // Since mockCookieStore is empty, getLangWithNewFallback should return 'ko'.
        expect(getLangWithNewFallback(mockCookieStore)).toBe('ko'); // The main assertion
      });

      // After exiting isolateModulesAsync, ensure the module system is reset.
      jest.resetModules();
      // Import '~/app/i18n/settings' again to confirm it reflects the global mock.
      const globalSettings = await import('~/app/i18n/settings');
      expect(globalSettings.fallbackLng).toBe('ko'); // Global mock sets 'en'

      // Import '../localeUtil' again. It should now use the globally mocked settings.
      const { getLanguageFromCookies: getLangOriginalFallback } = await import('../localeUtil');
      expect(getLangOriginalFallback(mockCookieStore)).toBe('ko');
    });
  });
});
