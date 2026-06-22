/* eslint-disable react/require-default-props */

/*
 * solve/ExplanationPanel.tsx — 채점 후 해설 패널 (oksolve ExplanationPanel 마이그레이션).
 *
 * 서버가 준 explanation/slides/trapType 표시. 정답→success 토큰, 오답→danger 토큰.
 * 색만으로 정/오를 구분하지 않도록 ✓/✕ 기호 + 텍스트 병기.
 * framer-motion으로 200ms 슬라이드업 등장(prefers-reduced-motion 자동 존중).
 */

'use client';

import * as React from 'react';
import { m, LazyMotion, domAnimation } from 'framer-motion';
import { cn } from '@utils/cn';
import { Text } from '@components/basic/Text';

export interface ExplanationPanelProps {
  /** 사용자가 맞혔는지(서버 채점). */
  correct: boolean;
  /** 해설 본문. */
  explanation: string;
  /** 슬라이드 메타(선택). */
  slides?: string;
  /** 함정 유형 메타(선택). */
  trapType?: string;
  className?: string;
}

function ExplanationPanel({
  correct,
  explanation,
  slides,
  trapType,
  className,
}: ExplanationPanelProps) {
  const meta = slides && trapType ? `슬라이드 ${slides} · ${trapType}` : slides || trapType;

  return (
    <LazyMotion features={domAnimation}>
      <m.section
        role="status"
        aria-live="polite"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={cn('rounded-2xl border border-basic-3 bg-basic-0 p-5 shadow-sm', className)}
      >
        <p
          className={cn(
            'mb-2.5 flex items-center gap-2 text-lg font-bold',
            correct ? 'text-success-1' : 'text-danger-1',
          )}
        >
          {correct ? '✓ 정답입니다' : '✕ 오답입니다'}
        </p>
        <Text variant="d2" color="basic-2" className="block break-keep leading-relaxed">
          {explanation}
        </Text>
        {meta && <p className="mt-3 border-t border-basic-3 pt-3 text-sm text-fg-5">{meta}</p>}
      </m.section>
    </LazyMotion>
  );
}

export { ExplanationPanel };
