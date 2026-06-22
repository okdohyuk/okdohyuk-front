/* eslint-disable react/require-default-props */

/*
 * solve/SubjectCard.tsx — 과목 카드 + 진행 게이지 (oksolve SubjectCard 마이그레이션).
 *
 * 클릭 시 단원 선택 화면으로 진입하는 버튼형 카드. 공통 상수
 * SERVICE_PANEL_SOFT(패널 톤) + SERVICE_CARD_INTERACTIVE(hover lift/보더)를 재사용한다.
 * 진행 게이지는 공통 @components/basic/ProgressBar 재사용.
 *
 * color prop(과목별 hex)은 CSS 변수(--subject-accent)로 받아 좌측 액센트 바·점에만 사용한다
 * (배경/텍스트 등 가독성에 영향 주는 곳엔 토큰만 사용 → 다크모드/대비 안전).
 * 이어풀기(resume) 상태는 point-soft 틴트 + point-1 보더로 강조.
 */

'use client';

import * as React from 'react';
import { cn } from '@utils/cn';
import { Text } from '@components/basic/Text';
import {
  SERVICE_PANEL_SOFT,
  SERVICE_CARD_INTERACTIVE,
} from '@components/complex/Service/interactiveStyles';
import { ProgressBar } from '@components/basic/ProgressBar';

export interface SubjectCardProps {
  /** 과목 제목. */
  title: string;
  /** 전체 문항 수. */
  totalQuestions: number;
  /** 단원 수. */
  unitCount: number;
  /** 사용자가 푼 문항 수(서버 derived 진행률). */
  answeredCount: number;
  /** 완료 여부(completedAt != null 등). */
  completed?: boolean;
  /** 과목 액센트 색(hex). 좌측 바·점에만 사용. */
  color?: string;
  /** 카드 클릭 콜백 → 단원 선택. */
  onOpen?: () => void;
}

function SubjectCard({
  title,
  totalQuestions,
  unitCount,
  answeredCount,
  completed = false,
  color,
  onOpen,
}: SubjectCardProps) {
  const inProgress = answeredCount > 0 && !completed;
  const ratio = totalQuestions > 0 ? answeredCount / totalQuestions : 0;

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${title} 열기`}
      style={color ? ({ '--subject-accent': color } as React.CSSProperties) : undefined}
      className={cn(
        SERVICE_PANEL_SOFT,
        SERVICE_CARD_INTERACTIVE,
        'relative flex w-full flex-col gap-2.5 overflow-hidden p-5 text-left',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-point-1 focus-visible:ring-offset-2 focus-visible:ring-offset-basic-0',
        inProgress && 'border-point-1 bg-point-soft',
      )}
    >
      {/* 좌측 과목 액센트 바 (color prop이 있을 때만) */}
      {color && (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-1"
          style={{ backgroundColor: 'var(--subject-accent)' }}
        />
      )}

      <div className="flex items-center gap-2">
        {color && (
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: 'var(--subject-accent)' }}
          />
        )}
        <Text variant="t3" color="basic-1" className="leading-tight">
          {title}
        </Text>
      </div>

      <Text variant="d3" color="basic-5" className="tabular-nums">
        {totalQuestions}문 · {unitCount}단원
      </Text>

      <div className="mt-1 flex items-center gap-2.5">
        <ProgressBar value={ratio} label={`${title} 진행률`} className="flex-1" />
        <Text variant="c1" color="basic-5" className="shrink-0 font-semibold tabular-nums">
          {completed
            ? `완료 · ${answeredCount} / ${totalQuestions}`
            : `${answeredCount} / ${totalQuestions}`}
        </Text>
      </div>
    </button>
  );
}

export { SubjectCard };
