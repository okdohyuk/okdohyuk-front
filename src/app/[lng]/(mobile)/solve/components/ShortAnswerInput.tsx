/* eslint-disable react/require-default-props */

/*
 * solve/ShortAnswerInput.tsx — 단답식 입력 (oksolve ShortAnswerInput 마이그레이션).
 *
 * basic/Input(일반 단답) 또는 basic/Textarea(코드 답안) + basic/Button 조합.
 * 채점은 서버가 하므로 정오 판정 로직 없음:
 *  - 미채점: Input/Textarea(빈값 비활성) + 제출 Button.
 *  - 채점 후: readOnly 표시에 정/오 토큰 보더, 오답이면 서버가 준 correctText 노출
 *    (색만으로 구분하지 않도록 ✕ 기호 + "정답:" 텍스트 병기).
 *
 * 코드 답안(code=true): question.codeLanguage 가 있는 short 문항.
 *  - <input> 대신 monospace <textarea>(줄바꿈 가능). Enter 는 줄바꿈이라 제출하지 않고
 *    제출 버튼(또는 Ctrl/Cmd+Enter)으로 제출한다. 일반 단답은 기존대로 Enter 제출.
 *  - 백엔드 strict 채점(normalizeCode): 내부 공백·줄바꿈을 보존해 비교한다. 따라서 프론트는
 *    사용자 입력의 내부 공백/줄바꿈을 절대 정규화/축약하지 않는다. onSubmit 에 value 원본을
 *    그대로 전달하고(축약 금지), 빈 입력 가드용으로만 trim() 결과를 본다.
 *  - 채점 후에도 줄바꿈을 보존해(whitespace-pre) 표시하고, correctText 도 줄바꿈을 보존한다.
 *
 * 입력 상태는 내부 state로 보관. 문항 전환 시 부모 key로 리마운트되어 초기화된다.
 */

'use client';

import * as React from 'react';
import { cn } from '@utils/cn';
import { Input } from '@components/basic/Input';
import { Textarea } from '@components/basic/Textarea';
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
  /**
   * 코드 답안 여부(question.codeLanguage 유무). true 면 monospace textarea 로 입력받고
   * 줄바꿈·내부 공백을 보존한다. false(기본) 면 기존 단답 input.
   */
  code?: boolean;
  /** 제출 콜백. value 는 사용자가 입력한 원본(내부 공백·줄바꿈 보존). */
  onSubmit?: (value: string) => void;
}

function ShortAnswerInput({
  graded = false,
  isCorrect = false,
  submittedText,
  correctText,
  code = false,
  onSubmit,
}: ShortAnswerInputProps) {
  const [value, setValue] = React.useState('');

  if (graded) {
    const answered = submittedText ?? '';
    const gradedTokenClass = isCorrect
      ? 'border-success-2 bg-success-4'
      : 'border-danger-2 bg-danger-4';

    if (code) {
      // 코드 답안: 줄바꿈·내부 공백 보존(whitespace-pre)해 표시. readOnly textarea 대신
      // pre 로 렌더해 멀티라인 답안의 간격을 그대로 보여준다.
      return (
        <div className="animate-solve-enter">
          <pre
            aria-label="제출한 답"
            className={cn(
              'm-0 min-h-[60px] overflow-x-auto whitespace-pre rounded-2xl border px-4 py-3',
              'font-mono text-sm leading-relaxed text-fg-1 shadow-sm',
              gradedTokenClass,
            )}
          >
            <code>{answered}</code>
          </pre>
          {!isCorrect && correctText && (
            <div className="mt-3">
              <Text variant="d2" className="block break-keep font-semibold text-success-1">
                <span aria-hidden="true">✕ </span>정답:
              </Text>
              <pre className="m-0 mt-1 overflow-x-auto whitespace-pre font-mono text-sm leading-relaxed text-success-1">
                <code>{correctText}</code>
              </pre>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="animate-solve-enter">
        <Input
          value={answered}
          readOnly
          aria-label="제출한 답"
          className={cn(
            'min-h-[60px] cursor-default rounded-2xl px-4 text-base shadow-sm',
            gradedTokenClass,
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

  // 빈 입력 가드용으로만 trim 을 사용한다. 제출되는 값(value)은 절대 축약하지 않는다.
  const isEmpty = value.trim().length === 0;

  if (code) {
    return (
      <div className="animate-solve-enter">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            // Enter 는 줄바꿈(기본 동작 유지). Ctrl/Cmd+Enter 보조 제출만 처리.
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !isEmpty) {
              e.preventDefault();
              onSubmit?.(value);
            }
          }}
          rows={4}
          placeholder="코드 답안을 입력하세요"
          aria-label="코드 답안 입력"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className="min-h-[112px] resize-y whitespace-pre rounded-2xl px-4 py-3 font-mono text-sm leading-relaxed shadow-sm"
        />
        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            disabled={isEmpty}
            aria-disabled={isEmpty || undefined}
            onClick={() => onSubmit?.(value)}
            className="min-w-[120px] rounded-xl px-6"
          >
            제출
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-solve-enter">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !isEmpty) {
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
          disabled={isEmpty}
          aria-disabled={isEmpty || undefined}
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
