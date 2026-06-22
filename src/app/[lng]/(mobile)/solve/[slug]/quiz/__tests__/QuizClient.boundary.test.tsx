/* eslint-disable react/require-default-props */

/**
 * QuizClient 다중 페이지 경계 회귀 테스트 (FE-1).
 *
 * full 모드는 문항을 페이지네이션(limit 100)으로 점진 로딩한다. "마지막 문항(isLast)"
 * 판정과 "결과 보기" 노출은 *현재 로드된 문항 수*가 아니라 *시도 전체 문항 수(attempt.total)*
 * 기준이어야 한다. 과거 회귀: pilgi(total 1,786) 1페이지(100문항)만 로드된 상태에서
 * index 99 가 곧 "결과 보기"로 오판정 → 100번째에서 시도가 조기 종료됐다.
 *
 * 테스트 데이터는 현실적 pilgi 페이지 구조를 따른다:
 *   - 총 1786문항 = page 0~16 각 100문항(isLast=false) + page 17 86문항(isLast=true).
 *   - 어떤 mock 페이지도 results.length===0 & isLast=false 조합을 주지 않는다(무한루프 원인).
 *
 * 비동기 누적 로딩: progressive effect 가 page+1 을 요청하며 loadedQuestions 가 점진 누적되고
 * 그때마다 리렌더가 발생한다. 따라서 동기 act+즉시 단언이 아니라 findBy / waitFor 로 누적
 * 로딩·리렌더가 끝나길 기다린 뒤 단언한다.
 *
 * 검증:
 *  - (a) total(1786) > 1페이지(100)면 index 99(100번째)에서 finish 가 아니라 next.
 *  - (b) 페이지 끝(index 99)에 도달하면 다음 page(page+1)가 useQuestions 로 progressive 요청.
 *  - (c) 전체를 끝까지 진행해 실제 마지막 인덱스(1785)에 도달했을 때만 finish.
 *  - (d) 단일 페이지(total == 로드 수)에서 마지막 문항 finish / 비마지막 next 정상.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';

import { SolveQuestionType } from '@api/Solve';

import QuizClient from '../QuizClient';

// --- i18n: 키 그대로 반환(버튼 텍스트로 next/finish 분기 검증) ---
vi.mock('~/app/i18n/client', () => ({
  useTranslation: () => ({
    t: (key: string, vars?: Record<string, unknown>) =>
      vars ? `${key}:${JSON.stringify(vars)}` : key,
    i18n: { language: 'ko' },
  }),
}));

// --- next/navigation ---
// usePathname 은 Button → useElementTracking 경로에서 호출되므로 함께 mock 한다.
const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => '/ko/solve/jeongbocheorigisa_pilgi/quiz',
}));

vi.mock('@utils/logger', () => ({
  default: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

// --- solve 도메인 표현 컴포넌트 stub: 클릭 시 onSelect 로 제출 트리거 ---
// 컴포넌트 분리 이동 후 QuizClient 의 import 경로가 둘로 나뉘었다:
//  - solve 종속(ChoiceButton·ShortAnswerInput·ClozeBlock·ExplanationPanel): 로컬 ../../components
//    (QuizClient 기준). 이 test 파일(__tests__/)에서 동일 모듈을 가리키려면 ../../../components.
//  - 공통(CodeBlock·ProgressBar): @components/basic/* 로 이동 → 각각 별도 mock.
vi.mock('../../../components', () => ({
  ChoiceButton: ({ index, onSelect }: { index: number; onSelect?: (n: number) => void }) => (
    <button type="button" data-testid={`choice-${index}`} onClick={() => onSelect?.(index)}>
      choice {index}
    </button>
  ),
  ShortAnswerInput: () => <div data-testid="short-input" />,
  ClozeBlock: () => <div data-testid="cloze-block" />,
  ExplanationPanel: () => <div data-testid="explanation" />,
}));

vi.mock('@components/basic/CodeBlock', () => ({
  CodeBlock: () => <div data-testid="code-block" />,
}));

vi.mock('@components/basic/ProgressBar', () => ({
  ProgressBar: ({ value }: { value: number }) => (
    <div data-testid="progress-bar" data-value={value} />
  ),
}));

vi.mock('../SolveResultView', () => ({
  default: () => <div data-testid="result-view" />,
}));

// --- solve 훅 mock ---
// useStartAttempt 는 이제 query → { data } 로 attempt 를 노출한다(mutation 아님).
const startState: { data: unknown; isError: boolean; error: unknown } = {
  data: undefined,
  isError: false,
  error: null,
};
const submitMutate = vi.fn();
const finishMutate = vi.fn();

// page 인자별 응답을 제어하기 위해 호출 인자를 기록한다.
const useQuestionsMock = vi.fn();

vi.mock('@queries/useSolveQueries', () => ({
  SOLVE_QUESTIONS_PAGE_SIZE: 100,
  useStartAttempt: () => startState,
  useResumeAttempt: () => ({ data: undefined }),
  useQuestions: (...args: unknown[]) => useQuestionsMock(...args),
  useSubmitAnswer: () => ({ mutate: submitMutate }),
  useFinishAttempt: () => ({ mutate: finishMutate, isPending: false }),
}));

const LIMIT = 100;
const TOTAL = 1786; // page 0~16 각 100 + page 17 86 = 1786
const LAST_PAGE = 17;

/** 현실적 pilgi 페이지: page<17 → 100문항(isLast=false), page 17 → 86문항(isLast=true). */
function makePilgiPage(page: number) {
  const start = page * LIMIT;
  const count = page < LAST_PAGE ? LIMIT : TOTAL - LAST_PAGE * LIMIT; // 17페이지=86
  const results = Array.from({ length: count }, (_, i) => ({
    id: start + i + 1, // 1-based 전역 id
    no: start + i + 1,
    type: SolveQuestionType.Mcq,
    question: `Q${start + i + 1}`,
    choices: ['a', 'b', 'c', 'd'],
  }));
  return { count: TOTAL, results, isFirst: page === 0, isLast: page >= LAST_PAGE };
}

