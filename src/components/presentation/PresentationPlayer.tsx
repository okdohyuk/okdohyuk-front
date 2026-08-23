'use client';

/* eslint-disable react/require-default-props */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  Expand,
  FileText,
  LogOut,
  Maximize,
  Pause,
  Play,
  Radio,
  X,
} from 'lucide-react';
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
import type { Language } from '~/app/i18n/settings';
import { normalizePresentationDocument, normalizePresentationTheme } from './types';
import SlideCanvas from './SlideCanvas';
import PresentationTimer from './PresentationTimer';

interface PresentationPlayerProps {
  language: Language;
  presentation: Presentation;
  session: PresentationSession;
  onCommand: (request: PresentationSessionCommandRequest) => void;
  isCommandPending?: boolean;
  /** 발표 종료 후 편집 화면으로 돌아갈 때 호출 */
  onEnd?: () => void;
}

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
};

export default function PresentationPlayer({
  language,
  presentation,
  session,
  onCommand,
  isCommandPending = false,
  onEnd,
}: PresentationPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [copied, setCopied] = useState(false);
  const presentationDocument = useMemo(
    () => normalizePresentationDocument(presentation.document),
    [presentation.document],
  );
  const theme = useMemo(() => normalizePresentationTheme(presentation.theme), [presentation.theme]);
  const currentSlide =
    presentationDocument.slides[session.currentSlideIndex] ?? presentationDocument.slides[0];
  const remoteUrl = useMemo(() => {
    if (typeof window === 'undefined') return `/${language}/ppt/remote`;
    return `${window.location.origin}/${language}/ppt/remote`;
  }, [language]);

  const send = useCallback(
    (command: PresentationSessionCommand, slideIndex?: number) => {
      const request: PresentationSessionCommandRequest = { command };
      if (slideIndex != null) request.slideIndex = slideIndex;
      onCommand(request);
    },
    [onCommand],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
        event.preventDefault();
        send(SessionCommand.Next);
      } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        send(SessionCommand.Previous);
      } else if (event.key === 'Home') {
        event.preventDefault();
        send(SessionCommand.Goto, 0);
      } else if (event.key === 'End') {
        event.preventDefault();
        send(SessionCommand.Goto, session.slideCount - 1);
      } else if (event.key.toLowerCase() === 'n') {
        setShowNotes((previous) => !previous);
      } else if (event.key === 'Escape' && document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [send, session.slideCount]);

  useEffect(() => {
    const handleFullscreen = () =>
      setIsFullscreen(document.fullscreenElement === playerRef.current);
    document.addEventListener('fullscreenchange', handleFullscreen);
    return () => document.removeEventListener('fullscreenchange', handleFullscreen);
  }, []);

  const leavePresentation = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
    }
    onEnd?.();
  }, [onEnd]);

  const handleEnd = () => {
    send(SessionCommand.End);
    leavePresentation();
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      await playerRef.current?.requestFullscreen();
    } catch {
      setIsFullscreen(false);
    }
  };

  const copyRemoteUrl = async () => {
    try {
      await navigator.clipboard.writeText(remoteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  if (!currentSlide) {
    return (
      <div className="fixed inset-0 z-[100] grid place-items-center bg-black text-white">
        슬라이드가 없습니다.
      </div>
    );
  }

  const isPaused = session.status === PresentationSessionStatus.Paused;
  const isEnded = session.status === PresentationSessionStatus.Ended;

  return (
    <div
      ref={playerRef}
      className="fixed inset-0 z-[100] flex h-full min-h-full w-full flex-col bg-black text-white"
    >
      {!isFullscreen && (
        <div className="flex min-h-12 items-center justify-between gap-3 px-3 py-2 text-xs text-white/70 sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <Radio className="h-4 w-4 shrink-0 text-violet-300" />
            <span className="truncate font-semibold text-white">{presentation.title}</span>
            <span className="hidden sm:inline">
              · {session.currentSlideIndex + 1}/{session.slideCount}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <PresentationTimer session={session} className="hidden sm:block" />
            <button
              type="button"
              onClick={() => setShowNotes((previous) => !previous)}
              className={cn(
                'rounded-full p-2 transition-colors hover:bg-white/10',
                showNotes && 'bg-white/15 text-violet-200',
              )}
              aria-label="발표자 노트"
              title="발표자 노트 (N)"
            >
              <FileText className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="rounded-full p-2 transition-colors hover:bg-white/10"
              aria-label={isFullscreen ? '전체 화면 종료' : '전체 화면'}
            >
              <Expand className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleEnd}
              className="rounded-full p-2 transition-colors hover:bg-white/10"
              aria-label="편집기로 돌아가기"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div
        className={cn(
          'flex min-h-0 flex-1',
          isFullscreen ? 'h-full w-full p-0' : 'items-center justify-center px-2 pb-2',
        )}
      >
        <div
          className={isFullscreen ? 'h-full w-full' : 'w-full max-w-[1920px]'}
          style={isFullscreen ? undefined : { width: 'min(100%, calc((100vh - 8rem) * 16 / 9))' }}
        >
          <SlideCanvas
            slide={currentSlide}
            theme={theme}
            index={session.currentSlideIndex}
            total={session.slideCount}
            showNotes={showNotes && !isFullscreen}
            fill={isFullscreen}
          />
        </div>
      </div>

      {!isFullscreen && (
        <div className="flex flex-wrap items-center justify-center gap-2 px-3 pb-3 sm:gap-3">
          <button
            type="button"
            onClick={() => send(SessionCommand.Previous)}
            disabled={isCommandPending || session.currentSlideIndex <= 0 || isEnded}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="이전 슬라이드"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => send(SessionCommand.Next)}
            disabled={
              isCommandPending || session.currentSlideIndex >= session.slideCount - 1 || isEnded
            }
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="다음 슬라이드"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="mx-1 flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm tabular-nums">
            <Clock3 className="h-4 w-4 text-violet-200" />
            <PresentationTimer session={session} />
          </div>
          <button
            type="button"
            onClick={() => send(isPaused ? SessionCommand.ResumeTimer : SessionCommand.PauseTimer)}
            disabled={isCommandPending || isEnded}
            className="flex h-11 items-center gap-2 rounded-full bg-white/10 px-4 text-sm transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {isPaused ? '재개' : '일시정지'}
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            disabled={isCommandPending || isEnded}
            className="flex h-11 items-center gap-2 rounded-full bg-white/10 px-4 text-sm transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={isFullscreen ? '전체 화면 종료' : '전체 화면'}
            title={isFullscreen ? '전체 화면 종료 (ESC)' : '전체 화면'}
          >
            <Maximize className="h-4 w-4" />
            {isFullscreen ? '전체화면 해제' : '전체화면'}
          </button>
          <button
            type="button"
            onClick={handleEnd}
            disabled={isCommandPending}
            className="flex h-11 items-center gap-2 rounded-full bg-red-500/80 px-4 text-sm transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <LogOut className="h-4 w-4" /> 발표 종료
          </button>
        </div>
      )}

      {!isFullscreen && (
        <div className="flex flex-wrap items-center justify-center gap-2 px-3 pb-3 text-xs text-white/60">
          <span>리모컨: {remoteUrl}</span>
          <Button
            type="button"
            onClick={copyRemoteUrl}
            className="h-8 border border-white/20 bg-white/10 px-3 text-xs text-white hover:bg-white/20"
          >
            {copied ? (
              <Check className="mr-1 h-3.5 w-3.5" />
            ) : (
              <Copy className="mr-1 h-3.5 w-3.5" />
            )}
            {copied ? '복사됨' : 'URL 복사'}
          </Button>
        </div>
      )}
    </div>
  );
}
