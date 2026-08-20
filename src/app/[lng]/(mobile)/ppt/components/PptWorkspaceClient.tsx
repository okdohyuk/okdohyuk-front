'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { FilePlus2, MonitorPlay, Presentation as PresentationIcon, Trash2 } from 'lucide-react';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import type { Language } from '~/app/i18n/settings';
import UserTokenUtil from '@utils/userTokenUtil';
import { useDeletePresentation, useMyPresentations } from '@queries/usePresentationQueries';
import { normalizePresentationDocument } from '@components/presentation/types';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';

interface PptWorkspaceClientProps {
  lng: Language;
}

export default function PptWorkspaceClient({ lng }: PptWorkspaceClientProps) {
  const { t } = useTranslation(lng, 'ppt');
  const [token, setToken] = useState<string | null>(null);
  const deleteMutation = useDeletePresentation();
  const presentations = useMyPresentations(token);

  useEffect(() => {
    setToken(UserTokenUtil.getAccessToken() || null);
  }, []);

  const results = presentations.data?.results ?? [];
  const hasError = presentations.isError;
  const visibleResults = useMemo(() => results, [results]);

  const deletePresentation = (id: number) => {
    // 삭제는 비가역적이므로 브라우저 기본 확인을 한 번 거친다.
    // eslint-disable-next-line no-alert
    if (!window.confirm(t('deleteConfirm'))) return;
    deleteMutation.mutate(id);
  };

  if (!token || presentations.isPending) {
    return <Text color="basic-5">{t('loading')}</Text>;
  }

  if (hasError) {
    return <Text color="basic-5">{t('error')}</Text>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Text variant="d2" color="basic-5">
          {visibleResults.length} decks
        </Text>
        <div className="flex flex-wrap gap-2">
          <Link href={`/${lng}/ppt/remote`}>
            <Button
              type="button"
              className="border border-basic-3 bg-basic-0 text-fg-3 hover:bg-basic-1"
            >
              <MonitorPlay className="mr-1.5 h-4 w-4" /> {t('remote')}
            </Button>
          </Link>
          <Link href={`/${lng}/ppt/new`}>
            <Button type="button">
              <FilePlus2 className="mr-1.5 h-4 w-4" /> {t('new')}
            </Button>
          </Link>
        </div>
      </div>

      {visibleResults.length === 0 ? (
        <section
          className={cn(
            SERVICE_PANEL_SOFT,
            'grid min-h-56 place-items-center space-y-3 p-8 text-center',
          )}
        >
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-point-4 text-point-fg">
            <PresentationIcon className="h-7 w-7" />
          </div>
          <div>
            <p className="font-semibold text-fg-1">{t('empty')}</p>
            <p className="mt-1 text-sm text-fg-5">59개 템플릿으로 첫 발표 자료를 시작하세요.</p>
          </div>
          <Link href={`/${lng}/ppt/new`}>
            <Button type="button">{t('new')}</Button>
          </Link>
        </section>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {visibleResults.map((presentation) => {
            const document = normalizePresentationDocument(presentation.document);
            return (
              <li key={presentation.id} className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
                <div className="flex items-start gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-point-4 text-point-fg">
                    <PresentationIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-bold text-fg-1">{presentation.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-fg-5">
                      {presentation.description ||
                        `${document.slides.length} slides · revision ${presentation.revision}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs text-fg-5">
                  <span>{document.slides.length} slides</span>
                  <span>{new Date(presentation.updatedAt).toLocaleDateString(lng)}</span>
                </div>
                <div className="flex justify-end gap-2">
                  <Link href={`/${lng}/ppt/${presentation.id}/edit`}>
                    <Button
                      type="button"
                      className="border border-basic-3 bg-basic-0 text-fg-3 hover:bg-basic-1"
                    >
                      {t('edit')}
                    </Button>
                  </Link>
                  <button
                    type="button"
                    onClick={() => deletePresentation(presentation.id)}
                    disabled={deleteMutation.isPending}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-fg-5 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-500/15"
                    aria-label={t('delete')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
