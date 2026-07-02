/**
 * usePokemonTeamQueries: 포켓몬 팀 React Query 훅 단위 테스트.
 * pokemonTeamApi 와 UserTokenUtil 을 직접 mock 해 훅의 호출 인자/캐시 무효화/enabled 게이팅을 검증한다.
 *
 * 핵심 회귀 방지: 생성(POST)은 axios 인터셉터가 X-Session-ID 를 자동 첨부하지 않으므로
 * 익명 저장을 위해 sessionId 가 세 번째 인자로 "수동 전달"되어야 한다. 이 인자가 누락되거나
 * 자리(2번째 authorization vs 3번째 xSessionID)가 바뀌면 비로그인 저장이 깨진다.
 * (useShortUrlQueries.test.ts 의 mock 컨벤션을 따른다.)
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import UserTokenUtil from '@utils/userTokenUtil';
import { pokemonTeamApi } from '@api';
import {
  useCreatePokemonTeam,
  useMyPokemonTeams,
  usePokemonTeamByShareId,
  useDeletePokemonTeam,
  POKEMON_TEAM_KEYS,
} from '../usePokemonTeamQueries';

vi.mock('@api', () => ({
  pokemonTeamApi: {
    postPokemonTeam: vi.fn(),
    getPokemonTeamMe: vi.fn(),
    getPokemonTeamShare: vi.fn(),
    deletePokemonTeamId: vi.fn(),
  },
}));

vi.mock('@utils/userTokenUtil', () => ({
  default: {
    getAccessToken: vi.fn(),
  },
}));

const postPokemonTeamMock = pokemonTeamApi.postPokemonTeam as unknown as ReturnType<typeof vi.fn>;
const getPokemonTeamMeMock = pokemonTeamApi.getPokemonTeamMe as unknown as ReturnType<typeof vi.fn>;
const getPokemonTeamShareMock = pokemonTeamApi.getPokemonTeamShare as unknown as ReturnType<
  typeof vi.fn
>;
const deletePokemonTeamIdMock = pokemonTeamApi.deletePokemonTeamId as unknown as ReturnType<
  typeof vi.fn
>;
const getAccessTokenMock = UserTokenUtil.getAccessToken as unknown as ReturnType<typeof vi.fn>;

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

const sampleTeam = {
  id: 12,
  name: '우리집 에이스',
  shareId: 'Ab3xZ9',
  members: [
    {
      slug: 'charizard',
      names: { ko: '리자몽', en: 'Charizard', ja: 'リザードン', zh: '喷火龙' },
      types: ['fire', 'flying'],
      spriteUrl: 'https://example/6.png',
    },
  ],
  createdAt: '2026-06-27T01:23:45',
};

const sampleRequest = { name: '우리집 에이스', members: ['charizard'] };

describe('usePokemonTeamQueries', () => {
  beforeEach(() => {
    postPokemonTeamMock.mockReset();
    getPokemonTeamMeMock.mockReset();
    getPokemonTeamShareMock.mockReset();
    deletePokemonTeamIdMock.mockReset();
    getAccessTokenMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useCreatePokemonTeam', () => {
    it('비로그인 저장: accessToken 없으면 두 번째 인자 undefined, 세 번째 인자에 sessionId 를 수동 전달한다', async () => {
      getAccessTokenMock.mockReturnValue(null);
      postPokemonTeamMock.mockResolvedValue({ data: sampleTeam });
      const { Wrapper } = makeWrapper();

      const { result } = renderHook(() => useCreatePokemonTeam(), { wrapper: Wrapper });
      act(() => {
        result.current.mutate({ request: sampleRequest, sessionId: 'sess-abc-123' });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      // (request, authorization=undefined, xSessionID='sess-abc-123')
      expect(postPokemonTeamMock).toHaveBeenCalledWith(sampleRequest, undefined, 'sess-abc-123');
      // 세 번째 인자(세션)가 실제로 전달됐는지 자리까지 확정 검증.
      expect(postPokemonTeamMock.mock.calls[0][2]).toBe('sess-abc-123');
    });

    it('로그인 저장: accessToken 이 있으면 두 번째 인자에 토큰을 전달한다', async () => {
      getAccessTokenMock.mockReturnValue('tok-abc');
      postPokemonTeamMock.mockResolvedValue({ data: sampleTeam });
      const { Wrapper } = makeWrapper();

      const { result } = renderHook(() => useCreatePokemonTeam(), { wrapper: Wrapper });
      act(() => {
        result.current.mutate({ request: sampleRequest, sessionId: 'sess-abc-123' });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(postPokemonTeamMock).toHaveBeenCalledWith(sampleRequest, 'tok-abc', 'sess-abc-123');
    });

    it('sessionId 가 null/없으면 세 번째 인자는 undefined 로 호출된다', async () => {
      getAccessTokenMock.mockReturnValue('tok-abc');
      postPokemonTeamMock.mockResolvedValue({ data: sampleTeam });
      const { Wrapper } = makeWrapper();

      const { result } = renderHook(() => useCreatePokemonTeam(), { wrapper: Wrapper });
      act(() => {
        result.current.mutate({ request: sampleRequest, sessionId: null });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(postPokemonTeamMock).toHaveBeenCalledWith(sampleRequest, 'tok-abc', undefined);
    });

    it('mutation 성공 시 응답 data 를 반환한다', async () => {
      getAccessTokenMock.mockReturnValue(null);
      postPokemonTeamMock.mockResolvedValue({ data: sampleTeam });
      const { Wrapper } = makeWrapper();

      const { result } = renderHook(() => useCreatePokemonTeam(), { wrapper: Wrapper });
      act(() => {
        result.current.mutate({ request: sampleRequest, sessionId: 'sess-1' });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(sampleTeam);
    });

    it('성공 시 POKEMON_TEAM_KEYS.all 캐시를 invalidate 한다', async () => {
      getAccessTokenMock.mockReturnValue(null);
      postPokemonTeamMock.mockResolvedValue({ data: sampleTeam });
      const { Wrapper, queryClient } = makeWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreatePokemonTeam(), { wrapper: Wrapper });
      act(() => {
        result.current.mutate({ request: sampleRequest, sessionId: 'sess-1' });
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: POKEMON_TEAM_KEYS.all });
    });

    it('mutation 실패 시 isError 상태가 된다', async () => {
      getAccessTokenMock.mockReturnValue(null);
      postPokemonTeamMock.mockRejectedValue(new Error('boom'));
      const { Wrapper } = makeWrapper();

      const { result } = renderHook(() => useCreatePokemonTeam(), { wrapper: Wrapper });
      act(() => {
        result.current.mutate({ request: sampleRequest, sessionId: 'sess-1' });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useMyPokemonTeams', () => {
    it('token === null 이면 enabled:false 로 queryFn 미호출', async () => {
      const { Wrapper } = makeWrapper();
      const { result } = renderHook(() => useMyPokemonTeams(null), { wrapper: Wrapper });

      await new Promise((r) => {
        setTimeout(r, 30);
      });
      expect(getPokemonTeamMeMock).not.toHaveBeenCalled();
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('token 이 있으면 getPokemonTeamMe 를 (token, page, limit) 로 호출한다', async () => {
      getPokemonTeamMeMock.mockResolvedValue({
        data: { count: 1, results: [sampleTeam], isFirst: true, isLast: true },
      });
      const { Wrapper } = makeWrapper();

      const { result } = renderHook(() => useMyPokemonTeams('tok-abc', 2, 20), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(getPokemonTeamMeMock).toHaveBeenCalledWith('tok-abc', 2, 20);
    });
  });

  describe('usePokemonTeamByShareId', () => {
    it('shareId 가 비면 enabled:false 로 queryFn 미호출', async () => {
      const { Wrapper } = makeWrapper();
      const { result } = renderHook(() => usePokemonTeamByShareId(''), { wrapper: Wrapper });

      await new Promise((r) => {
        setTimeout(r, 30);
      });
      expect(getPokemonTeamShareMock).not.toHaveBeenCalled();
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('shareId 가 있으면 public getPokemonTeamShare 를 토큰 없이 호출한다', async () => {
      getPokemonTeamShareMock.mockResolvedValue({ data: sampleTeam });
      const { Wrapper } = makeWrapper();

      const { result } = renderHook(() => usePokemonTeamByShareId('Ab3xZ9'), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(getPokemonTeamShareMock).toHaveBeenCalledWith('Ab3xZ9');
      // 공개 조회이므로 토큰을 읽지 않는다.
      expect(getAccessTokenMock).not.toHaveBeenCalled();
      expect(result.current.data).toEqual(sampleTeam);
    });
  });

  describe('useDeletePokemonTeam', () => {
    it('삭제 시 deletePokemonTeamId 를 (id, token) 로 호출한다', async () => {
      getAccessTokenMock.mockReturnValue('tok-del');
      deletePokemonTeamIdMock.mockResolvedValue({});
      const { Wrapper } = makeWrapper();

      const { result } = renderHook(() => useDeletePokemonTeam(), { wrapper: Wrapper });
      act(() => {
        result.current.mutate(12);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(deletePokemonTeamIdMock).toHaveBeenCalledWith(12, 'tok-del');
    });

    it('성공 시 POKEMON_TEAM_KEYS.all 캐시를 invalidate 한다', async () => {
      getAccessTokenMock.mockReturnValue('tok-del');
      deletePokemonTeamIdMock.mockResolvedValue({});
      const { Wrapper, queryClient } = makeWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeletePokemonTeam(), { wrapper: Wrapper });
      act(() => {
        result.current.mutate(12);
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: POKEMON_TEAM_KEYS.all });
    });
  });

  describe('POKEMON_TEAM_KEYS', () => {
    it('all 은 ["pokemon-team"] 이다', () => {
      expect(POKEMON_TEAM_KEYS.all).toEqual(['pokemon-team']);
    });

    it('share(id) 는 all 을 prefix 로 가진 안정적 키를 만든다', () => {
      expect(POKEMON_TEAM_KEYS.share('Ab3xZ9')).toEqual(['pokemon-team', 'share', 'Ab3xZ9']);
    });

    it('me(page, limit) 는 page/limit 를 키에 포함한다', () => {
      expect(POKEMON_TEAM_KEYS.me(1, 20)).toEqual(['pokemon-team', 'me', 1, 20]);
    });
  });
});
