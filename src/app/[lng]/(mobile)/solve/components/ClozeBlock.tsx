/* eslint-disable react/require-default-props */

/*
 * solve/ClozeBlock.tsx — 빈칸 채우기(다중·인라인) (oksolve ClozeBlock 마이그레이션).
 *
 * clozeTemplate을 parseCloze로 분해해 빈칸 위치에 인라인 <input>을 렌더한다.
 *  - codeLanguage 있으면 코드 빈칸(monospace CodeBlock 톤), 없으면 지문 빈칸.
 *  - 미채점: 로컬 state에 입력 보관 → 제출 시 blanks 배열로 onSubmit.
 *  - 채점 후: 서버가 준 blankResults로 빈칸별 정/오 토큰 + "n/m 빈칸 정답" 요약 +
 *    오답 칸 정답 노출(전부 맞춰야 정답). 색만으로 구분하지 않도록 ✕ 기호 병기.
 *
 * 채점은 서버가 하므로 정답을 들고 있지 않다. 부모(QuizClient)가 SolveSubmissionResult의
 * blankResults를 내려준다. 문항 전환 시 부모 key로 리마운트되어 입력이 초기화된다.
 *
 * parseCloze는 `@utils/cloze`에서 import (frontend engineer가 작성 예정).
 * 기대 시그니처는 보고서/하단 주석 참고.
 */

'use client';

import * as React from 'react';
import { cn } from '@utils/cn';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';
import { parseCloze } from '@utils/cloze';
import type { BlankResult } from './types';

/** 제출 시 부모로 전달하는 빈칸 입력값. spec SolveSubmissionRequest.blanks와 동일 형태. */
export interface ClozeBlankValue {
  blankId: string;
  value: string;
}

export interface ClozeBlockProps {
  /** 빈칸 마커({{blankId}})를 포함한 템플릿. spec SolveQuestion.clozeTemplate. */
  clozeTemplate: string;
  /** 코드 빈칸이면 언어, 지문 빈칸이면 undefined. spec SolveQuestion.codeLanguage. */
  codeLanguage?: string;
  /** 채점 완료 여부. */
  graded?: boolean;
  /** 채점 후 사용자가 제출한 값(복원 표시용). blankId → value. */
  submittedMap?: Record<string, string>;
  /** 채점 후 빈칸별 결과(서버 제공). graded일 때 필수. */
  blankResults?: BlankResult[];
  /** 제출 콜백. */
  onSubmit?: (blanks: ClozeBlankValue[]) => void;
}

// 빈칸 폭: 입력 길이에 맞춰(최소 4ch, 최대 24ch). 미채점은 정답 길이를 노출하지 않도록 입력 길이만 본다.
function inputSize(text: string): number {
  return Math.max(4, Math.min(text.length + 1, 24));
}

function ClozeBlock({
  clozeTemplate,
  codeLanguage,
  graded = false,
  submittedMap,
  blankResults,
  onSubmit,
}: ClozeBlockProps) {
  const segments = React.useMemo(() => parseCloze(clozeTemplate), [clozeTemplate]);
  const [inputs, setInputs] = React.useState<Record<string, string>>({});
  const isCode = !!codeLanguage;
  const answered = submittedMap ?? {};

  const resultById = React.useMemo(
    () => new Map((blankResults ?? []).map((b) => [b.blankId, b])),
    [blankResults],
  );

  const segNodes = segments.map((seg, i) => {
    if (seg.kind === 'text') {
      // eslint-disable-next-line react/no-array-index-key
      return <span key={`t-${i}`}>{seg.value}</span>;
    }
    const value = (graded ? answered[seg.blankId] : inputs[seg.blankId]) ?? '';
    const result = resultById.get(seg.blankId);
    const ok = result?.correct;
    let gradedSuffix = '';
    if (graded) gradedSuffix = ok ? ' 정답' : ' 오답';
    return (
      <input
        key={`b-${seg.blankId}`}
        className={cn(
          'mx-0.5 inline-block min-w-[4ch] rounded-md border px-1.5 py-px align-baseline font-mono text-[inherit] leading-snug',
          'bg-basic-0 text-fg-1',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-point-1',
          !graded && 'border-point-1',
          graded && ok && 'border-success-2 bg-success-4',
          graded && ok === false && 'border-danger-2 bg-danger-4',
        )}
        value={value}
        size={inputSize(value)}
        readOnly={graded}
        onChange={
          graded ? undefined : (e) => setInputs((m) => ({ ...m, [seg.blankId]: e.target.value }))
        }
        aria-label={`빈칸 ${seg.blankId}${gradedSuffix}`}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
      />
    );
  });

  const body = isCode ? (
    <div className="relative overflow-hidden rounded-2xl border border-basic-3 bg-basic-2 shadow-sm">
      <span className="block border-b border-basic-3 px-3.5 py-1.5 text-sm font-semibold lowercase text-fg-5">
        {codeLanguage}
      </span>
      <pre className="m-0 overflow-x-auto whitespace-pre px-4 py-4 font-mono text-sm leading-loose text-fg-1">
        <code>{segNodes}</code>
      </pre>
    </div>
  ) : (
    <p className="whitespace-pre-wrap break-keep text-base leading-loose text-fg-1">{segNodes}</p>
  );

  if (graded) {
    const total = blankResults?.length ?? 0;
    const correctCount = (blankResults ?? []).filter((b) => b.correct).length;
    const wrongBlanks = (blankResults ?? []).filter((b) => !b.correct);
    return (
      <div className="animate-solve-enter">
        {body}
        <Text variant="d2" className="mt-3 block font-semibold text-fg-2">
          {correctCount} / {total} 빈칸 정답
        </Text>
        {wrongBlanks.length > 0 && (
          <ul className="mt-2 flex list-none flex-col gap-1 pl-0 font-mono text-sm text-success-1">
            {wrongBlanks.map((b) => (
              <li key={b.blankId}>
                <span aria-hidden="true">✕ </span>
                {b.blankId}: {b.correctText}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  const filledCount = Object.values(inputs).filter((v) => v.trim()).length;
  return (
    <div className="animate-solve-enter">
      {body}
      <div className="mt-4 flex justify-end">
        <Button
          type="button"
          disabled={filledCount === 0}
          aria-disabled={filledCount === 0 || undefined}
          onClick={() =>
            onSubmit?.(Object.entries(inputs).map(([blankId, value]) => ({ blankId, value })))
          }
          className="min-w-[120px] rounded-xl px-6"
        >
          제출
        </Button>
      </div>
    </div>
  );
}

export { ClozeBlock };
