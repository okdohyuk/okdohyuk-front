import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guestbookApi } from '@api';
import { GuestbookReportRequestReasonEnum } from '@api/Guestbook';
import UserTokenUtil from '@utils/userTokenUtil';

const GUESTBOOK_PAGE_SIZE = 20;

export const GUESTBOOK_KEYS = {
  all: ['guestbook'] as const,
  lists: () => [...GUESTBOOK_KEYS.all, 'list'] as const,
};

export const useGetGuestbooks = () => {
  return useInfiniteQuery({
    queryKey: GUESTBOOK_KEYS.lists(),
    queryFn: async ({ pageParam = 0 }) => {
      const { data } = await guestbookApi.getGuestbook(pageParam, GUESTBOOK_PAGE_SIZE);
      return data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === GUESTBOOK_PAGE_SIZE ? allPages.length : undefined;
    },
  });
};

export const useCreateGuestbook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      content,
      nickname,
      deletePassword,
    }: {
      content: string;
      nickname?: string;
      deletePassword?: string;
    }) => {
      const accessToken = UserTokenUtil.getAccessToken();
      return guestbookApi.postGuestbook(
        { content, nickname, deletePassword },
        accessToken || undefined,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GUESTBOOK_KEYS.lists() });
    },
  });
};

export const useDeleteGuestbook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, deletePassword }: { id: string; deletePassword?: string }) => {
      const accessToken = UserTokenUtil.getAccessToken();
      return guestbookApi.deleteGuestbook(id, accessToken || undefined, { deletePassword });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GUESTBOOK_KEYS.lists() });
    },
  });
};

export const useReportGuestbook = () => {
  return useMutation({
    mutationFn: async ({
      id,
      reason,
      description,
    }: {
      id: string;
      reason: GuestbookReportRequestReasonEnum;
      description?: string;
    }) => {
      const accessToken = UserTokenUtil.getAccessToken();
      return guestbookApi.postGuestbookReport(id, accessToken, { reason, description });
    },
  });
};
