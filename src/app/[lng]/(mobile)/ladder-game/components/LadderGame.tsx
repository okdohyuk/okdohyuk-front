'use client';

import React, { useId, useMemo, useState } from 'react';
import { Shuffle, RotateCcw } from 'lucide-react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Textarea } from '@components/basic/Textarea';
import { Button } from '@components/basic/Button';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface LadderGameProps {
  lng: Language;
}

const parseItems = (value: string) =>
  value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

const shuffleItems = (items: string[]) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export default function LadderGame({ lng }: LadderGameProps) {
  const { t } = useTranslation(lng, 'ladder-game');
  const [participantsInput, setParticipantsInput] = useState('');
  const [resultsInput, setResultsInput] = useState('');
  const [pairs, setPairs] = useState<Array<{ id: string; participant: string; result: string }>>(
    [],
  );
  const [error, setError] = useState<string | null>(null);
  const participantsId = useId();
  const resultsId = useId();

  const participants = useMemo(() => parseItems(participantsInput), [participantsInput]);
  const results = useMemo(() => parseItems(resultsInput), [resultsInput]);

  const buildDefaultResults = (count: number) =>
    Array.from({ length: count }, (_, index) => t('defaults.result', { index: index + 1 }));

  const handleGenerate = () => {
    if (participants.length < 2) {
      setError(t('error.emptyParticipants'));
      setPairs([]);
      return;
    }

    const finalResults = results.length ? results : buildDefaultResults(participants.length);

    if (finalResults.length !== participants.length) {
      setError(t('error.mismatch', { count: participants.length }));
      setPairs([]);
      return;
    }

    setError(null);
    const shuffledResults = shuffleItems(finalResults);
    setPairs(
      participants.map((participant, index) => ({
        id: crypto.randomUUID(),
        participant,
        result: shuffledResults[index],
      })),
    );
  };

  const handleReset = () => {
    setParticipantsInput('');
    setResultsInput('');
    setPairs([]);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <ServicePageHeader title={t('title')} description={t('description')} badge={t('badge')} />

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor={participantsId}
              className="text-sm font-semibold text-zinc-700 dark:text-zinc-200"
            >
              {t('labels.participants')}
            </label>
            <Textarea
              id={participantsId}
              rows={6}
              value={participantsInput}
              onChange={(event) => setParticipantsInput(event.target.value)}
              placeholder={t('placeholder.participants')}
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('helper.participants')}</p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor={resultsId}
              className="text-sm font-semibold text-zinc-700 dark:text-zinc-200"
            >
              {t('labels.results')}
            </label>
            <Textarea
              id={resultsId}
              rows={6}
              value={resultsInput}
              onChange={(event) => setResultsInput(event.target.value)}
              placeholder={t('placeholder.results')}
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('helper.results')}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span>{t('status.participants', { count: participants.length })}</span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span>{t('status.ready')}</span>
        </div>

        {error ? (
          <p className="text-sm font-semibold text-red-500 dark:text-red-400">{error}</p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button className="h-12 text-sm font-semibold" onClick={handleGenerate}>
            {t('buttons.generate')}
          </Button>
          <button
            type="button"
            onClick={handleReset}
            className={cn(
              SERVICE_CARD_INTERACTIVE,
              'inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white/80 px-3 py-2 text-sm font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-200',
            )}
          >
            <RotateCcw className="h-4 w-4" />
            {t('buttons.reset')}
          </button>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          <Shuffle className="h-4 w-4 text-point-1" />
          {t('result.title', { count: pairs.length })}
        </div>

        {pairs.length ? (
          <ul className="grid gap-2 md:grid-cols-2">
            {pairs.map((pair) => (
              <li
                key={pair.id}
                className="rounded-2xl border border-point-2/40 bg-point-2/10 px-4 py-3 text-sm font-semibold text-zinc-700 dark:border-point-2/30 dark:bg-point-1/15 dark:text-zinc-100"
              >
                <span className="text-point-1">{pair.participant}</span>
                <span className="mx-2 text-zinc-300 dark:text-zinc-600">→</span>
                <span className="text-zinc-800 dark:text-zinc-50">{pair.result}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('result.empty')}</p>
        )}
      </section>
    </div>
  );
}
