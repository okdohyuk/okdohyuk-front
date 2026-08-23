'use client';

/* eslint-disable react/require-default-props */

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, FileText, Pause, Play, Radio, Square } from 'lucide-react';
import { Button } from '@components/basic/Button';
import type {
  Presentation,
  PresentationSession,
  PresentationSessionCommand,
  PresentationSessionCommandRequest,
} from '@api/Presentation';
import {
  PresentationSessionCommand as SessionCommand,
  PresentationSessionStatus,
} from '@api/Presentation';
import { cn } from '@utils/cn';
import { normalizePresentationDocument } from './types';
import PresentationTimer from './PresentationTimer';

interface RemoteControllerProps {
  session: PresentationSession;
  presentation?: Presentation;
  onCommand: (request: PresentationSessionCommandRequest) => void;
  isCommandPending?: boolean;
}

export default function RemoteController({
  session,
  presentation,
  onCommand,
  isCommandPending = false,
}: RemoteControllerProps) {
  const [gotoIndex, setGotoIndex] = useState(String(session.currentSlideIndex + 1));
  const document = useMemo(
    () => (presentation ? normalizePresentationDocument(presentation.document) : null),
    [presentation],
  );
  const currentSlide = document?.slides[session.currentSlideIndex];
  const isPaused = session.status === PresentationSessionStatus.Paused;
  const isEnded = session.status === PresentationSessionStatus.Ended;

  const send = (command: PresentationSessionCommand, slideIndex?: number) => {
    const request: PresentationSessionCommandRequest = { command };
    if (slideIndex != null) request.slideIndex = slideIndex;
    onCommand(request);
  };

  const handleGoto = () => {
    const index = Number(gotoIndex) - 1;
    if (!Number.isInteger(index) || index < 0 || index >= session.slideCount) return;
    send(SessionCommand.Goto, index);
  };

  return (
    <section className="mx-auto w-full max-w-lg space-y-4">
      <div className="rounded-3xl border border-basic-3 bg-basic-0 p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-point-fg">
              <Radio className="h-4 w-4" /> Live remote
            </div>
            <h1 className="truncate text-xl font-bold text-fg-1">{session.presentationTitle}</h1>
            <p className="mt-1 text-sm text-fg-5">
              {session.currentSlideIndex + 1} / {session.slideCount} · {session.status}
            </p>
          </div>
          <PresentationTimer session={session} className="shrink-0 text-right text-sm text-fg-2" />
        </div>
      </div>

      <div className="rounded-3xl border border-basic-3 bg-basic-0 p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-fg-1">페이지 전환</span>
          <span className="text-xs text-fg-5">발표 PC와 약 1초마다 동기화</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => send(SessionCommand.Previous)}
            disabled={isCommandPending || isEnded || session.currentSlideIndex === 0}
            className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-basic-3 bg-basic-1 text-sm font-semibold text-fg-2 transition-colors hover:border-point-2 hover:bg-point-4/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-5 w-5" /> 이전
          </button>
          <button
            type="button"
            onClick={() => send(SessionCommand.Next)}
            disabled={
              isCommandPending || isEnded || session.currentSlideIndex >= session.slideCount - 1
            }
            className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-point-2 text-sm font-semibold text-white transition-colors hover:bg-point-1 disabled:cursor-not-allowed disabled:opacity-40"
          >
            다음 <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <input
            type="number"
            min={1}
            max={session.slideCount}
            value={gotoIndex}
            onChange={(event) => setGotoIndex(event.target.value)}
            className="min-h-11 w-full rounded-xl border border-basic-3 bg-basic-0 px-3 text-sm text-fg-1 outline-none focus:border-point-2 focus:ring-2 focus:ring-point-2/30"
            aria-label="이동할 슬라이드 번호"
          />
          <Button
            type="button"
            onClick={handleGoto}
            disabled={isCommandPending || isEnded}
            className="min-w-24"
          >
            이동
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => send(isPaused ? SessionCommand.ResumeTimer : SessionCommand.PauseTimer)}
          disabled={isCommandPending || isEnded}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-basic-3 bg-basic-0 text-sm font-semibold text-fg-2 transition-colors hover:border-point-2 hover:bg-point-4/40 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          {isPaused ? '타이머 재개' : '타이머 일시정지'}
        </button>
        <button
          type="button"
          onClick={() => send(SessionCommand.End)}
          disabled={isCommandPending || isEnded}
          className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-red-50 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
        >
          <Square className="h-4 w-4" /> 발표 종료
        </button>
      </div>

      <div
        className={cn(
          'rounded-3xl border border-basic-3 bg-basic-0 p-4 shadow-sm',
          !currentSlide && 'opacity-70',
        )}
      >
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-fg-1">
          <FileText className="h-4 w-4 text-point-fg" /> 현재 슬라이드 노트
        </div>
        <p className="whitespace-pre-wrap text-sm leading-6 text-fg-3">
          {currentSlide?.speakerNotes || '발표자 노트가 없습니다.'}
        </p>
      </div>
    </section>
  );
}
