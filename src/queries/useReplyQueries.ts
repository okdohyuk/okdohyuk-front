import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogReplyApi } from '@api';
import UserTokenUtil from '@utils/userTokenUtil';

export const REPLY_KEYS = {
  all: ['blogReply'] as const,
  lists: () => [...REPLY_KEYS.all, 'list'] as const,
  list: (urlSlug: string) => [...REPLY_KEYS.lists(), urlSlug] as const,
};

export const useGetBlogReplies = (urlSlug: string) => {
  return useInfiniteQuery({
    queryKey: REPLY_KEYS.list(urlSlug),
    queryFn: async ({ pageParam = 0 }) => {
      const { data } = await blogReplyApi.getBlogReply(urlSlug, pageParam, 20);
      return data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length : undefined;
    },
    enabled: !!urlSlug,
  });
};

export const useCreateBlogReply = (urlSlug: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string }) => {
      const accessToken = UserTokenUtil.getAccessToken();
      return blogReplyApi.postBlogReply(urlSlug, accessToken, {
        urlSlug,
        content,
        parentId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REPLY_KEYS.list(urlSlug) });
    },
  });
};

export const useUpdateBlogReply = (urlSlug: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const accessToken = UserTokenUtil.getAccessToken();
      return blogReplyApi.putBlogReply(id, accessToken, {
        urlSlug,
        content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REPLY_KEYS.list(urlSlug) });
    },
  });
};

export const useDeleteBlogReply = (urlSlug: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const accessToken = UserTokenUtil.getAccessToken();
      return blogReplyApi.deleteBlogReply(id, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REPLY_KEYS.list(urlSlug) });
    },
  });
};

export const useReportBlogReply = () => {
  return useMutation({
    mutationFn: async ({
      replyId,
      reason,
      description,
    }: {
      replyId: string;
      reason: any;
      description?: string;
    }) => {
      const accessToken = UserTokenUtil.getAccessToken();
      return blogReplyApi.postBlogReplyReport(replyId, accessToken, {
        reason,
        description,
      });
    },
  });
};
