import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { shortUrlApi } from '@api';
import type { ShortUrlCreateRequest, ShortUrlExpireUpdateRequest } from '@api/ShortUrl';
import UserTokenUtil from '@utils/userTokenUtil';

export const SHORT_URL_KEYS = {
  all: ['short-url'] as const,
  me: () => [...SHORT_URL_KEYS.all, 'me'] as const,
};

// 단축 URL 생성: 로그인 여부와 무관하게 동작한다. 로그인 시 토큰을 함께 보내 소유자로 기록한다.
export const useCreateShortUrl = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ShortUrlCreateRequest) => {
      const accessToken = UserTokenUtil.getAccessToken();
      const { data } = await shortUrlApi.postShortUrl(payload, accessToken || undefined);
      return data;
    },
    onSuccess: () => {
      // 새로 생성한 URL 이 /me 목록에 반영되도록 캐시 무효화.
      queryClient.invalidateQueries({ queryKey: SHORT_URL_KEYS.me() });
    },
  });
};

// 내가 만든 단축 URL 목록: accessToken 이 있을 때만 호출한다.
export const useMyShortUrls = (accessToken: string | null) => {
  return useQuery({
    queryKey: SHORT_URL_KEYS.me(),
    queryFn: async () => {
      const token = accessToken ?? UserTokenUtil.getAccessToken();
      const { data } = await shortUrlApi.getShortUrlMe(token);
      return data;
    },
    enabled: !!accessToken,
  });
};

// 만료 연장/변경: 새 만료 시각은 요청 시점 기준으로 재계산된다.
export const useUpdateShortUrlExpiration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      code,
      request,
    }: {
      code: string;
      request: ShortUrlExpireUpdateRequest;
    }) => {
      const accessToken = UserTokenUtil.getAccessToken();
      const { data } = await shortUrlApi.patchShortUrlCode(code, accessToken, request);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHORT_URL_KEYS.me() });
    },
  });
};

export const useDeleteShortUrl = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      const accessToken = UserTokenUtil.getAccessToken();
      return shortUrlApi.deleteShortUrlCode(code, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SHORT_URL_KEYS.me() });
    },
  });
};
