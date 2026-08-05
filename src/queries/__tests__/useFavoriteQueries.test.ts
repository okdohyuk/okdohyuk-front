/**
 * useFavoriteQueries: 즐겨찾기 React Query 훅 단위 테스트.
 * favoriteApi 와 UserTokenUtil 을 mock 해 호출 인자 / 낙관적 업데이트 / 롤백 / 캐시 무효화를 검증한다.
 *
 * 회귀 방지 핵심
 * - 낙관적 항목은 음수 id(미확정 표식)여야 하며 sortOrder 는 0..n-1 로 재부여되어야 한다.
 * - 실패 시 onMutate 스냅샷으로 정확히 롤백되어야 한다(부분 반영 잔존 금지).
 * - PUT order 실패가 code 59 일 때만 추가 재조회(invalidate)한다.
 * (usePokemonTeamQueries.test.ts 의 mock 컨벤션을 따른다.)
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';

import UserTokenUtil from '@utils/userTokenUtil';
import { favoriteApi } from '@api';
import {
  FAVORITE_KEYS,
  useAddFavorite,
  useDeleteFavorite,
  useFavorites,
  useReorderFavorites,
} from '../useFavoriteQueries';

vi.mock('@api', () => ({
  favoriteApi: {
    getFavorite: vi.fn(),
    postFavorite: vi.fn(),
    deleteFavoriteId: vi.fn(),
    putFavoriteOrder: vi.fn(),
  },
}));

vi.mock('@utils/userTokenUtil', () => ({
  default: { getAccessToken: vi.fn() },
}));

const getFavoriteMock = favoriteApi.getFavorite as unknown as ReturnType<typeof vi.fn>;
const postFavoriteMock = favoriteApi.postFavorite as unknown as ReturnType<typeof vi.fn>;
const deleteFavoriteIdMock = favoriteApi.deleteFavoriteId as unknown as ReturnType<typeof vi.fn>;
const putFavoriteOrderMock = favoriteApi.putFavoriteOrder as unknown as ReturnType<typeof vi.fn>;
const getAccessTokenMock = UserTokenUtil.getAccessToken as unknown as ReturnType<typeof vi.fn>;

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      // gcTime 을 유지해야 관찰자 없는 setQueryData 캐시가 즉시 수거되지 않는다(낙관적 업데이트 검사용).
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return { Wrapper, queryClient };
}

const favorite = (id: number, toolLink: string, sortOrder: number) => ({
  id,
  toolLink,
  sortOrder,
  createdAt: '2026-08-04T11:55:00',
});

const seedList = () => ({
  count: 3,
  results: [
    favorite(1, '/pokemon-type-calculator', 0),
    favorite(2, '/server-clock', 1),
    favorite(3, '/shortener', 2),
  ],
});

/** 수동으로 resolve/reject 할 수 있는 promise (낙관적 중간 상태 검사용). */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function conflictError(code: number, status = 409) {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError('conflict', 'ERR_BAD_REQUEST', config, {}, {
    status,
    statusText: '',
    data: { code },
    headers: {},
    config,
  } as never);
}

