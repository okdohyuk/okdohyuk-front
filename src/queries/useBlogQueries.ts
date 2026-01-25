import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { blogApi } from '@api';
import UserTokenUtil from '@utils/userTokenUtil';

export const BLOG_KEYS = {
  all: ['blog'] as const,
  details: () => [...BLOG_KEYS.all, 'detail'] as const,
  detail: (urlSlug: string) => [...BLOG_KEYS.details(), urlSlug] as const,
  likes: (urlSlug: string) => [...BLOG_KEYS.detail(urlSlug), 'like'] as const,
};

export const useGetBlogLike = (urlSlug: string, sessionId?: string) => {
  return useQuery({
    queryKey: BLOG_KEYS.likes(urlSlug),
    queryFn: async () => {
      const accessToken = UserTokenUtil.getAccessToken();
      const { data } = await blogApi.getBlogLike(urlSlug, accessToken || undefined, sessionId);
      return data;
    },
    enabled: !!urlSlug,
  });
};

export const useToggleBlogLike = (urlSlug: string, sessionId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isLiked: boolean) => {
      const accessToken = UserTokenUtil.getAccessToken();
      if (isLiked) {
        return blogApi.deleteBlogLike(urlSlug, accessToken || undefined, sessionId);
      }
      return blogApi.postBlogLike(urlSlug, accessToken || undefined, sessionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOG_KEYS.likes(urlSlug) });
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
