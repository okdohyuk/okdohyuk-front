/* eslint-disable react/require-default-props */

/*
 * solve/ShortAnswerInput.tsx — 단답식 입력 (oksolve ShortAnswerInput 마이그레이션).
 *
 * basic/Input + basic/Button 조합. 채점은 서버가 하므로 정오 판정 로직 없음:
 *  - 미채점: Input(빈값 비활성, Enter 제출) + 제출 Button.
 *  - 채점 후: readOnly Input에 정/오 토큰 보더, 오답이면 서버가 준 correctText 노출
 *    (색만으로 구분하지 않도록 ✕ 기호 + "정답:" 텍스트 병기).
 *
 * 입력 상태는 내부 state로 보관. 문항 전환 시 부모 key로 리마운트되어 초기화된다.
 */

'use client';

import * as React from 'react';
import { cn } from '@utils/cn';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';

export interface ShortAnswerInputProps {
  /** 채점 완료 여부(서버 응답 도착). */
  graded?: boolean;
  /** 채점 후 정오. graded일 때만 의미 있음. */
  isCorrect?: boolean;
  /** 채점 후 사용자가 제출한 답(복원 표시용). */
  submittedText?: string;
  /** 오답일 때 노출할 정답 텍스트(서버 제공). */
  correctText?: string;
  /** 제출 콜백. */
  onSubmit?: (value: string) => void;
}

function ShortAnswerInput({
  graded = false,
  isCorrect = false,
  submittedText,
  correctText,
  onSubmit,
}: ShortAnswerInputProps) {
  const [value, setValue] = React.useState('');

  if (graded) {
    const answered = submittedText ?? '';
    return (
      <div className="animate-solve-enter">
        <Input
          value={answered}
          readOnly
          aria-label="제출한 답"
          className={cn(
            'min-h-[60px] cursor-default rounded-2xl px-4 text-base shadow-sm',
            isCorrect ? 'border-success-2 bg-success-4' : 'border-danger-2 bg-danger-4',
          )}
        />
        {!isCorrect && correctText && (
          <Text variant="d2" className="mt-3 block break-keep font-semibold text-success-1">
            <span aria-hidden="true">✕ </span>정답: {correctText}
          </Text>
        )}
      </div>
    );
  }

  const trimmed = value.trim();
  return (
    <div className="animate-solve-enter">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && trimmed) {
            e.preventDefault();
            onSubmit?.(value);
          }
        }}
        placeholder="답을 입력하세요"
        aria-label="단답 입력"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        className="min-h-[60px] rounded-2xl px-4 text-base shadow-sm"
      />
      <div className="mt-4 flex justify-end">
        <Button
          type="button"
          disabled={!trimmed}
          aria-disabled={!trimmed || undefined}
          onClick={() => onSubmit?.(value)}
          className="min-w-[120px] rounded-xl px-6"
        >
          제출
        </Button>
      </div>
    </div>
  );
}

export { ShortAnswerInput };
