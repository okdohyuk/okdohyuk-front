'use client';

import React, { useMemo, useState } from 'react';
import MarkdownTransJSX from 'markdown-to-jsx';
import { Button } from '@components/basic/Button';
import { Textarea } from '@components/basic/Textarea';
import Link from '@components/basic/Link';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface MarkdownPreviewerProps {
  lng: Language;
}

export default function MarkdownPreviewer({ lng }: MarkdownPreviewerProps) {
  const { t } = useTranslation(lng, 'markdown-previewer');
  const [content, setContent] = useState('');

  const stats = useMemo(() => {
    const trimmed = content.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const characters = content.length;
    const charactersNoSpaces = content.replace(/\s/g, '').length;
    const lines = content ? content.split(/\n/).length : 0;

    return {
      words,
      characters,
      charactersNoSpaces,
      lines,
    };
  }, [content]);

  const handleSample = () => {
    setContent(t('sample'));
  };

  const handleClear = () => {
    setContent('');
  };

  return (
    <div className="space-y-6">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <label
          htmlFor="markdown-input"
          className="text-sm font-semibold text-zinc-700 dark:text-zinc-200"
        >
          {t('label.input')}
        </label>
        <Textarea
          id="markdown-input"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder={t('placeholder')}
          className="min-h-[180px] font-mono text-sm"
        />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('helper')}</p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSample} className="px-4 py-2 text-sm">
            {t('button.sample')}
          </Button>
          <Button
            onClick={handleClear}
            className="px-4 py-2 text-sm bg-zinc-200 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            {t('button.clear')}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-zinc-300 sm:grid-cols-4">
          <div className="rounded-lg bg-white/70 p-2 text-center font-semibold shadow-sm dark:bg-zinc-900/60">
            <div className="text-[10px] uppercase text-zinc-400">{t('stats.words')}</div>
            <div>{stats.words}</div>
          </div>
          <div className="rounded-lg bg-white/70 p-2 text-center font-semibold shadow-sm dark:bg-zinc-900/60">
            <div className="text-[10px] uppercase text-zinc-400">{t('stats.characters')}</div>
            <div>{stats.characters}</div>
          </div>
          <div className="rounded-lg bg-white/70 p-2 text-center font-semibold shadow-sm dark:bg-zinc-900/60">
            <div className="text-[10px] uppercase text-zinc-400">{t('stats.noSpaces')}</div>
            <div>{stats.charactersNoSpaces}</div>
          </div>
          <div className="rounded-lg bg-white/70 p-2 text-center font-semibold shadow-sm dark:bg-zinc-900/60">
            <div className="text-[10px] uppercase text-zinc-400">{t('stats.lines')}</div>
            <div>{stats.lines}</div>
          </div>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'p-4')}>
        <h3 className="mb-3 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          {t('label.preview')}
        </h3>
        {content ? (
          <MarkdownTransJSX
            className="prose prose-zinc dark:prose-invert max-w-none"
            options={{
              forceBlock: true,
              overrides: {
                a: {
                  component: Link,
                  props: {
                    hasTargetBlank: true,
                  },
                },
              },
            }}
          >
            {content}
          </MarkdownTransJSX>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('empty')}</p>
        )}
      </section>
    </div>
  );
}
