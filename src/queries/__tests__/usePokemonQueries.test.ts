/**
 * usePokemonQueries: Pokemon 종(species) React Query 훅 단위 테스트.
 * pokemonApi 를 직접 mock 해 검색/단건 훅의 호출 인자와 enabled 게이팅을 검증한다.
 *
 * 핵심: 공개 endpoint 라 토큰을 보내지 않으며(인증 무관), 빈 query 는 undefined 로 넘겨
 * 전체 조회가 되도록 한다(`query || undefined`). limit/type/page 가 그대로 axios 인자로 전달되는지 확인.
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { pokemonApi } from '@api';
import {
  useSearchPokemonSpecies,
  useGetPokemonSpecies,
  POKEMON_KEYS,
  POKEMON_SPECIES_PAGE_SIZE,
} from '../usePokemonQueries';

vi.mock('@api', () => ({
  pokemonApi: {
    getPokemonSpecies: vi.fn(),
    getPokemonSpeciesDetail: vi.fn(),
  },
}));

const getPokemonSpeciesMock = pokemonApi.getPokemonSpecies as unknown as ReturnType<typeof vi.fn>;
const getPokemonSpeciesDetailMock = pokemonApi.getPokemonSpeciesDetail as unknown as ReturnType<
  typeof vi.fn
>;

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return { Wrapper, queryClient };
}

const samplePage = {
  count: 1,
  results: [
    {
      dexId: 6,
      slug: 'charizard',
      names: { ko: '리자몽', en: 'Charizard', ja: 'リザードン', zh: '喷火龙' },
      types: ['fire', 'flying'],
      spriteUrl: 'https://example/6.png',
    },
  ],
  isFirst: true,
  isLast: true,
};

const sampleSpecies = samplePage.results[0];

describe('usePokemonQueries', () => {
  beforeEach(() => {
    getPokemonSpeciesMock.mockReset();
    getPokemonSpeciesDetailMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useSearchPokemonSpecies', () => {
    it('query/type/page/limit 를 getPokemonSpecies 에 그대로 전달한다', async () => {
      getPokemonSpeciesMock.mockResolvedValue({ data: samplePage });
      const { Wrapper } = makeWrapper();

      const { result } = renderHook(() => useSearchPokemonSpecies('리자', 'fire', 2, 24), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(getPokemonSpeciesMock).toHaveBeenCalledWith('리자', 'fire', 2, 24);
      expect(result.current.data).toEqual(samplePage);
    });

    it('빈 query 는 undefined 로 변환해 전체 조회한다(query || undefined)', async () => {
      getPokemonSpeciesMock.mockResolvedValue({ data: samplePage });
      const { Wrapper } = makeWrapper();

      const { result } = renderHook(() => useSearchPokemonSpecies('', undefined), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      // 첫 인자(query)는 빈문자열이 아니라 undefined 여야 한다.
      expect(getPokemonSpeciesMock.mock.calls[0][0]).toBeUndefined();
      // type 미지정 → undefined.
      expect(getPokemonSpeciesMock.mock.calls[0][1]).toBeUndefined();
    });

    it('기본 page=0, limit=POKEMON_SPECIES_PAGE_SIZE(30) 로 호출한다', async () => {
      getPokemonSpeciesMock.mockResolvedValue({ data: samplePage });
      const { Wrapper } = makeWrapper();

      const { result } = renderHook(() => useSearchPokemonSpecies('pika'), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(getPokemonSpeciesMock).toHaveBeenCalledWith(
        'pika',
        undefined,
        0,
        POKEMON_SPECIES_PAGE_SIZE,
      );
      expect(POKEMON_SPECIES_PAGE_SIZE).toBe(30);
    });

    it('enabled=false 이면 queryFn 을 호출하지 않는다', async () => {
      const { Wrapper } = makeWrapper();
      const { result } = renderHook(
        () => useSearchPokemonSpecies('리자', undefined, 0, 30, false),
        { wrapper: Wrapper },
      );

      await new Promise((r) => {
        setTimeout(r, 30);
      });
      expect(getPokemonSpeciesMock).not.toHaveBeenCalled();
      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  describe('useGetPokemonSpecies', () => {
    it('slug 가 있으면 getPokemonSpeciesDetail(slug) 를 호출한다', async () => {
      getPokemonSpeciesDetailMock.mockResolvedValue({ data: sampleSpecies });
      const { Wrapper } = makeWrapper();

      const { result } = renderHook(() => useGetPokemonSpecies('charizard'), { wrapper: Wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(getPokemonSpeciesDetailMock).toHaveBeenCalledWith('charizard');
      expect(result.current.data).toEqual(sampleSpecies);
    });

    it('빈 slug 면 enabled:false 로 호출하지 않는다', async () => {
      const { Wrapper } = makeWrapper();
      const { result } = renderHook(() => useGetPokemonSpecies(''), { wrapper: Wrapper });

      await new Promise((r) => {
        setTimeout(r, 30);
      });
      expect(getPokemonSpeciesDetailMock).not.toHaveBeenCalled();
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('enabled=false 면 slug 가 있어도 호출하지 않는다', async () => {
      const { Wrapper } = makeWrapper();
      const { result } = renderHook(() => useGetPokemonSpecies('charizard', false), {
        wrapper: Wrapper,
      });

      await new Promise((r) => {
        setTimeout(r, 30);
      });
      expect(getPokemonSpeciesDetailMock).not.toHaveBeenCalled();
      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  describe('POKEMON_KEYS', () => {
    it('speciesSearch 는 모든 검색 파라미터를 안정적 키에 포함한다', () => {
      expect(POKEMON_KEYS.speciesSearch('리자', 'fire', 0, 30)).toEqual([
        'pokemon',
        'species',
        'search',
        '리자',
        'fire',
        0,
        30,
      ]);
    });

    it('speciesDetail(slug) 는 slug 를 키에 포함한다', () => {
      expect(POKEMON_KEYS.speciesDetail('charizard')).toEqual([
        'pokemon',
        'species',
        'detail',
        'charizard',
      ]);
    });
  });
});
