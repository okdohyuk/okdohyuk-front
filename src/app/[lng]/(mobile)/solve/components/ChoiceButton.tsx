/* eslint-disable react/require-default-props */

/*
 * solve/ChoiceButton.tsx — MCQ 선택지 버튼 (oksolve ChoiceButton 마이그레이션).
 *
 * 순수 표현 컴포넌트: 채점은 백엔드가 하므로 정답 인덱스를 받지 않는다.
 * 부모(QuizClient)가 서버 결과(SolveSubmissionResult)를 토대로 각 선택지의 `state`를
 * 계산해 내려주고, 이 컴포넌트는 상태에 맞는 cva variant만 렌더한다.
 *
 * 상태(cva variant):
 *  - default  : 채점 전, 미선택
 *  - selected : 채점 전, 사용자가 막 누른 선택지
 *  - correct  : 채점 후 정답 선택지 (success 토큰)
 *  - wrong    : 채점 후 사용자가 고른 오답 (danger 토큰)
 *  - dimmed   : 채점 후 나머지 (채도/투명도 절감)
 * `locked`(채점 완료로 포인터 차단)는 boolean prop으로 별도 처리.
 *
 * 키보드 1~4 단축키는 부모(QuizClient)가 담당. 여기선 onSelect 콜백만 노출.
 */

'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@utils/cn';
import { Text } from '@components/basic/Text';
import type { ChoiceIndex } from './types';

const INDEX_BADGE: Record<ChoiceIndex, string> = {
  1: '①',
  2: '②',
  3: '③',
  4: '④',
};

const choiceVariants = cva(
  cn(
    'group relative flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left',
    'min-h-[60px] shadow-sm transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-point-1 focus-visible:ring-offset-2 focus-visible:ring-offset-basic-0',
  ),
  {
    variants: {
      state: {
        default:
          'border-basic-3 bg-basic-0 text-fg-1 hover:-translate-y-0.5 hover:border-point-4 hover:shadow-md',
        selected: 'border-point-1 bg-point-soft text-point-1',
        correct: 'border-success-2 bg-success-4 text-fg-1',
        wrong: 'border-danger-2 bg-danger-4 text-fg-1',
        dimmed: 'border-basic-3 bg-basic-0 text-fg-1 opacity-45 saturate-50 shadow-none',
      },
      locked: {
        true: 'pointer-events-none cursor-default',
        false: 'cursor-pointer active:translate-y-px',
      },
    },
    defaultVariants: {
      state: 'default',
      locked: false,
    },
  },
);

const badgeVariants = cva(
  cn(
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border',
    'text-sm font-semibold leading-none tabular-nums transition-colors',
  ),
  {
    variants: {
      state: {
        default: 'border-basic-3 bg-basic-2 text-fg-4',
        selected: 'border-transparent bg-point-2 text-white',
        correct: 'border-transparent bg-success-2 text-white',
        wrong: 'border-transparent bg-danger-2 text-white',
        dimmed: 'border-basic-3 bg-basic-2 text-fg-4',
      },
    },
    defaultVariants: { state: 'default' },
  },
);

export type ChoiceState = NonNullable<VariantProps<typeof choiceVariants>['state']>;

export interface ChoiceButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onSelect'
> {
  /** 선택지 번호(1-based). */
  index: ChoiceIndex;
  /** 선택지 본문. */
  text: string;
  /** 시각 상태. 부모가 서버 채점 결과로 계산해 전달. */
  state?: ChoiceState;
  /** 채점 완료로 더 누를 수 없는 상태. */
  locked?: boolean;
  /** 선택 콜백. locked면 호출되지 않음. */
  onSelect?: (index: ChoiceIndex) => void;
}

const ChoiceButton = React.forwardRef<HTMLButtonElement, ChoiceButtonProps>(
  ({ index, text, state = 'default', locked = false, onSelect, className, ...props }, ref) => {
    const isSelected = state === 'selected' || state === 'wrong' || state === 'correct';

    return (
      <button
        ref={ref}
        type="button"
        className={cn(choiceVariants({ state, locked }), className)}
        aria-disabled={locked || undefined}
        aria-pressed={isSelected}
        aria-label={`${index}번 보기. ${text}`}
        onClick={() => {
          if (locked) return;
          onSelect?.(index);
        }}
        {...props}
      >
        <span className={badgeVariants({ state })} aria-hidden="true">
          {INDEX_BADGE[index]}
        </span>
        <Text variant="d2" color="basic-1" className="min-w-0 flex-1 break-keep leading-snug">
          {text}
        </Text>
      </button>
    );
  },
);
ChoiceButton.displayName = 'ChoiceButton';

export { ChoiceButton, choiceVariants };
