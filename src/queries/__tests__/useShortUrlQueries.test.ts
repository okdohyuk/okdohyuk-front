/**
 * useShortUrlQueries: React Query mutation/query 훅 단위 테스트.
 * shortUrlApi 와 UserTokenUtil 을 직접 mock 하여 훅 동작만 검증한다.
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import UserTokenUtil from '@utils/userTokenUtil';
import { shortUrlApi } from '@api';
import {
  useCreateShortUrl,
  useMyShortUrls,
  useDeleteShortUrl,
  SHORT_URL_KEYS,
} from '../useShortUrlQueries';

// shortUrlApi 모킹 — vi.mock 은 hoist 되므로 factory 내부에서 mock 객체를 만들고,
// 테스트 코드는 import 후 vi.mocked() 로 참조한다.
vi.mock('@api', () => ({
  shortUrlApi: {
    postShortUrl: vi.fn(),
    getShortUrlMe: vi.fn(),
    deleteShortUrlCode: vi.fn(),
  },
}));

// UserTokenUtil 모킹
vi.mock('@utils/userTokenUtil', () => ({
  default: {
    getAccessToken: vi.fn(),
  },
}));

const postShortUrlMock = shortUrlApi.postShortUrl as unknown as ReturnType<typeof vi.fn>;
const getShortUrlMeMock = shortUrlApi.getShortUrlMe as unknown as ReturnType<typeof vi.fn>;
const deleteShortUrlCodeMock = shortUrlApi.deleteShortUrlCode as unknown as ReturnType<
  typeof vi.fn
>;

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return { Wrapper, queryClient };
}

const sampleShortUrl = {
  code: 'aB3xY9',
  shortUrl: 'https://okdohyuk.dev/l/aB3xY9',
  originalUrl: 'https://example.com/very/long/path',
  expiresAt: '2026-06-01T00:00:00',
  hitCount: 0,
  createdAt: '2026-05-15T10:00:00',
};

describe('useShortUrlQueries', () => {
  beforeEach(() => {
    postShortUrlMock.mockReset();
    getShortUrlMeMock.mockReset();
    deleteShortUrlCodeMock.mockReset();
    (UserTokenUtil.getAccessToken as ReturnType<typeof vi.fn>).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useCreateShortUrl', () => {
    it('mutation 성공 시 shortUrlApi.postShortUrl 가 호출되고 데이터를 반환한다', async () => {
      (UserTokenUtil.getAccessToken as ReturnType<typeof vi.fn>).mockReturnValue('tok-abc');
      postShortUrlMock.mockResolvedValue({ data: sampleShortUrl });
      const { Wrapper } = makeWrapper();

      const { result } = renderHook(() => useCreateShortUrl(), { wrapper: Wrapper });

      act(() => {
        result.current.mutate({
          originalUrl: 'https://example.com/very/long/path',
          expirePreset: 'SEVEN_DAYS' as const,
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(postShortUrlMock).toHaveBeenCalledWith(
        {
          originalUrl: 'https://example.com/very/long/path',
          expirePreset: 'SEVEN_DAYS',
        },
        'tok-abc',
      );
      expect(result.current.data).toEqual(sampleShortUrl);
    });

    it('비로그인(accessToken null) 시 두 번째 인자는 undefined 로 호출된다', async () => {
      (UserTokenUtil.getAccessToken as ReturnType<typeof vi.fn>).mockReturnValue(null);
      postShortUrlMock.mockResolvedValue({ data: sampleShortUrl });
      const { Wrapper } = makeWrapper();

      const { result } = renderHook(() => useCreateShortUrl(), { wrapper: Wrapper });

      act(() => {
        result.current.mutate({
          originalUrl: 'https://example.com',
          expirePreset: 'NEVER' as const,
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(postShortUrlMock).toHaveBeenCalledWith(expect.any(Object), undefined);
    });

    it('mutation 성공 시 SHORT_URL_KEYS.me 캐시를 invalidate 한다', async () => {
      (UserTokenUtil.getAccessToken as ReturnType<typeof vi.fn>).mockReturnValue('tok');
      postShortUrlMock.mockResolvedValue({ data: sampleShortUrl });
      const { Wrapper, queryClient } = makeWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateShortUrl(), { wrapper: Wrapper });
      act(() => {
        result.current.mutate({ originalUrl: 'https://x.io', expirePreset: 'ONE_DAY' as const });
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: SHORT_URL_KEYS.me() });
    });

    it('mutation 실패 시 isError 상태가 된다', async () => {
      (UserTokenUtil.getAccessToken as ReturnType<typeof vi.fn>).mockReturnValue(null);
      postShortUrlMock.mockRejectedValue(new Error('boom'));
      const { Wrapper } = makeWrapper();

      const { result } = renderHook(() => useCreateShortUrl(), { wrapper: Wrapper });
      act(() => {
        result.current.mutate({ originalUrl: 'https://x.io', expirePreset: 'ONE_DAY' as const });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useMyShortUrls', () => {
    it('accessToken === null 이면 enabled:false 로 queryFn 미호출', async () => {
      const { Wrapper } = makeWrapper();
      const { result } = renderHook(() => useMyShortUrls(null), { wrapper: Wrapper });

      // 잠시 대기해도 fetching 이 시작되지 않아야 한다
      await new Promise((r) => {
        setTimeout(r, 30);
      });
      expect(getShortUrlMeMock).not.toHaveBeenCalled();
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('accessToken 이 있으면 getShortUrlMe 를 호출하고 data 반환', async () => {
      getShortUrlMeMock.mockResolvedValue({ data: [sampleShortUrl] });
      const { Wrapper } = makeWrapper();

      const { result } = renderHook(() => useMyShortUrls('tok-abc'), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(getShortUrlMeMock).toHaveBeenCalledWith('tok-abc');
      expect(result.current.data).toEqual([sampleShortUrl]);
    });
  });

  describe('useDeleteShortUrl', () => {
    it('mutation 호출 시 shortUrlApi.deleteShortUrlCode 가 호출된다', async () => {
      (UserTokenUtil.getAccessToken as ReturnType<typeof vi.fn>).mockReturnValue('tok-del');
      deleteShortUrlCodeMock.mockResolvedValue({});
      const { Wrapper } = makeWrapper();

      const { result } = renderHook(() => useDeleteShortUrl(), { wrapper: Wrapper });
      act(() => {
        result.current.mutate('aB3xY9');
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(deleteShortUrlCodeMock).toHaveBeenCalledWith('aB3xY9', 'tok-del');
    });

    it('성공 시 SHORT_URL_KEYS.me 캐시를 invalidate 한다', async () => {
      (UserTokenUtil.getAccessToken as ReturnType<typeof vi.fn>).mockReturnValue('tok-del');
      deleteShortUrlCodeMock.mockResolvedValue({});
      const { Wrapper, queryClient } = makeWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeleteShortUrl(), { wrapper: Wrapper });
      act(() => {
        result.current.mutate('aB3xY9');
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: SHORT_URL_KEYS.me() });
    });
  });

  describe('SHORT_URL_KEYS', () => {
    it('me() 는 ["short-url","me"] 키를 반환한다', () => {
      expect(SHORT_URL_KEYS.me()).toEqual(['short-url', 'me']);
    });
  });
});
