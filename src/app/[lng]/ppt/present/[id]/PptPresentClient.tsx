'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Language } from '~/app/i18n/settings';
import UserTokenUtil from '@utils/userTokenUtil';
import {
  usePresentation,
  usePresentationSession,
  useSendPresentationCommand,
  useStartPresentationSession,
} from '@queries/usePresentationQueries';
import PresentationPlayer from '@components/presentation/PresentationPlayer';
import type { PresentationSessionCommandRequest } from '@api/Presentation';

interface PptPresentClientProps {
  lng: Language;
  presentationId: number;
}

export default function PptPresentClient({ lng, presentationId }: PptPresentClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const startRequested = useRef(false);
  const presentation = usePresentation(presentationId, token);
  const sessionFromUrl = searchParams.get('sessionId');
  const startMutation = useStartPresentationSession();
  const commandMutation = useSendPresentationCommand();
  const session = usePresentationSession(sessionId, token);

  useEffect(() => {
    setToken(UserTokenUtil.getAccessToken() || null);
  }, []);

  useEffect(() => {
    const parsed = sessionFromUrl ? Number(sessionFromUrl) : NaN;
    if (Number.isSafeInteger(parsed) && parsed > 0) {
      setSessionId(parsed);
      return;
    }
    if (!token || !presentation.data || startRequested.current) return;
    startRequested.current = true;
    startMutation
      .mutateAsync(presentationId)
      .then((created) => setSessionId(created.id))
      .catch(() => {
        startRequested.current = false;
      });
  }, [presentation.data, presentationId, sessionFromUrl, startMutation, token]);

  const handleCommand = (request: PresentationSessionCommandRequest) => {
    if (!sessionId) return;
    commandMutation.mutate({ sessionId, request });
  };

  const leaveToEditor = () => {
    router.replace(`/${lng}/ppt/${presentationId}/edit`);
  };

  if (!token || presentation.isPending || session.isPending || startMutation.isPending) {
    return (
      <div className="fixed inset-0 z-[100] grid place-items-center bg-black text-sm text-white/70">
        발표를 준비하는 중입니다.
      </div>
    );
  }
  if (presentation.isError || !presentation.data || session.isError || !session.data) {
    return (
      <div className="fixed inset-0 z-[100] grid place-items-center bg-black text-sm text-white/70">
        발표 세션을 불러오지 못했습니다.
      </div>
    );
  }

  return (
    <PresentationPlayer
      language={lng}
      presentation={presentation.data}
      session={session.data}
      onCommand={handleCommand}
      isCommandPending={commandMutation.isPending}
      onEnd={leaveToEditor}
    />
  );
}
