/**
 * useGuestbookQueries: React Query infinite/mutation 훅 단위 테스트.
 * guestbookApi 와 UserTokenUtil 을 직접 mock 하여 훅 동작(파라미터 전달·토큰 전달·invalidate·페이지네이션)만 검증한다.
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import UserTokenUtil from '@utils/userTokenUtil';
import { guestbookApi } from '@api';
import {
  useGetGuestbooks,
  useCreateGuestbook,
  useDeleteGuestbook,
  useReportGuestbook,
  GUESTBOOK_KEYS,
} from '../useGuestbookQueries';

// guestbookApi 모킹 — vi.mock 은 hoist 되므로 factory 내부에서 mock 을 만들고,
// 테스트 코드는 import 후 vi.mocked() 로 참조한다.
vi.mock('@api', () => ({
  guestbookApi: {
    getGuestbook: vi.fn(),
    postGuestbook: vi.fn(),
    deleteGuestbook: vi.fn(),
    postGuestbookReport: vi.fn(),
  },
}));

// UserTokenUtil 모킹
vi.mock('@utils/userTokenUtil', () => ({
  default: {
    getAccessToken: vi.fn(),
  },
}));

const getGuestbookMock = guestbookApi.getGuestbook as unknown as ReturnType<typeof vi.fn>;
const postGuestbookMock = guestbookApi.postGuestbook as unknown as ReturnType<typeof vi.fn>;
const deleteGuestbookMock = guestbookApi.deleteGuestbook as unknown as ReturnType<typeof vi.fn>;
const postGuestbookReportMock = guestbookApi.postGuestbookReport as unknown as ReturnType<
  typeof vi.fn
>;
const getAccessTokenMock = UserTokenUtil.getAccessToken as ReturnType<typeof vi.fn>;

const PAGE_SIZE = 20;

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

/** length 개의 Guestbook 유사 객체 배열을 만든다 (내용은 검증에 무관). */
function makeGuestbookPage(length: number) {
  return Array.from({ length }, (_, i) => ({
    id: `gb-${i}`,
    content: `content-${i}`,
    createdAt: '2026-07-01T00:00:00',
    isDeleted: false,
  }));
}

