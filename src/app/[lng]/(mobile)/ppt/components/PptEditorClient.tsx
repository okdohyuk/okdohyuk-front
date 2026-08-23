'use client';

/* eslint-disable react/require-default-props */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, FileUp } from 'lucide-react';
import { Text } from '@components/basic/Text';
import { Button } from '@components/basic/Button';
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
import HtmlImportDialog from '@components/presentation/HtmlImportDialog';
import { parsePresentationHtml } from '@components/presentation/htmlParser';
import {
  isHtmlFile,
  resolveImportedImages,
  unusedImageAssetNames,
} from '@components/presentation/importHtmlImages';
import type { PresentationDocument, PresentationTheme } from '@components/presentation/types';
import { storageApi } from '@api';

interface PptEditorClientProps {
  lng: Language;
  id?: number;
}

interface HtmlImportSectionProps {
  language: Language;
  onImport: (result: {
    document: PresentationDocument;
    theme: PresentationTheme;
    title: string;
  }) => void;
}

function HtmlImportSection({ language, onImport }: HtmlImportSectionProps) {
  const { t } = useTranslation(language, 'ppt');
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleFiles = async (fileList: File[]) => {
    setError(null);
    setIsParsing(true);
    try {
      const htmlFiles = fileList.filter(isHtmlFile);
      if (htmlFiles.length !== 1) {
        setError(t('uploadNeedHtml'));
        return;
      }
      const htmlFile = htmlFiles[0];
      const assets = fileList.filter((file) => file !== htmlFile);
      const html = await htmlFile.text();
      let result = parsePresentationHtml(html);
      if (result.document.slides.length === 0) {
        setError(t('uploadError'));
        return;
      }
      const unused = unusedImageAssetNames(result.imageSources, assets);
      if (unused.length > 0) {
        setError(`${t('uploadUnusedImages')}: ${unused.join(', ')}`);
        return;
      }
      if (result.imageSources.length > 0) {
        const accessToken = UserTokenUtil.getAccessToken() ?? '';
        result = await resolveImportedImages(result, assets, async (file) => {
          const { data } = await storageApi.postStorageFile(
            `Bearer ${accessToken}`,
            undefined,
            file,
          );
          return data;
        });
      }
      onImport(result);
      setDialogOpen(false);
    } catch {
      setError(t('uploadError'));
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <section className="flex flex-wrap items-center gap-2 rounded-3xl border border-basic-3 bg-basic-0 p-4 shadow-sm">
      <a href="/ppt/template.html" download>
        <Button
          type="button"
          className="border border-basic-3 bg-basic-0 text-fg-3 hover:bg-basic-1"
        >
          <Download className="mr-1.5 h-4 w-4" /> {t('templateDownload')}
        </Button>
      </a>
      <Button type="button" onClick={() => setDialogOpen(true)} disabled={isParsing}>
        <FileUp className="mr-1.5 h-4 w-4" /> {t('htmlUpload')}
      </Button>
      <HtmlImportDialog
        open={dialogOpen}
        title={t('htmlUpload')}
        hint={t('uploadDialogHint')}
        cancelLabel={t('uploadDialogClose')}
        error={error}
        isParsing={isParsing}
        onClose={() => {
          setDialogOpen(false);
          setError(null);
        }}
        onFiles={(files) => {
          handleFiles(files).catch(() => setError(t('uploadError')));
        }}
      />
    </section>
  );
}

export default function PptEditorClient({ lng, id }: PptEditorClientProps) {
  const { t } = useTranslation(lng, 'ppt');
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const presentation = usePresentation(id ?? null, token);
  const createMutation = useCreatePresentation();
  const updateMutation = useUpdatePresentation();
  const startMutation = useStartPresentationSession();

  // HTML 업로드로 주입한 초기 문서. import할 때마다 key를 바꿔 에디터를 리마운트시킨다.
  const [imported, setImported] = useState<{
    document: PresentationDocument;
    theme: PresentationTheme;
    title: string;
  } | null>(null);
  const [importCount, setImportCount] = useState(0);

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
    <div className="space-y-4">
      {id == null && (
        <HtmlImportSection
          language={lng}
          onImport={(result) => {
            setImported(result);
            setImportCount((count) => count + 1);
          }}
        />
      )}
      <PresentationEditor
        key={imported ? `imported-${importCount}` : 'blank'}
        language={lng}
        presentation={presentation.data}
        initialDocument={imported?.document}
        initialTheme={imported?.theme}
        initialTitle={imported?.title}
        onSave={handleSave}
        onStart={id != null ? handleStart : undefined}
        isSaving={createMutation.isPending || updateMutation.isPending || startMutation.isPending}
      />
    </div>
  );
}
