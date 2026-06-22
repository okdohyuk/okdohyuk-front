/**
 * useSolveQueries: Solve 도메인 React Query 훅 단위 테스트.
 *
 * solveApi 와 UserTokenUtil 을 mock 하여 훅 동작만 검증한다(네트워크/서버 무관).
 * 핵심: queryKey 구성, enabled 게이트, mutation 성공 시 캐시 invalidate 대상,
 *       토큰 명시 전달(인터셉터 이중 안전과 별개로 훅이 auth() 를 명시 전달).
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import UserTokenUtil from '@utils/userTokenUtil';
import { solveApi } from '@api';
import {
  SOLVE_KEYS,
  SOLVE_QUESTIONS_PAGE_SIZE,
  SOLVE_ATTEMPTS_PAGE_SIZE,
  useSubjects,
  useSubjectDetail,
  useQuestions,
  useResumeAttempt,
  useStartAttempt,
  useSubmitAnswer,
  useFinishAttempt,
  useMyAttempts,
} from '../useSolveQueries';

vi.mock('@api', () => ({
  solveApi: {
    getSolveSubjects: vi.fn(),
    getSolveProgress: vi.fn(),
    getSolveSubjectDetail: vi.fn(),
    getSolveQuestions: vi.fn(),
    postSolveAttempt: vi.fn(),
    getSolveAttemptDetail: vi.fn(),
    postSolveSubmission: vi.fn(),
    postSolveAttemptFinish: vi.fn(),
    getSolveAttemptsMe: vi.fn(),
  },
}));

vi.mock('@utils/userTokenUtil', () => ({
  default: { getAccessToken: vi.fn() },
}));

const m = (fn: unknown) => fn as ReturnType<typeof vi.fn>;
const token = () => UserTokenUtil.getAccessToken as ReturnType<typeof vi.fn>;

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return { Wrapper, queryClient };
}

beforeEach(() => {
  Object.values(solveApi).forEach((fn) => m(fn).mockReset());
  token().mockReset();
  token().mockReturnValue('tok-1');
});

afterEach(() => vi.clearAllMocks());

describe('SOLVE_KEYS', () => {
  it('계층적 queryKey 를 안정적으로 구성한다', () => {
    expect(SOLVE_KEYS.all).toEqual(['solve']);
    expect(SOLVE_KEYS.subjects()).toEqual(['solve', 'subjects']);
    expect(SOLVE_KEYS.progress()).toEqual(['solve', 'progress']);
    expect(SOLVE_KEYS.subjectDetail('gyojeonghak')).toEqual(['solve', 'subject', 'gyojeonghak']);
    expect(SOLVE_KEYS.questions('s', '001', 0, 100)).toEqual([
      'solve',
      'questions',
      's',
      '001',
      0,
      100,
    ]);
    // unitId 미지정 시 null 정규화
    expect(SOLVE_KEYS.questions('s')).toEqual(['solve', 'questions', 's', null, null, null]);
    expect(SOLVE_KEYS.attempts()).toEqual(['solve', 'attempts']);
    expect(SOLVE_KEYS.attemptList(2, 20)).toEqual(['solve', 'attempts', 'list', 2, 20]);
    expect(SOLVE_KEYS.attempt(7)).toEqual(['solve', 'attempts', 'detail', 7]);
  });

  it('페이지 사이즈 상수는 서버 cap 과 일치한다', () => {
    expect(SOLVE_QUESTIONS_PAGE_SIZE).toBe(100);
    expect(SOLVE_ATTEMPTS_PAGE_SIZE).toBe(20);
  });
});

describe('useSubjects', () => {
  it('로그인 시 토큰을 전달해 getSolveSubjects 를 호출하고 data 반환', async () => {
    m(solveApi.getSolveSubjects).mockResolvedValue({ data: [{ slug: 'a' }] });
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useSubjects(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(solveApi.getSolveSubjects).toHaveBeenCalledWith('tok-1');
    expect(result.current.data).toEqual([{ slug: 'a' }]);
  });

  it('비회원(토큰 없음)이면 authorization 없이(undefined) 호출한다 — 공개 endpoint', async () => {
    token().mockReturnValue('');
    m(solveApi.getSolveSubjects).mockResolvedValue({ data: [{ slug: 'a' }] });
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useSubjects(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(solveApi.getSolveSubjects).toHaveBeenCalledWith(undefined);
  });

  it('enabled=false 면 호출하지 않는다', async () => {
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useSubjects(false), { wrapper: Wrapper });
    await new Promise((r) => {
      setTimeout(r, 30);
    });
    expect(solveApi.getSolveSubjects).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useSubjectDetail', () => {
  it('slug 가 빈 문자열이면 enabled:false (호출 안 함)', async () => {
    const { Wrapper } = makeWrapper();
    renderHook(() => useSubjectDetail(''), { wrapper: Wrapper });
    await new Promise((r) => {
      setTimeout(r, 30);
    });
    expect(solveApi.getSolveSubjectDetail).not.toHaveBeenCalled();
  });

  it('로그인 시 slug 가 있으면 (slug, token) 으로 호출', async () => {
    m(solveApi.getSolveSubjectDetail).mockResolvedValue({ data: { slug: 'x', units: [] } });
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useSubjectDetail('x'), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(solveApi.getSolveSubjectDetail).toHaveBeenCalledWith('x', 'tok-1');
  });

  it('비회원(토큰 없음)이면 (slug, undefined) 로 호출한다 — 공개 endpoint', async () => {
    token().mockReturnValue('');
    m(solveApi.getSolveSubjectDetail).mockResolvedValue({ data: { slug: 'x', units: [] } });
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useSubjectDetail('x'), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(solveApi.getSolveSubjectDetail).toHaveBeenCalledWith('x', undefined);
  });
});

describe('useQuestions', () => {
  it('(slug, token, unitId, page, limit) 순서로 호출한다', async () => {
    m(solveApi.getSolveQuestions).mockResolvedValue({ data: { results: [] } });
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useQuestions('s', '001', 1, 50), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(solveApi.getSolveQuestions).toHaveBeenCalledWith('s', 'tok-1', '001', 1, 50);
  });

  it('slug 없으면 호출 안 함', async () => {
    const { Wrapper } = makeWrapper();
    renderHook(() => useQuestions(''), { wrapper: Wrapper });
    await new Promise((r) => {
      setTimeout(r, 30);
    });
    expect(solveApi.getSolveQuestions).not.toHaveBeenCalled();
  });
});

describe('useResumeAttempt', () => {
  it('id 가 null 이면 enabled:false', async () => {
    const { Wrapper } = makeWrapper();
    renderHook(() => useResumeAttempt(null), { wrapper: Wrapper });
    await new Promise((r) => {
      setTimeout(r, 30);
    });
    expect(solveApi.getSolveAttemptDetail).not.toHaveBeenCalled();
  });

  it('id 가 0 이하면 enabled:false (신규 attempt 미확보)', async () => {
    const { Wrapper } = makeWrapper();
    renderHook(() => useResumeAttempt(0), { wrapper: Wrapper });
    await new Promise((r) => {
      setTimeout(r, 30);
    });
    expect(solveApi.getSolveAttemptDetail).not.toHaveBeenCalled();
  });

  it('유효 id 면 (id, token) 으로 상세 조회', async () => {
    m(solveApi.getSolveAttemptDetail).mockResolvedValue({ data: { attempt: { id: 5 } } });
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useResumeAttempt(5), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(solveApi.getSolveAttemptDetail).toHaveBeenCalledWith(5, 'tok-1');
  });
});

describe('useStartAttempt', () => {
  it('마운트 시 postSolveAttempt 로 시작/재개하고 결과를 data 로 노출한다 (query)', async () => {
    m(solveApi.postSolveAttempt).mockResolvedValue({ data: { id: 1 } });
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(
      () => useStartAttempt({ subjectSlug: 's', mode: 'full' } as never),
      { wrapper: Wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(solveApi.postSolveAttempt).toHaveBeenCalledWith('tok-1', {
      subjectSlug: 's',
      mode: 'full',
    });
    expect(result.current.data).toEqual({ id: 1 });
  });
});

describe('useSubmitAnswer', () => {
  it('성공 시 attempt + progress 캐시를 invalidate 한다', async () => {
    m(solveApi.postSolveSubmission).mockResolvedValue({ data: { isCorrect: true } });
    const { Wrapper, queryClient } = makeWrapper();
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useSubmitAnswer(42), { wrapper: Wrapper });
    act(() => {
      result.current.mutate({ questionId: 1, index: 0, choice: 2 } as never);
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(solveApi.postSolveSubmission).toHaveBeenCalledWith(42, 'tok-1', {
      questionId: 1,
      index: 0,
      choice: 2,
    });
    expect(spy).toHaveBeenCalledWith({ queryKey: SOLVE_KEYS.attempt(42) });
    expect(spy).toHaveBeenCalledWith({ queryKey: SOLVE_KEYS.progress() });
  });
});

describe('useFinishAttempt', () => {
  it('성공 시 attempt + attempts + progress 를 invalidate 한다', async () => {
    m(solveApi.postSolveAttemptFinish).mockResolvedValue({ data: { total: 5, correct: 3 } });
    const { Wrapper, queryClient } = makeWrapper();
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useFinishAttempt(7), { wrapper: Wrapper });
    act(() => {
      result.current.mutate();
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(solveApi.postSolveAttemptFinish).toHaveBeenCalledWith(7, 'tok-1');
    expect(spy).toHaveBeenCalledWith({ queryKey: SOLVE_KEYS.attempt(7) });
    expect(spy).toHaveBeenCalledWith({ queryKey: SOLVE_KEYS.attempts() });
    expect(spy).toHaveBeenCalledWith({ queryKey: SOLVE_KEYS.progress() });
  });
});

describe('useMyAttempts', () => {
  it('(token, page, limit) 으로 호출하고 default limit 은 20', async () => {
    m(solveApi.getSolveAttemptsMe).mockResolvedValue({ data: { results: [] } });
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useMyAttempts(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(solveApi.getSolveAttemptsMe).toHaveBeenCalledWith('tok-1', 0, SOLVE_ATTEMPTS_PAGE_SIZE);
  });
});
