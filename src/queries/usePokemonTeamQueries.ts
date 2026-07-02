import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pokemonTeamApi } from '@api';
import type { PokemonTeamCreateRequest } from '@api/PokemonTeam';
import UserTokenUtil from '@utils/userTokenUtil';

/*
 * usePokemonTeamQueries — 포켓몬 팀(PokemonTeam) 서버 상태 훅.
 *
 * 생성(POST /pokemon-team) 은 Authorization optional + X-Session-ID 익명 소유 패턴
 * (ShortUrl/Blog 선례). axios 인터셉터는 토큰만 자동 첨부하고 X-Session-ID 는 첨부하지
 * 않으므로, 익명 저장을 위해 sessionId 를 호출부에서 수동으로 넘긴다(useSession 쿠키값).
 *
 * /me 는 @User 인증 필수(토큰 있을 때만 enabled), /share/{shareId} 는 공개(인증 불필요),
 * DELETE 는 본인 소유 검증.
 */

export const POKEMON_TEAM_KEYS = {
  all: ['pokemon-team'] as const,
  me: (page?: number, limit?: number) =>
    [...POKEMON_TEAM_KEYS.all, 'me', page ?? null, limit ?? null] as const,
  share: (shareId: string) => [...POKEMON_TEAM_KEYS.all, 'share', shareId] as const,
};

type CreatePokemonTeamArgs = {
  request: PokemonTeamCreateRequest;
  /** 익명 세션 식별자(useSession 쿠키값). 토큰 없을 때 익명 소유 기록에 사용. */
  sessionId?: string | null;
};

// 팀 생성: 로그인 여부와 무관하게 동작한다.
// 로그인 시 토큰을 보내 회원 소유로, 비로그인 시 X-Session-ID 로 익명 소유로 기록한다.
export const useCreatePokemonTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ request, sessionId }: CreatePokemonTeamArgs) => {
      const accessToken = UserTokenUtil.getAccessToken();
      const { data } = await pokemonTeamApi.postPokemonTeam(
        request,
        accessToken || undefined,
        sessionId || undefined,
      );
      return data;
    },
    onSuccess: () => {
      // 새로 만든 팀이 /me 목록에 반영되도록 캐시 무효화(로그인 사용자).
      queryClient.invalidateQueries({ queryKey: POKEMON_TEAM_KEYS.all });
    },
  });
};

// 내가 저장한 팀 목록: 로그인(@User) 필수. accessToken 이 있을 때만 호출한다.
export const useMyPokemonTeams = (token: string | null, page = 0, limit = 10) => {
  return useQuery({
    queryKey: POKEMON_TEAM_KEYS.me(page, limit),
    queryFn: async () => {
      const accessToken = token ?? UserTokenUtil.getAccessToken();
      const { data } = await pokemonTeamApi.getPokemonTeamMe(accessToken ?? '', page, limit);
      return data;
    },
    enabled: !!token,
  });
};

// 공유 팀 단건: shareId 로 누구나 조회(공개). 인증 불필요.
export const usePokemonTeamByShareId = (shareId: string, enabled = true) => {
  return useQuery({
    queryKey: POKEMON_TEAM_KEYS.share(shareId),
    queryFn: async () => {
      const { data } = await pokemonTeamApi.getPokemonTeamShare(shareId);
      return data;
    },
    enabled: enabled && !!shareId,
  });
};

// 내 팀 삭제: 본인 소유 검증(@User). 성공 시 /me 목록 무효화.
export const useDeletePokemonTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const accessToken = UserTokenUtil.getAccessToken();
      return pokemonTeamApi.deletePokemonTeamId(id, accessToken ?? '');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POKEMON_TEAM_KEYS.all });
    },
  });
};
