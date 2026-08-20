'use client';

/* eslint-disable react/require-default-props */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Text } from '@components/basic/Text';
import { useTranslation } from '~/app/i18n/client';
import type { Language } from '~/app/i18n/settings';
import UserTokenUtil from '@utils/userTokenUtil';
import {
  useCreatePresentation,
  usePresentation,
  useStartPresentationSession,
  useUpdatePresentation,
} from '@queries/usePresentationQueries';
import PresentationEditor from '@components/presentation/PresentationEditor';
import type { PresentationDocument, PresentationTheme } from '@components/presentation/types';

interface PptEditorClientProps {
  lng: Language;
  id?: number;
}

export default function PptEditorClient({ lng, id }: PptEditorClientProps) {
  const { t } = useTranslation(lng, 'ppt');
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const presentation = usePresentation(id ?? null, token);
  const createMutation = useCreatePresentation();
  const updateMutation = useUpdatePresentation();
  const startMutation = useStartPresentationSession();

  useEffect(() => {
    setToken(UserTokenUtil.getAccessToken() || null);
  }, []);

  const handleSave = async (payload: {
    title: string;
    description: string;
    document: PresentationDocument;
    theme: PresentationTheme;
    targetDurationSeconds: number;
  }) => {
    if (id != null && presentation.data) {
      await updateMutation.mutateAsync({
        id,
        request: {
          title: payload.title,
          description: payload.description || null,
          schemaVersion: payload.document.schemaVersion,
          revision: presentation.data.revision,
          document: payload.document,
          theme: payload.theme,
          targetDurationSeconds: payload.targetDurationSeconds,
        },
      });
      return;
    }

    const created = await createMutation.mutateAsync({
      title: payload.title,
      description: payload.description || null,
      schemaVersion: payload.document.schemaVersion,
      document: payload.document,
      theme: payload.theme,
      targetDurationSeconds: payload.targetDurationSeconds,
    });
    router.replace(`/${lng}/ppt/${created.id}/edit`);
  };

  const handleStart = () => {
    if (!id) return;
    startMutation.mutate(id, {
      onSuccess: (session) => {
        router.push(`/${lng}/ppt/present/${id}?sessionId=${session.id}`);
      },
    });
  };

  if (!token || (id != null && presentation.isPending)) {
    return <Text color="basic-5">{t('loading')}</Text>;
  }
  if (id != null && (presentation.isError || !presentation.data)) {
    return <Text color="basic-5">{t('error')}</Text>;
  }

  return (
    <PresentationEditor
      language={lng}
      presentation={presentation.data}
      onSave={handleSave}
      onStart={id != null ? handleStart : undefined}
      isSaving={createMutation.isPending || updateMutation.isPending || startMutation.isPending}
    />
  );
}
