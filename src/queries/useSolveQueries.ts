import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { solveApi } from '@api';
import type { SolveCreateAttemptRequest, SolveSubmissionRequest } from '@api/Solve';
import UserTokenUtil from '@utils/userTokenUtil';

/*
 * useSolveQueries — Solve(문제풀이) 서버 상태 훅.
 *
 * 공개(비회원 허용): getSolveSubjects, getSolveSubjectDetail — 목록/단원 메타. 토큰 optional.
 * 보호(로그인 필수): progress / questions / attempts 계열. authorization 인자로 토큰 전달.
 * 어느 경우든 axios 인터셉터가 Authorization 헤더 주입 + 401 refresh 를 한 번 더 보장한다
 * (ShortUrl/BlogReply 동일 패턴). 단, 보호 훅을 비회원이 호출하면 401→logoutAndLogin 으로
 * 로그인 리다이렉트되므로, 호출 측에서 enabled(로그인 여부)로 게이팅해야 한다(useSolveProgress).
 * 채점은 서버가 수행하므로 프론트는 응답(SolveSubmissionResult/SolveQuizResult)을 그대로 사용한다.
 */

export const SOLVE_KEYS = {
  all: ['solve'] as const,
  subjects: () => [...SOLVE_KEYS.all, 'subjects'] as const,
  progress: () => [...SOLVE_KEYS.all, 'progress'] as const,
  subjectDetail: (slug: string) => [...SOLVE_KEYS.all, 'subject', slug] as const,
  questions: (slug: string, unitId?: string, page?: number, limit?: number) =>
    [...SOLVE_KEYS.all, 'questions', slug, unitId ?? null, page ?? null, limit ?? null] as const,
  attempts: () => [...SOLVE_KEYS.all, 'attempts'] as const,
  attemptList: (page?: number, limit?: number) =>
    [...SOLVE_KEYS.attempts(), 'list', page ?? null, limit ?? null] as const,
  attempt: (id: number) => [...SOLVE_KEYS.attempts(), 'detail', id] as const,
};

// 서버 cap 과 동일(spec: questions/attempts limit max 100).
export const SOLVE_QUESTIONS_PAGE_SIZE = 100;
export const SOLVE_ATTEMPTS_PAGE_SIZE = 20;

const auth = () => UserTokenUtil.getAccessToken();
// 공개(비회원 허용) endpoint 용. 토큰이 없으면 빈 문자열 대신 undefined 를 넘겨
// Authorization 헤더 자체를 보내지 않는다(빈 헤더 방지). 토큰이 있으면 그대로 동봉한다.
const optionalAuth = () => auth() || undefined;

// 과목 목록(사용자 무관 메타). 공개 endpoint — 비회원도 200(메타데이터만).
export const useSubjects = (enabled = true) =>
  useQuery({
    queryKey: SOLVE_KEYS.subjects(),
    queryFn: async () => {
      const { data } = await solveApi.getSolveSubjects(optionalAuth());
      return data;
    },
    enabled,
  });

// 호출자별 과목 진행률(서버 derived). subjects 와 분리해 메타 캐시성 유지.
export const useSolveProgress = (enabled = true) =>
  useQuery({
    queryKey: SOLVE_KEYS.progress(),
    queryFn: async () => {
      const { data } = await solveApi.getSolveProgress(auth());
      return data;
    },
    enabled,
  });

// 과목 상세(단원 + 각 단원 questionCount). 공개 endpoint — 비회원도 200.
export const useSubjectDetail = (slug: string, enabled = true) =>
  useQuery({
    queryKey: SOLVE_KEYS.subjectDetail(slug),
    queryFn: async () => {
      const { data } = await solveApi.getSolveSubjectDetail(slug, optionalAuth());
      return data;
    },
    enabled: enabled && !!slug,
  });