describe('useGuestbookQueries', () => {
  beforeEach(() => {
    getGuestbookMock.mockReset();
    postGuestbookMock.mockReset();
    deleteGuestbookMock.mockReset();
    postGuestbookReportMock.mockReset();
    getAccessTokenMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useGetGuestbooks', () => {
    it('초기 로드 시 getGuestbook 을 (page=0, limit=20) 으로 호출한다', async () => {
      getGuestbookMock.mockResolvedValue({ data: makeGuestbookPage(PAGE_SIZE) });
      const { Wrapper } = makeWrapper();

      const { result } = renderHook(() => useGetGuestbooks(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(getGuestbookMock).toHaveBeenCalledWith(0, PAGE_SIZE);
    });

    it('마지막 페이지가 20건이면 hasNextPage=true, fetchNextPage 는 다음 page 로 호출한다', async () => {
      // 첫 페이지 20건 → 다음 페이지 존재. 두 번째 페이지는 10건 → 종료.
      getGuestbookMock
        .mockResolvedValueOnce({ data: makeGuestbookPage(PAGE_SIZE) })
        .mockResolvedValueOnce({ data: makeGuestbookPage(10) });
      const { Wrapper } = makeWrapper();

      const { result } = renderHook(() => useGetGuestbooks(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.hasNextPage).toBe(true);

      // getNextPageParam 이 allPages.length(=1) 를 반환 → 다음 호출은 (1, 20)
      await act(async () => {
        await result.current.fetchNextPage();
      });

      await waitFor(() => expect(result.current.data?.pages.length).toBe(2));
      expect(getGuestbookMock).toHaveBeenNthCalledWith(2, 1, PAGE_SIZE);
      // 두 번째 페이지가 20건 미만이므로 더 이상 다음 페이지 없음
      expect(result.current.hasNextPage).toBe(false);
    });

    it('첫 페이지가 20건 미만이면 hasNextPage=false (getNextPageParam=undefined)', async () => {
      getGuestbookMock.mockResolvedValue({ data: makeGuestbookPage(5) });
      const { Wrapper } = makeWrapper();

      const { result } = renderHook(() => useGetGuestbooks(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.hasNextPage).toBe(false);
    });
  });

  describe('useCreateGuestbook', () => {
    it('익명(토큰 없음) 시 postGuestbook 를 payload + undefined 로 호출한다', async () => {
      getAccessTokenMock.mockReturnValue(null);
      postGuestbookMock.mockResolvedValue({ data: { id: 'gb-1' } });
      const { Wrapper } = makeWrapper();

      const { result } = renderHook(() => useCreateGuestbook(), { wrapper: Wrapper });

      act(() => {
        result.current.mutate({
          content: '안녕하세요',
          nickname: '익명이',
          deletePassword: 'pw1234',
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(postGuestbookMock).toHaveBeenCalledWith(
        { content: '안녕하세요', nickname: '익명이', deletePassword: 'pw1234' },
        undefined,
      );
    });

    it('로그인(토큰 있음) 시 postGuestbook 를 payload + token 으로 호출하고 lists 캐시를 invalidate 한다', async () => {
      getAccessTokenMock.mockReturnValue('tok-abc');
      postGuestbookMock.mockResolvedValue({ data: { id: 'gb-2' } });
      const { Wrapper, queryClient } = makeWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateGuestbook(), { wrapper: Wrapper });

      act(() => {
        result.current.mutate({ content: '로그인 글' });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(postGuestbookMock).toHaveBeenCalledWith(
        { content: '로그인 글', nickname: undefined, deletePassword: undefined },
        'tok-abc',
      );
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: GUESTBOOK_KEYS.lists() });
    });
  });

  describe('useDeleteGuestbook', () => {
    it('익명 삭제: 토큰 없으면 deleteGuestbook(id, undefined, {deletePassword}) 로 호출한다', async () => {
      getAccessTokenMock.mockReturnValue(null);
      deleteGuestbookMock.mockResolvedValue({});
      const { Wrapper } = makeWrapper();

      const { result } = renderHook(() => useDeleteGuestbook(), { wrapper: Wrapper });

      act(() => {
        result.current.mutate({ id: 'gb-9', deletePassword: 'pw' });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(deleteGuestbookMock).toHaveBeenCalledWith('gb-9', undefined, {
        deletePassword: 'pw',
      });
    });

    it('로그인 삭제: 토큰이 있으면 deleteGuestbook(id, token, {deletePassword}) 로 호출하고 lists 를 invalidate 한다', async () => {
      getAccessTokenMock.mockReturnValue('tok-del');
      deleteGuestbookMock.mockResolvedValue({});
      const { Wrapper, queryClient } = makeWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeleteGuestbook(), { wrapper: Wrapper });

      act(() => {
        result.current.mutate({ id: 'gb-10' });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(deleteGuestbookMock).toHaveBeenCalledWith('gb-10', 'tok-del', {
        deletePassword: undefined,
      });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: GUESTBOOK_KEYS.lists() });
    });
  });

  describe('useReportGuestbook', () => {
    it('postGuestbookReport(id, token, {reason, description}) 로 호출한다', async () => {
      getAccessTokenMock.mockReturnValue('tok-rep');
      postGuestbookReportMock.mockResolvedValue({});
      const { Wrapper } = makeWrapper();

      const { result } = renderHook(() => useReportGuestbook(), { wrapper: Wrapper });

      act(() => {
        result.current.mutate({
          id: 'gb-11',
          reason: 'SPAM',
          description: '스팸입니다',
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(postGuestbookReportMock).toHaveBeenCalledWith('gb-11', 'tok-rep', {
        reason: 'SPAM',
        description: '스팸입니다',
      });
    });
  });

  describe('GUESTBOOK_KEYS', () => {
    it('lists() 는 ["guestbook","list"] 키를 반환한다', () => {
      expect(GUESTBOOK_KEYS.lists()).toEqual(['guestbook', 'list']);
    });
  });
});
