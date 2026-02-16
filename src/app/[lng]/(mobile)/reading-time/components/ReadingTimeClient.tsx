'use client';

import React, { useMemo, useState } from 'react';
import { Input } from '@components/basic/Input';
import { Textarea } from '@components/basic/Textarea';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { cn } from '@utils/cn';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

interface ReadingTimeClientProps {
  lng: Language;
}

const DEFAULT_WPM = 220;
const MIN_WPM = 80;
const MAX_WPM = 600;

export default function ReadingTimeClient({ lng }: ReadingTimeClientProps) {
  const { t } = useTranslation(lng, 'reading-time');
  const [text, setText] = useState('');
  const [wpm, setWpm] = useState(DEFAULT_WPM);

  const wordCount = useMemo(() => {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  }, [text]);

  const estimatedSeconds = useMemo(() => {
    if (!wordCount) return 0;
    const safeWpm = Math.min(Math.max(wpm, MIN_WPM), MAX_WPM);
    return Math.max(1, Math.ceil((wordCount / safeWpm) * 60));
  }, [wordCount, wpm]);

  const minutes = Math.floor(estimatedSeconds / 60);
  const seconds = estimatedSeconds % 60;
  const tips = t('tips', { returnObjects: true }) as string[];

  return (
    <div className="space-y-4">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <label
          htmlFor="reading-text"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('label.text')}
        </label>
        <Textarea
          id="reading-text"
          className="h-36 resize-none"
          placeholder={t('placeholder')}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper.text')}</p>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'grid gap-4 p-4 md:grid-cols-2')}>
        <div className="space-y-2">
          <label
            htmlFor="reading-wpm"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.speed')}
          </label>
          <Input
            id="reading-wpm"
            type="number"
            min={MIN_WPM}
            max={MAX_WPM}
            value={wpm}
            onChange={(event) => setWpm(Number(event.target.value))}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper.speed')}</p>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-200/70 bg-white/80 p-3 text-zinc-800 shadow-sm dark:border-zinc-700/70 dark:bg-zinc-900/60 dark:text-zinc-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t('label.words')}
            </p>
            <p className="mt-1 text-2xl font-bold">{wordCount.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-zinc-200/70 bg-white/80 p-3 text-zinc-800 shadow-sm dark:border-zinc-700/70 dark:bg-zinc-900/60 dark:text-zinc-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t('label.result')}
            </p>
            <p className="mt-1 text-lg font-semibold">
              {wordCount === 0
                ? t('result.empty')
                : t('result.time', {
                    minutes,
                    seconds,
                  })}
            </p>
          </div>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-2 p-4')}>
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{t('tipsTitle')}</h3>
        <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-300">
          {tips.map((tip) => (
            <li key={tip} className="flex gap-2">
              <span className="text-point-1">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
