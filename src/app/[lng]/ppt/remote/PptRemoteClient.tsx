'use client';

import React, { useEffect, useState } from 'react';
import { MonitorPlay, RefreshCw } from 'lucide-react';
import { Text } from '@components/basic/Text';
import type { Language } from '~/app/i18n/settings';
import UserTokenUtil from '@utils/userTokenUtil';
import {
  useActivePresentationSession,
  usePresentation,
  useSendPresentationCommand,
} from '@queries/usePresentationQueries';
import RemoteController from '@components/presentation/RemoteController';
import type { PresentationSessionCommandRequest } from '@api/Presentation';

interface PptRemoteClientProps {
  lng: Language;
}

export default function PptRemoteClient({ lng }: PptRemoteClientProps) {
  const [token, setToken] = useState<string | null>(null);
  const activeSession = useActivePresentationSession(token);
  const presentation = usePresentation(activeSession.data?.presentationId ?? null, token);
  const commandMutation = useSendPresentationCommand();

  useEffect(() => {
    setToken(UserTokenUtil.getAccessToken() || null);
  }, []);

  const handleCommand = (request: PresentationSessionCommandRequest) => {
    if (!activeSession.data) return;
    commandMutation.mutate({ sessionId: activeSession.data.id, request });
  };

  if (!token || activeSession.isPending) {
    return (
      <div className="min-h-screen bg-basic-1 p-4 pt-12">
        <Text color="basic-5">리모컨을 준비하는 중입니다.</Text>
      </div>
    );
  }

  if (activeSession.isError || !activeSession.data) {
    return (
      <div className="min-h-screen bg-basic-1 px-4 py-12">
        <div className="mx-auto max-w-lg space-y-4 rounded-3xl border border-basic-3 bg-basic-0 p-6 text-center shadow-sm">
          <MonitorPlay className="mx-auto h-8 w-8 text-point-fg" />
          <h1 className="text-lg font-bold text-fg-1">활성 발표가 없습니다.</h1>
          <p className="text-sm leading-6 text-fg-5">
            발표 PC에서 웹 프레젠테이션을 시작한 뒤 이 화면을 새로고침하세요.
          </p>
          <button
            type="button"
            onClick={() => activeSession.refetch()}
            className="mx-auto inline-flex min-h-11 items-center gap-2 rounded-xl bg-point-2 px-4 text-sm font-semibold text-white hover:bg-point-1"
          >
            <RefreshCw className="h-4 w-4" /> 다시 확인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-basic-1 px-4 py-5 sm:py-8">
      <RemoteController
        session={activeSession.data}
        presentation={presentation.data}
        onCommand={handleCommand}
        isCommandPending={commandMutation.isPending}
      />
      <p className="mx-auto mt-4 max-w-lg text-center text-xs text-fg-6">
        {lng === 'ko'
          ? '발표 화면의 슬라이드와 타이머가 자동으로 동기화됩니다.'
          : 'The slide and timer sync automatically with the presentation screen.'}
      </p>
    </div>
  );
}
