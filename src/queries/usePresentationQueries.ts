import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { presentationApi } from '@api';
import type {
  Presentation,
  PresentationCreateRequest,
  PresentationSessionCommandRequest,
  PresentationUpdateRequest,
} from '@api/Presentation';
import UserTokenUtil from '@utils/userTokenUtil';

export const PRESENTATION_KEYS = {
  all: ['presentation'] as const,
  list: (page: number, limit: number) => [...PRESENTATION_KEYS.all, 'list', page, limit] as const,
  detail: (id: number) => [...PRESENTATION_KEYS.all, 'detail', id] as const,
  session: (id: number) => [...PRESENTATION_KEYS.all, 'session', id] as const,
  activeSession: () => [...PRESENTATION_KEYS.all, 'active-session'] as const,
};

const resolveToken = (token?: string | null) => token ?? UserTokenUtil.getAccessToken() ?? '';

export const useMyPresentations = (token: string | null, page = 0, limit = 20) =>
  useQuery({
    queryKey: PRESENTATION_KEYS.list(page, limit),
    queryFn: async () => {
      const { data } = await presentationApi.getPresentationMe(resolveToken(token), page, limit);
      return data;
    },
    enabled: Boolean(token),
  });

export const usePresentation = (id: number | null, token?: string | null) =>
  useQuery({
    queryKey: id == null ? PRESENTATION_KEYS.all : PRESENTATION_KEYS.detail(id),
    queryFn: async () => {
      const { data } = await presentationApi.getPresentationId(id as number, resolveToken(token));
      return data;
    },
    enabled: id != null && Boolean(token ?? UserTokenUtil.getAccessToken()),
  });

export const useCreatePresentation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: PresentationCreateRequest) => {
      const { data } = await presentationApi.postPresentation(resolveToken(), request);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRESENTATION_KEYS.all });
    },
  });
};

export const useUpdatePresentation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, request }: { id: number; request: PresentationUpdateRequest }) => {
      const { data } = await presentationApi.putPresentationId(id, resolveToken(), request);
      return data;
    },
    onSuccess: (presentation: Presentation) => {
      queryClient.setQueryData(PRESENTATION_KEYS.detail(presentation.id), presentation);
      queryClient.invalidateQueries({ queryKey: PRESENTATION_KEYS.all });
    },
  });
};

export const useDeletePresentation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await presentationApi.deletePresentationId(id, resolveToken());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRESENTATION_KEYS.all });
    },
  });
};

export const useStartPresentationSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (presentationId: number) => {
      const { data } = await presentationApi.postPresentationIdSessions(
        presentationId,
        resolveToken(),
      );
      return data;
    },
    onSuccess: (session) => {
      queryClient.setQueryData(PRESENTATION_KEYS.session(session.id), session);
      queryClient.setQueryData(PRESENTATION_KEYS.activeSession(), session);
      queryClient.invalidateQueries({ queryKey: PRESENTATION_KEYS.all });
    },
  });
};

export const usePresentationSession = (sessionId: number | null, token?: string | null) =>
  useQuery({
    queryKey: sessionId == null ? PRESENTATION_KEYS.all : PRESENTATION_KEYS.session(sessionId),
    queryFn: async () => {
      const { data } = await presentationApi.getPresentationSessionsSessionId(
        sessionId as number,
        resolveToken(token),
      );
      return data;
    },
    enabled: sessionId != null && Boolean(token ?? UserTokenUtil.getAccessToken()),
    refetchInterval: 1000,
  });

export const useActivePresentationSession = (token: string | null) =>
  useQuery({
    queryKey: PRESENTATION_KEYS.activeSession(),
    queryFn: async () => {
      const { data } = await presentationApi.getPresentationSessionsActive(resolveToken(token));
      return data;
    },
    enabled: Boolean(token),
    refetchInterval: 1000,
  });

export const useSendPresentationCommand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sessionId,
      request,
    }: {
      sessionId: number;
      request: PresentationSessionCommandRequest;
    }) => {
      const { data } = await presentationApi.postPresentationSessionsSessionIdCommands(
        sessionId,
        resolveToken(),
        request,
      );
      return data;
    },
    onSuccess: (session) => {
      queryClient.setQueryData(PRESENTATION_KEYS.session(session.id), session);
      queryClient.setQueryData(PRESENTATION_KEYS.activeSession(), session);
    },
  });
};