/**
 * startAttempt.mutate 가 즉시 onSuccess(attempt) 를 부르도록 설정.
 * useQuestions 는 인자의 page 값에 따라 해당 페이지를 반환한다.
 */
function setup(opts: {
  total: number;
  pages: (page: number) => { count: number; results: unknown[]; isFirst: boolean; isLast: boolean };
  currentIndex?: number;
  unitId?: string;
}) {
  const attempt = {
    id: 7,
    subjectSlug: 'jeongbocheorigisa_pilgi',
    unitKey: opts.unitId ?? null,
    mode: 'full',
    status: 'in_progress',
    currentIndex: opts.currentIndex ?? 0,
    total: opts.total,
    correctCount: 0,
    startedAt: '2026-06-22T00:00:00Z',
  };

  // query mock: attempt 를 data 로 즉시 노출.
  startState.data = attempt;
  startState.isError = false;
  startState.error = null;

  // 실제 React Query 는 동일 queryKey(=동일 page)에 대해 안정적 객체 참조를 반환한다.
  // mock 도 page 별 응답을 캐싱해 참조 안정성을 보장해야 컴포넌트의 useEffect deps([questionPage])
  // 가 매 렌더 변하지 않아 무한 리렌더(누적 effect ↔ 리렌더)가 발생하지 않는다.
  const pageCache = new Map<number, ReturnType<typeof opts.pages>>();
  const getPage = (page: number) => {
    if (!pageCache.has(page)) pageCache.set(page, opts.pages(page));
    return pageCache.get(page)!;
  };
  const resultCache = new Map<number, { data: unknown; isLoading: boolean; isError: boolean }>();
  const getResult = (page: number) => {
    if (!resultCache.has(page)) {
      resultCache.set(page, { data: getPage(page), isLoading: false, isError: false });
    }
    return resultCache.get(page)!;
  };

  // useQuestions(slug, unitId, page, limit, enabled) — page 는 3번째 인자.
  useQuestionsMock.mockImplementation((...args: unknown[]) => {
    const page = (args[2] as number) ?? 0;
    return getResult(page);
  });

  return { attempt };
}

beforeEach(() => {
  startState.data = undefined;
  startState.isError = false;
  startState.error = null;
  submitMutate.mockReset();
  finishMutate.mockReset();
  useQuestionsMock.mockReset();
  pushMock.mockReset();
});

function renderQuiz(unitId?: string) {
  return render(
    <QuizClient
      lng={'ko' as never}
      slug="jeongbocheorigisa_pilgi"
      unitId={unitId}
      mode={'full' as never}
    />,
  );
}

/**
 * 현재 문항의 1번 보기를 클릭해 제출 → onSuccess 로 결과 주입(채점 표시 → next/finish 노출).
 * current 문항이 로드되기 전엔 choice-1 이 없으므로 findByTestId 로 대기한 뒤 클릭한다.
 */
