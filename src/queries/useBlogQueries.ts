import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { blogApi } from '@api';
import UserTokenUtil from '@utils/userTokenUtil';

export const BLOG_KEYS = {
  all: ['blog'] as const,
  details: () => [...BLOG_KEYS.all, 'detail'] as const,
  detail: (urlSlug: string) => [...BLOG_KEYS.details(), urlSlug] as const,
  // 좋아요 여부(isLiked)는 "호출 주체"별로 다른 값이므로 주체를 키에 포함한다.
  // SessionId 쿠키는 로그인/로그아웃과 무관하게 유지되므로 sessionId 만으로는
  // 같은 브라우저에서 A 로그아웃 → B 로그인 시 A 의 isLiked 가 B 에게 그대로 보인다.
  // 따라서 로그인 사용자는 user id 를, 비로그인은 sessionId 를 판별자로 쓴다.
  likes: (urlSlug: string, viewerId?: string) =>
    [...BLOG_KEYS.detail(urlSlug), 'like', viewerId ?? null] as const,
};

// 좋아요 캐시의 주체 판별자. 로그인 상태면 user id, 아니면 익명 세션 id.
const likeViewerId = (sessionId?: string) => UserTokenUtil.getUserInfo()?.id ?? sessionId;

export const useGetBlogLike = (urlSlug: string, sessionId?: string) => {
  const viewerId = likeViewerId(sessionId);
  return useQuery({
    queryKey: BLOG_KEYS.likes(urlSlug, viewerId),
    queryFn: async () => {
      const accessToken = UserTokenUtil.getAccessToken();
      const { data } = await blogApi.getBlogLike(urlSlug, accessToken || undefined, sessionId);
      return data;
    },
    // 주체가 확정되기 전(익명 세션 발급 대기)에 조회하면 세션 확정 후 키가 바뀌어
    // 같은 요청이 두 번 나가므로, viewerId 가 정해진 뒤에만 조회한다.
    enabled: !!urlSlug && !!viewerId,
  });
};

export const useToggleBlogLike = (urlSlug: string, sessionId?: string) => {
  const queryClient = useQueryClient();
  const viewerId = likeViewerId(sessionId);

  return useMutation({
    mutationFn: async (isLiked: boolean) => {
      const accessToken = UserTokenUtil.getAccessToken();
      if (isLiked) {
        return blogApi.deleteBlogLike(urlSlug, accessToken || undefined, sessionId);
      }
      return blogApi.postBlogLike(urlSlug, accessToken || undefined, sessionId);
    },
    onSuccess: ({ data }) => {
      // 토글 응답에 최신 likeCount/isLiked 가 담겨 오므로 재요청 없이 캐시에 직접 반영한다.
      queryClient.setQueryData(BLOG_KEYS.likes(urlSlug, viewerId), data);
    },
  });
};

export const useGetRecommendedPosts = (urlSlug: string) => {
  return useQuery({
    queryKey: BLOG_KEYS.detail(urlSlug),
    queryFn: async () => {
      const { data } = await blogApi.getBlogUrlSlugRecommended(urlSlug);
      return data;
    },
    enabled: !!urlSlug,
  });
};

export const usePostBlogView = () => {
  return useMutation({
    mutationFn: async ({ urlSlug, sessionId }: { urlSlug: string; sessionId: string }) => {
      const accessToken = UserTokenUtil.getAccessToken();
      return blogApi.postBlogView(urlSlug, accessToken || undefined, sessionId);
    },
  });
};
