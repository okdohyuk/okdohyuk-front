import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogReplyApi } from '@api';
import UserTokenUtil from '@utils/userTokenUtil';

/*
 * 댓글 작성/수정/삭제/신고는 모두 로그인 필수 endpoint 라, 생성된 클라이언트의 authorization 이
 * required(string) 다. 따라서 useSolveQueries 의 optionalAuth 처럼 undefined 를 넘길 수 없다.
 * (as 단언으로 우회하지 않는다.)
 * getAccessToken() 은 "Bearer " 프리픽스를 포함하며, 비로그인 시 빈 문자열을 반환한다.
 * 이 경우 백엔드는 401 로 응답하는데, 응답 인터셉터의 분기 기준은 code 가 아니라 "갱신 수단 보유 여부"다.
 * 비로그인 사용자는 access/refresh 토큰이 모두 없으므로 전역 로그아웃 없이 그대로 reject 되고,
 * 호출 측에서 getErrorMessage 로 안내할 수 있다.
 */
const auth = () => UserTokenUtil.getAccessToken();

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
      const accessToken = auth();
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
      const accessToken = auth();
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
      const accessToken = auth();
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
      const accessToken = auth();
      return blogReplyApi.postBlogReplyReport(replyId, accessToken, {
        reason,
        description,
      });
    },
  });
};