async function submitCurrent() {
  submitMutate.mockImplementationOnce((_payload, callbacks) => {
    callbacks?.onSuccess?.({ isCorrect: true, correctChoice: 1, explanation: 'x' });
  });
  const choice = await screen.findByTestId('choice-1');
  act(() => {
    choice.click();
  });
}

describe('QuizClient — 다중 페이지 경계 (FE-1)', () => {
  it('total(1786) > 1페이지(100)면 100번째(index 99)에서 finish 가 아니라 next 를 노출한다', async () => {
    // page>=1 도 현실적으로 100문항을 반환(빈 페이지 금지). index 99 로 복원.
    setup({
      total: TOTAL,
      currentIndex: 99,
      pages: makePilgiPage,
    });
    renderQuiz();

    // index 99 문항 채점(current 로드 대기 후 제출) → 버튼 확인.
    await submitCurrent();

    // 회귀 방지: index 99 / total 1786 → "다음" 이어야 한다.
    expect(await screen.findByRole('button', { name: 'quiz.next' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'quiz.finish' })).not.toBeInTheDocument();
    expect(finishMutate).not.toHaveBeenCalled();
  });

  it('페이지 끝(index 99)에 도달하면 다음 page(=1)를 useQuestions 로 progressive 요청한다', async () => {
    setup({
      total: TOTAL,
      currentIndex: 99,
      pages: makePilgiPage,
    });
    renderQuiz();

    // current(index 99) 로드 대기 — 이 시점이면 progressive effect 가 page+1 을 요청한 뒤다.
    await screen.findByTestId('choice-1');

    // 마지막 로드 문항(index 99)에 있으면 progressive effect 가 page 1 을 요청해야 한다.
    await waitFor(() => {
      const requestedPages = useQuestionsMock.mock.calls.map((c) => c[2] as number);
      expect(requestedPages).toContain(1);
    });
  });

  it('전체를 끝까지 진행해 실제 마지막 인덱스(1785)에 도달했을 때만 finish 를 노출한다', async () => {
    // 진입 인덱스를 1785(=total-1)로 복원. progressive effect 가 page 0→17 까지 누적 로드한다.
    setup({
      total: TOTAL,
      currentIndex: 1785,
      pages: makePilgiPage,
    });
    renderQuiz();

    // 18페이지 누적 로딩(0~17)이 끝나 index 1785 문항이 로드될 때까지 대기 후 제출.
    await submitCurrent();

    // index 1785 == total-1 → finish 노출.
    expect(await screen.findByRole('button', { name: 'quiz.finish' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'quiz.next' })).not.toBeInTheDocument();
  });

  it('단일 페이지(total == 로드 수)면 마지막 문항에서 finish 를 정상 노출한다 (회귀)', async () => {
    const SMALL_TOTAL = 5;
    setup({
      total: SMALL_TOTAL,
      currentIndex: 4,
      pages: (page) => ({
        count: SMALL_TOTAL,
        results: Array.from({ length: SMALL_TOTAL }, (_, i) => ({
          id: i + 1,
          no: i + 1,
          type: SolveQuestionType.Mcq,
          question: `Q${i + 1}`,
          choices: ['a', 'b', 'c', 'd'],
        })),
        isFirst: page === 0,
        isLast: true,
      }),
    });
    renderQuiz('001');

    await submitCurrent();

    expect(await screen.findByRole('button', { name: 'quiz.finish' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'quiz.next' })).not.toBeInTheDocument();
  });

  it('단일 페이지에서 마지막이 아닌 문항(index 0)은 next 를 노출한다 (회귀)', async () => {
    const SMALL_TOTAL = 5;
    setup({
      total: SMALL_TOTAL,
      currentIndex: 0,
      pages: (page) => ({
        count: SMALL_TOTAL,
        results: Array.from({ length: SMALL_TOTAL }, (_, i) => ({
          id: i + 1,
          no: i + 1,
          type: SolveQuestionType.Mcq,
          question: `Q${i + 1}`,
          choices: ['a', 'b', 'c', 'd'],
        })),
        isFirst: page === 0,
        isLast: true,
      }),
    });
    renderQuiz('001');

    await submitCurrent();

    expect(await screen.findByRole('button', { name: 'quiz.next' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'quiz.finish' })).not.toBeInTheDocument();
  });
});
