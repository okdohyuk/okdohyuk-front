import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { favoriteApi } from '@api';
import type { Favorite, FavoriteList } from '@api/Favorite';
import UserTokenUtil from '@utils/userTokenUtil';
import { getFavoriteErrorCode, FAVORITE_ERROR_CODE } from '@libs/client/favoriteError';

/*
 * useFavoriteQueries — 사용자 멀티툴 즐겨찾기(Favorite) 서버 상태 훅.
 *
 * 4개 엔드포인트 전부 로그인 필수(@User)다. PokemonTeam 의 "인증 필요 API" 패턴을 그대로 따라
 * `UserTokenUtil.getAccessToken()` 결과를 Authorization 인자로 넘긴다.
 * (axios 요청 인터셉터도 토큰을 붙이지만, 생성 클라이언트가 authorization 을 required 파라미터로
 *  요구하므로 호출부에서 명시적으로 전달한다.)
 *
 * 즐겨찾기 토글/순서 변경은 즉시 반응해야 하는 UI 라 전부 낙관적 업데이트로 처리하고,
 * 실패 시 onMutate 에서 찍어둔 스냅샷으로 롤백한다.
 */

export const FAVORITE_KEYS = {
  all: ['favorite'] as const,
  list: () => [...FAVORITE_KEYS.all, 'list'] as const,
};

const EMPTY_LIST: FavoriteList = { count: 0, results: [] };

/** sortOrder 를 0..n-1 로 다시 매긴다. 서버가 DELETE/PUT order 후 수행하는 재정렬과 동일한 규칙. */
const resequence = (results: Favorite[]): Favorite[] =>
  results.map((favorite, index) => ({ ...favorite, sortOrder: index }));

const toList = (results: Favorite[]): FavoriteList => ({
  count: results.length,
  results: resequence(results),
});

/**
 * 내 즐겨찾기 전체 목록.
 * 상한이 100개라 페이지네이션이 없고, 홈/메뉴 양쪽이 같은 캐시를 공유한다
 * (도구 페이지 토글이 삭제할 때 필요한 `toolLink → id` 조회를 이 캐시로 해결).
 */
export const useFavorites = (enabled = true) =>
  useQuery({
    queryKey: FAVORITE_KEYS.list(),
    queryFn: async () => {
      const { data } = await favoriteApi.getFavorite(UserTokenUtil.getAccessToken());
      return data;
    },
    enabled,
    // 홈과 /menu 를 오갈 때마다 재요청하지 않도록 짧게 신선도를 유지한다.
    staleTime: 30_000,
  });

type FavoriteMutationContext = {
  previous: FavoriteList | undefined;
};

const snapshot = (queryClient: ReturnType<typeof useQueryClient>): FavoriteList | undefined =>
  queryClient.getQueryData<FavoriteList>(FAVORITE_KEYS.list());

/**
 * 즐겨찾기 추가.
 * 낙관적으로 목록 맨 뒤에 임시 항목(음수 id)을 붙인다. 임시 id 는 실제 삭제에 쓰이면 안 되므로
 * 성공/실패와 무관하게 onSettled 에서 서버 값으로 무효화한다.
 */
export const useAddFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation<Favorite, unknown, string, FavoriteMutationContext>({
    mutationFn: async (toolLink: string) => {
      const { data } = await favoriteApi.postFavorite(UserTokenUtil.getAccessToken(), { toolLink });
      return data;
    },
    onMutate: async (toolLink) => {
      await queryClient.cancelQueries({ queryKey: FAVORITE_KEYS.list() });
      const previous = snapshot(queryClient);

      if (previous) {
        const optimistic: Favorite = {
          // 서버 PK 는 항상 양수이므로 음수 id 는 "아직 확정되지 않은 항목" 표식이 된다.
          id: -Date.now(),
          toolLink,
          sortOrder: previous.results.length,
          createdAt: new Date().toISOString(),
        };
        queryClient.setQueryData<FavoriteList>(
          FAVORITE_KEYS.list(),
          toList([...previous.results, optimistic]),
        );
      }

      return { previous };
    },
    onError: (_error, _toolLink, context) => {
      if (context?.previous) {
        queryClient.setQueryData(FAVORITE_KEYS.list(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITE_KEYS.all });
    },
  });
};

/**
 * 즐겨찾기 삭제.
 * 서버가 삭제 후 잔여 항목의 sortOrder 를 0..n-1 로 재정렬하므로,
 * 낙관적 업데이트에서도 동일하게 재정렬한 뒤 최종적으로 무효화한다.
 */
export const useDeleteFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, number, FavoriteMutationContext>({
    mutationFn: async (id: number) => {
      await favoriteApi.deleteFavoriteId(id, UserTokenUtil.getAccessToken());
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: FAVORITE_KEYS.list() });
      const previous = snapshot(queryClient);

      if (previous) {
        queryClient.setQueryData<FavoriteList>(
          FAVORITE_KEYS.list(),
          toList(previous.results.filter((favorite) => favorite.id !== id)),
        );
      }

      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(FAVORITE_KEYS.list(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITE_KEYS.all });
    },
  });
};

/**
 * 즐겨찾기 순서 일괄 변경.
 * 백엔드는 "보유 전체 집합"을 요구한다 — 개수가 하나라도 다르거나 id 가 중복되면 400(code 59).
 * 캐시가 stale 이면 400 이 나므로, 그 경우에만 목록을 강제 재조회해 사용자에게 최신 상태를 보여준다.
 * 성공 응답은 재정렬된 전체 목록이라 그대로 캐시에 기록한다.
 */
export const useReorderFavorites = () => {
  const queryClient = useQueryClient();

  return useMutation<FavoriteList, unknown, number[], FavoriteMutationContext>({
    mutationFn: async (favoriteIds: number[]) => {
      const { data } = await favoriteApi.putFavoriteOrder(UserTokenUtil.getAccessToken(), {
        favoriteIds,
      });
      return data;
    },
    onMutate: async (favoriteIds) => {
      await queryClient.cancelQueries({ queryKey: FAVORITE_KEYS.list() });
      const previous = snapshot(queryClient);

      if (previous) {
        const byId = new Map(previous.results.map((favorite) => [favorite.id, favorite]));
        const reordered = favoriteIds
          .map((id) => byId.get(id))
          .filter((favorite): favorite is Favorite => favorite !== undefined);

        // 요청 집합이 캐시와 어긋나면 낙관적 반영을 포기한다(서버 400 으로 드러날 상황).
        if (reordered.length === previous.results.length) {
          queryClient.setQueryData<FavoriteList>(FAVORITE_KEYS.list(), toList(reordered));
        }
      }

      return { previous };
    },
    onError: (error, _favoriteIds, context) => {
      if (context?.previous) {
        queryClient.setQueryData(FAVORITE_KEYS.list(), context.previous);
      }
      // code 59 = 내 목록이 이미 다른 곳에서 바뀌었다는 뜻. 롤백만으로는 여전히 stale 이라 재조회한다.
      if (getFavoriteErrorCode(error) === FAVORITE_ERROR_CODE.ORDER_MISMATCH) {
        queryClient.invalidateQueries({ queryKey: FAVORITE_KEYS.all });
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData<FavoriteList>(FAVORITE_KEYS.list(), data);
    },
  });
};

/** 목록 캐시가 없을 때도 안전하게 쓸 수 있는 빈 목록 상수. */
export const EMPTY_FAVORITE_LIST = EMPTY_LIST;
