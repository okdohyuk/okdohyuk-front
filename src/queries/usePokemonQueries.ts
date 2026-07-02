import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { pokemonApi } from '@api';
import type { PokemonTypeEnum } from '@api/Pokemon';

/*
 * usePokemonQueries — Pokemon 종(species) 서버 상태 훅.
 *
 * 두 endpoint 모두 공개(인증 불필요): GET /pokemon/species(검색·페이징),
 * GET /pokemon/species/{slug}(단건). optionalAuth 조차 불필요 — 토큰을 보내지 않으며
 * axios 인터셉터가 토큰이 있으면 자동 첨부하지만 서버는 무시한다(정적 메타데이터).
 * 디바운스는 호출 컴포넌트(검색 입력)에서 처리하고, 여기서는 안정화된 query 만 받는다.
 */

export const POKEMON_KEYS = {
  all: ['pokemon'] as const,
  species: () => [...POKEMON_KEYS.all, 'species'] as const,
  speciesSearch: (query?: string, type?: PokemonTypeEnum, page?: number, limit?: number) =>
    [
      ...POKEMON_KEYS.species(),
      'search',
      query ?? null,
      type ?? null,
      page ?? null,
      limit ?? null,
    ] as const,
  speciesDetail: (slug: string) => [...POKEMON_KEYS.species(), 'detail', slug] as const,
};

// 서버 cap 과 동일(spec: limit max 100).
export const POKEMON_SPECIES_PAGE_SIZE = 30;

// 종 검색(다국어 부분검색 + type 필터 + 페이징). 공개 endpoint — 비회원도 200.
// query/type 가 비면 undefined 로 넘겨 해당 필터를 적용하지 않는다(전체).
export const useSearchPokemonSpecies = (
  query?: string,
  type?: PokemonTypeEnum,
  page = 0,
  limit = POKEMON_SPECIES_PAGE_SIZE,
  enabled = true,
) =>
  useQuery({
    queryKey: POKEMON_KEYS.speciesSearch(query, type, page, limit),
    queryFn: async () => {
      const { data } = await pokemonApi.getPokemonSpecies(query || undefined, type, page, limit);
      return data;
    },
    enabled,
    placeholderData: keepPreviousData,
  });

// 종 단건(slug). 공개 endpoint — 미존재 시 404.
export const useGetPokemonSpecies = (slug: string, enabled = true) =>
  useQuery({
    queryKey: POKEMON_KEYS.speciesDetail(slug),
    queryFn: async () => {
      const { data } = await pokemonApi.getPokemonSpeciesDetail(slug);
      return data;
    },
    enabled: enabled && !!slug,
  });