// 공개 문항 페이지(정답/해설 미포함). pilgi 대비 페이지네이션.
export const useQuestions = (
  slug: string,
  unitId?: string,
  page = 0,
  limit = SOLVE_QUESTIONS_PAGE_SIZE,
  enabled = true,
) =>
  useQuery({
    queryKey: SOLVE_KEYS.questions(slug, unitId, page, limit),
    queryFn: async () => {
      const { data } = await solveApi.getSolveQuestions(slug, auth(), unitId, page, limit);
      return data;
    },
    enabled: enabled && !!slug,
    placeholderData: keepPreviousData,
  });

// 시도 시작/재개: in_progress 있으면 서버가 재사용(200), 없으면 생성(201). 둘 다 SolveAttempt.
// POST 지만 멱등(서버가 동일 scope in_progress 재사용)이라 useQuery 로 모델링한다.
// ⚠️ mutation 을 마운트 useEffect 에서 호출하면 StrictMode 가 클라이언트 네비게이션 시
//    마운트 effect 를 setup→cleanup→setup 으로 2회 호출하면서 in-flight mutation 이 고아가 돼
//    observer 가 영구 pending → "준비 중"에 멈추는 버그가 있었다(전체 새로고침=hydration 은
//    effect 1회라 무사). query 는 StrictMode/동시성에 안전하다.
//    queryKey 는 attempts() 하위가 아닌 별도 네임스페이스('start-attempt')라 제출/완료의
//    invalidateQueries(attempts()) prefix 에 걸리지 않아 풀이 중 재-POST(중복 시도)가 없다.
export const useStartAttempt = (params: SolveCreateAttemptRequest, enabled = true) =>
  useQuery({
    queryKey: [
      ...SOLVE_KEYS.all,
      'start-attempt',
      params.subjectSlug,
      params.unitId ?? null,
      params.mode,
      params.sourceAttemptId ?? null,
    ],
    queryFn: async () => {
      const { data } = await solveApi.postSolveAttempt(auth(), params);
      return data;
    },
    enabled,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

// 이어풀기: 시도 헤더 + 이전 제출 결과(복원). attemptId 가 유효할 때만.
export const useResumeAttempt = (id: number | null, enabled = true) =>
  useQuery({
    queryKey: id != null ? SOLVE_KEYS.attempt(id) : SOLVE_KEYS.attempts(),
    queryFn: async () => {
      const { data } = await solveApi.getSolveAttemptDetail(id as number, auth());
      return data;
    },
    enabled: enabled && id != null && id > 0,
  });

// 문항 제출(서버 채점). 멱등 재제출은 서버가 기존 결과 반환. 성공 시 attempt/progress 무효화.
export const useSubmitAnswer = (attemptId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SolveSubmissionRequest) => {
      const { data } = await solveApi.postSolveSubmission(attemptId, auth(), payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOLVE_KEYS.attempt(attemptId) });
      queryClient.invalidateQueries({ queryKey: SOLVE_KEYS.progress() });
    },
  });
};

// 시도 완료 처리 + 결과 집계. 이미 완료된 시도는 서버가 현재 결과 반환(멱등).
export const useFinishAttempt = (attemptId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await solveApi.postSolveAttemptFinish(attemptId, auth());
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOLVE_KEYS.attempt(attemptId) });
      queryClient.invalidateQueries({ queryKey: SOLVE_KEYS.attempts() });
      queryClient.invalidateQueries({ queryKey: SOLVE_KEYS.progress() });
    },
  });
};

// 내 시도 목록(기록).
export const useMyAttempts = (page = 0, limit = SOLVE_ATTEMPTS_PAGE_SIZE, enabled = true) =>
  useQuery({
    queryKey: SOLVE_KEYS.attemptList(page, limit),
    queryFn: async () => {
      const { data } = await solveApi.getSolveAttemptsMe(auth(), page, limit);
      return data;
    },
    enabled,
    placeholderData: keepPreviousData,
  });
