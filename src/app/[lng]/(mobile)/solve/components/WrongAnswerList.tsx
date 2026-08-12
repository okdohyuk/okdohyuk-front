'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Text } from '@components/basic/Text';
import { CodeBlock } from '@components/basic/CodeBlock';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import { cn } from '@utils/cn';
import type { SolveQuestion, SolveSubmissionResult } from '@api/Solve';
import { SolveQuestionType } from '@api/Solve';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';

export type WrongAnswerItem = {
  question: SolveQuestion;
  /** 해당 문항의 채점 결과(정답/해설). 미제출 오답이면 undefined. */
  result?: SolveSubmissionResult;
};

type WrongAnswerListProps = {
  lng: Language;
  items: WrongAnswerItem[];
};

// 문항 유형별 "정답" 표기 텍스트. 서버 채점 결과에 공개된 값만 사용한다.
function correctAnswerText(question: SolveQuestion, result?: SolveSubmissionResult): string | null {
  if (!result) return null;
  if (question.type === SolveQuestionType.Mcq && result.correctChoice != null) {
    const choice = question.choices?.[result.correctChoice - 1];
    return choice ? `${result.correctChoice}. ${choice}` : String(result.correctChoice);
  }
  if (question.type === SolveQuestionType.Short) {
    return result.correctText ?? null;
  }
  if (question.type === SolveQuestionType.Cloze && result.blankResults?.length) {
    return result.blankResults.map((b) => b.correctText).join(' / ');
  }
  return null;
}

/**
 * 오답 모아보기 — 결과 화면(풀이 직후·기록 결과 페이지 공용)에서 오답 문항을
 * 정답·해설과 함께 접이식 목록으로 보여준다. 다시 풀지 않고 복기만 할 때 사용.
 */
export default function WrongAnswerList({ lng, items }: WrongAnswerListProps) {
  const { t } = useTranslation(lng, 'solve');
  const [open, setOpen] = React.useState(false);

  if (items.length === 0) return null;

  return (
    <section className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-2xl border border-basic-3 bg-basic-0 px-4 py-3 text-left transition-colors hover:bg-basic-1"
      >
        <Text variant="d2" color="basic-1" className="font-semibold">
          {t('result.wrongList.title')}{' '}
          <span className="tabular-nums text-fg-4">({items.length})</span>
        </Text>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-fg-4 transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul className="space-y-2">
          {items.map(({ question, result }) => {
            const answer = correctAnswerText(question, result);
            return (
              <li key={question.id} className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
                {question.no != null && (
                  <Text variant="c1" color="basic-5" className="block font-semibold tabular-nums">
                    Q{question.no}
                  </Text>
                )}
                <Text
                  variant="d2"
                  color="basic-1"
                  className="block whitespace-pre-wrap break-keep font-semibold leading-relaxed"
                >
                  {question.question}
                </Text>
                {question.code && question.type !== SolveQuestionType.Cloze && (
                  <CodeBlock code={question.code} language={question.codeLanguage ?? undefined} />
                )}
                {answer && (
                  <p className="rounded-xl bg-success-4 px-3 py-2 text-sm font-semibold text-success-1">
                    {t('result.wrongList.correctAnswer')}: {answer}
                  </p>
                )}
                {!result && (
                  <p className="rounded-xl bg-basic-1 px-3 py-2 text-sm text-fg-4">
                    {t('result.wrongList.unanswered')}
                  </p>
                )}
                {result?.explanation && (
                  <Text
                    variant="d3"
                    color="basic-3"
                    className="block whitespace-pre-wrap break-keep leading-relaxed"
                  >
                    {result.explanation}
                  </Text>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