describe('useFavoriteQueries', () => {
  beforeEach(() => {
    getFavoriteMock.mockReset();
    postFavoriteMock.mockReset();
    deleteFavoriteIdMock.mockReset();
    putFavoriteOrderMock.mockReset();
    getAccessTokenMock.mockReset();
    getAccessTokenMock.mockReturnValue('Bearer token');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useFavorites', () => {
    it('Authorization 을 인자로 넘겨 목록을 조회한다', async () => {
      const list = seedList();
      getFavoriteMock.mockResolvedValue({ data: list });
      const { Wrapper } = makeWrapper();

      const { result } = renderHook(() => useFavorites(), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(getFavoriteMock).toHaveBeenCalledWith('Bearer token');
      expect(result.current.data).toEqual(list);
    });

    it('enabled=false 면 호출하지 않는다 (비로그인 401 예방)', async () => {
      const { Wrapper } = makeWrapper();

      const { result } = renderHook(() => useFavorites(false), { wrapper: Wrapper });

      expect(result.current.fetchStatus).toBe('idle');
      expect(getFavoriteMock).not.toHaveBeenCalled();
    });
  });

  describe('useAddFavorite', () => {
    it('낙관적으로 목록 끝에 음수 id 임시 항목을 붙인다', async () => {
      const { Wrapper, queryClient } = makeWrapper();
      queryClient.setQueryData(FAVORITE_KEYS.list(), seedList());
      const pending = deferred<{ data: unknown }>();
      postFavoriteMock.mockReturnValue(pending.promise);

      const { result } = renderHook(() => useAddFavorite(), { wrapper: Wrapper });
      act(() => {
        result.current.mutate('/qr-generator');
      });

      await waitFor(() => {
        const cached = queryClient.getQueryData(FAVORITE_KEYS.list()) as ReturnType<
          typeof seedList
        >;
        expect(cached.results).toHaveLength(4);
      });
      const cached = queryClient.getQueryData(FAVORITE_KEYS.list()) as ReturnType<typeof seedList>;
      const optimistic = cached.results[3];
      expect(cached.count).toBe(4);
      expect(optimistic.toolLink).toBe('/qr-generator');
      expect(optimistic.id).toBeLessThan(0);
      expect(cached.results.map((item) => item.sortOrder)).toEqual([0, 1, 2, 3]);

      pending.resolve({ data: favorite(4, '/qr-generator', 3) });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(postFavoriteMock).toHaveBeenCalledWith('Bearer token', { toolLink: '/qr-generator' });
    });

    it('실패하면 스냅샷으로 롤백한다', async () => {
      const { Wrapper, queryClient } = makeWrapper();
      const before = seedList();
      queryClient.setQueryData(FAVORITE_KEYS.list(), before);
      postFavoriteMock.mockRejectedValue(conflictError(57));

      const { result } = renderHook(() => useAddFavorite(), { wrapper: Wrapper });
      act(() => {
        result.current.mutate('/pokemon-type-calculator');
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(queryClient.getQueryData(FAVORITE_KEYS.list())).toEqual(before);
    });

    it('성공 후 목록 캐시를 무효화한다', async () => {
      const { Wrapper, queryClient } = makeWrapper();
      queryClient.setQueryData(FAVORITE_KEYS.list(), seedList());
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      postFavoriteMock.mockResolvedValue({ data: favorite(4, '/qr-generator', 3) });

      const { result } = renderHook(() => useAddFavorite(), { wrapper: Wrapper });
      act(() => {
        result.current.mutate('/qr-generator');
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: FAVORITE_KEYS.all });
    });
  });

  describe('useDeleteFavorite', () => {
    it('낙관적으로 제거하고 sortOrder 를 0..n-1 로 재정렬한다 (서버 동작과 동일)', async () => {
      const { Wrapper, queryClient } = makeWrapper();
      queryClient.setQueryData(FAVORITE_KEYS.list(), seedList());
      const pending = deferred<void>();
      deleteFavoriteIdMock.mockReturnValue(pending.promise);

      const { result } = renderHook(() => useDeleteFavorite(), { wrapper: Wrapper });
      act(() => {
        result.current.mutate(1);
      });

      await waitFor(() => {
        const cached = queryClient.getQueryData(FAVORITE_KEYS.list()) as ReturnType<
          typeof seedList
        >;
        expect(cached.results).toHaveLength(2);
      });
      const cached = queryClient.getQueryData(FAVORITE_KEYS.list()) as ReturnType<typeof seedList>;
      expect(cached.results.map((item) => item.id)).toEqual([2, 3]);
      expect(cached.results.map((item) => item.sortOrder)).toEqual([0, 1]);
      expect(cached.count).toBe(2);

      pending.resolve();
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(deleteFavoriteIdMock).toHaveBeenCalledWith(1, 'Bearer token');
    });

    it('실패하면 스냅샷으로 롤백한다 (404/403 모두)', async () => {
      const { Wrapper, queryClient } = makeWrapper();
      const before = seedList();
      queryClient.setQueryData(FAVORITE_KEYS.list(), before);
      deleteFavoriteIdMock.mockRejectedValue(conflictError(56, 404));

      const { result } = renderHook(() => useDeleteFavorite(), { wrapper: Wrapper });
      act(() => {
        result.current.mutate(1);
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(queryClient.getQueryData(FAVORITE_KEYS.list())).toEqual(before);
    });
  });

  describe('useReorderFavorites', () => {
    it('낙관적으로 순서를 반영하고 성공 응답을 캐시에 기록한다', async () => {
      const { Wrapper, queryClient } = makeWrapper();
      queryClient.setQueryData(FAVORITE_KEYS.list(), seedList());
      const pending = deferred<{ data: unknown }>();
      putFavoriteOrderMock.mockReturnValue(pending.promise);

      const { result } = renderHook(() => useReorderFavorites(), { wrapper: Wrapper });
      act(() => {
        result.current.mutate([3, 1, 2]);
      });

      await waitFor(() => {
        const cached = queryClient.getQueryData(FAVORITE_KEYS.list()) as ReturnType<
          typeof seedList
        >;
        expect(cached.results[0].id).toBe(3);
      });
      const optimistic = queryClient.getQueryData(FAVORITE_KEYS.list()) as ReturnType<
        typeof seedList
      >;
      expect(optimistic.results.map((item) => item.id)).toEqual([3, 1, 2]);
      expect(optimistic.results.map((item) => item.sortOrder)).toEqual([0, 1, 2]);

      const serverList = {
        count: 3,
        results: [
          favorite(3, '/shortener', 0),
          favorite(1, '/pokemon-type-calculator', 1),
          favorite(2, '/server-clock', 2),
        ],
      };
      pending.resolve({ data: serverList });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(queryClient.getQueryData(FAVORITE_KEYS.list())).toEqual(serverList);
      expect(putFavoriteOrderMock).toHaveBeenCalledWith('Bearer token', { favoriteIds: [3, 1, 2] });
    });

    it('요청 집합이 캐시와 어긋나면 낙관적 반영을 하지 않는다', async () => {
      const { Wrapper, queryClient } = makeWrapper();
      const before = seedList();
      queryClient.setQueryData(FAVORITE_KEYS.list(), before);
      const pending = deferred<{ data: unknown }>();
      putFavoriteOrderMock.mockReturnValue(pending.promise);

      const { result } = renderHook(() => useReorderFavorites(), { wrapper: Wrapper });
      act(() => {
        // 캐시에 없는 id(99) 포함 → 개수는 같지만 매핑이 안 되므로 낙관 반영 포기
        result.current.mutate([3, 1, 99]);
      });

      await waitFor(() => expect(result.current.isPending).toBe(true));
      expect(queryClient.getQueryData(FAVORITE_KEYS.list())).toEqual(before);

      pending.resolve({ data: before });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });

    it('실패하면 롤백하고, code 59 면 추가로 재조회한다', async () => {
      const { Wrapper, queryClient } = makeWrapper();
      const before = seedList();
      queryClient.setQueryData(FAVORITE_KEYS.list(), before);
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      putFavoriteOrderMock.mockRejectedValue(conflictError(59, 400));

      const { result } = renderHook(() => useReorderFavorites(), { wrapper: Wrapper });
      act(() => {
        result.current.mutate([3, 1, 2]);
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(queryClient.getQueryData(FAVORITE_KEYS.list())).toEqual(before);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: FAVORITE_KEYS.all });
    });

    it('code 59 가 아닌 실패는 롤백만 하고 재조회하지 않는다', async () => {
      const { Wrapper, queryClient } = makeWrapper();
      const before = seedList();
      queryClient.setQueryData(FAVORITE_KEYS.list(), before);
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      putFavoriteOrderMock.mockRejectedValue(conflictError(15, 403));

      const { result } = renderHook(() => useReorderFavorites(), { wrapper: Wrapper });
      act(() => {
        result.current.mutate([3, 1, 2]);
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(queryClient.getQueryData(FAVORITE_KEYS.list())).toEqual(before);
      expect(invalidateSpy).not.toHaveBeenCalled();
    });
  });

  describe('FAVORITE_KEYS', () => {
    it('list 키는 all 을 접두로 가져 일괄 무효화가 가능하다', () => {
      expect(FAVORITE_KEYS.all).toEqual(['favorite']);
      expect(FAVORITE_KEYS.list()).toEqual(['favorite', 'list']);
    });
  });
});
