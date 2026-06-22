/* eslint-disable react/require-default-props */

/*
 * solve/CodeBlock.tsx — 코드/지문 표시 전용 블록 (oksolve CodeBlock 마이그레이션).
 *
 * 입력 없는 읽기전용 블록. 단답 문항의 code 필드 등을 monospace·줄바꿈 보존으로 표시.
 * prism.css는 .token.* 클래스에만 적용되므로(여기선 plain <code>) 충돌 없음.
 * 표현만 하므로 'use client' 불필요 → server component 가능.
 */
import * as React from 'react';
import { cn } from '@utils/cn';

export interface CodeBlockProps {
  /** 표시할 코드/지문 텍스트. */
  code: string;
  /** 언어 라벨(상단 칩). 없으면 라벨 미표시. */
  language?: string;
  className?: string;
}

function CodeBlock({ code, language, className }: CodeBlockProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-basic-3 bg-basic-2 shadow-sm',
        className,
      )}
    >
      {language && (
        <span className="block border-b border-basic-3 px-3.5 py-1.5 text-sm font-semibold lowercase text-fg-5">
          {language}
        </span>
      )}
      <pre className="m-0 overflow-x-auto px-4 py-4 font-mono text-sm leading-relaxed text-fg-1">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export { CodeBlock };
