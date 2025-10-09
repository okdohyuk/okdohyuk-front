import { vi } from 'vitest';
import ScrollUtils from '../scrollUtils';

describe('ScrollUtils', () => {
  describe('getScrollTop', () => {
    afterEach(() => {
      // 각 테스트 후 모든 모의를 복원합니다.
      vi.restoreAllMocks();
    });

    it('document.body가 없으면 0을 반환해야 합니다', () => {
      vi.spyOn(global.document, 'body', 'get').mockReturnValue(null as any);
      // documentElement는 이 경우 접근되지 않아야 하지만, 안전을 위해 모의할 수 있습니다.
      vi.spyOn(global.document, 'documentElement', 'get').mockReturnValue(null as any);
      expect(ScrollUtils.getScrollTop()).toBe(0);
    });

    it('document.documentElement.scrollTop이 값을 가지면 해당 값을 반환해야 합니다', () => {
      const scrollTopValue = 100;
      vi.spyOn(global.document, 'body', 'get').mockReturnValue({ scrollTop: 50 } as any);
      vi
        .spyOn(global.document, 'documentElement', 'get')
        .mockReturnValue({ scrollTop: scrollTopValue } as any);
      expect(ScrollUtils.getScrollTop()).toBe(scrollTopValue);
    });

    it('document.documentElement.scrollTop이 0이고 document.body.scrollTop이 값을 가지면 body.scrollTop 값을 반환해야 합니다', () => {
      const bodyScrollTopValue = 200;
      vi
        .spyOn(global.document, 'body', 'get')
        .mockReturnValue({ scrollTop: bodyScrollTopValue } as any);
      vi
        .spyOn(global.document, 'documentElement', 'get')
        .mockReturnValue({ scrollTop: 0 } as any);
      expect(ScrollUtils.getScrollTop()).toBe(bodyScrollTopValue);
    });

    it('document.documentElement.scrollTop과 document.body.scrollTop 모두 0이면 0을 반환해야 합니다', () => {
      vi.spyOn(global.document, 'body', 'get').mockReturnValue({ scrollTop: 0 } as any);
      vi
        .spyOn(global.document, 'documentElement', 'get')
        .mockReturnValue({ scrollTop: 0 } as any);
      expect(ScrollUtils.getScrollTop()).toBe(0);
    });

    it('document.documentElement가 null이지만 document.body.scrollTop이 값을 가지면 body.scrollTop 값을 반환해야 합니다', () => {
      const bodyScrollTopValue = 300;
      vi
        .spyOn(global.document, 'body', 'get')
        .mockReturnValue({ scrollTop: bodyScrollTopValue } as any);
      vi.spyOn(global.document, 'documentElement', 'get').mockReturnValue(null as any);
      expect(ScrollUtils.getScrollTop()).toBe(bodyScrollTopValue);
    });
  });
});
