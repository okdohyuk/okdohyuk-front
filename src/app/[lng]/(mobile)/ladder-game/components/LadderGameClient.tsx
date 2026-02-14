'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Textarea } from '@components/basic/Textarea';
import { Button } from '@components/basic/Button';
import { cn } from '@utils/cn';
import { Copy, RotateCcw, Shuffle } from 'lucide-react';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

type LadderMatch = {
  participant: string;
  result: string;
};

type LadderGameClientProps = {
  lng: Language;
};

const splitEntries = (value: string) =>
  value
    .split(/[\n,]/g)
    .map((item) => item.trim())
    .filter(Boolean);

const shuffleEntries = (items: string[]) => {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[nextIndex]] = [shuffled[nextIndex], shuffled[index]];
  }
  return shuffled;
};

export default function LadderGameClient({ lng }: LadderGameClientProps) {
  const { t } = useTranslation(lng, 'ladder-game');
  const [participantsText, setParticipantsText] = useState('');
  const [resultsText, setResultsText] = useState('');
  const [matches, setMatches] = useState<LadderMatch[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const participants = useMemo(() => splitEntries(participantsText), [participantsText]);
  const results = useMemo(() => splitEntries(resultsText), [resultsText]);

  const summaryText = t('summary', {
    participants: participants.length,
    results: results.length,
  });

  const clearStatus = () => {
    setErrorMessage('');
    setCopied(false);
  };

  const handleDraw = () => {
    clearStatus();
    if (participants.length < 2) {
      setErrorMessage(t('error.participantsRequired'));
      return;
    }
    if (results.length < 2) {
      setErrorMessage(t('error.resultsRequired'));
      return;
    }
    if (participants.length !== results.length) {
      setErrorMessage(t('error.countMismatch'));
      return;
    }
    const shuffledResults = shuffleEntries(results);
    const nextMatches = participants.map((participant, index) => ({
      participant,
      result: shuffledResults[index],
    }));
    setMatches(nextMatches);
  };

  const handleReset = () => {
    setParticipantsText('');
    setResultsText('');
    setMatches([]);
    clearStatus();
  };

  const handleCopy = async () => {
    if (!matches.length || typeof navigator === 'undefined' || !navigator.clipboard) return;
    try {
      const textToCopy = matches
        .map((match) => `${match.participant} → ${match.result}`)
        .join('\n');
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      setCopied(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="flex-1 space-y-2">
            <label
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
              htmlFor="participants"
            >
              {t('label.participants')}
            </label>
            <Textarea
              id="participants"
              className="min-h-[120px]"
              placeholder={t('placeholder.participants')}
              value={participantsText}
              onChange={(event) => setParticipantsText(event.target.value)}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper.participants')}</p>
          </div>
          <div className="flex-1 space-y-2">
            <label
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
              htmlFor="results"
            >
              {t('label.results')}
            </label>
            <Textarea
              id="results"
              className="min-h-[120px]"
              placeholder={t('placeholder.results')}
              value={resultsText}
              onChange={(event) => setResultsText(event.target.value)}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper.results')}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {summaryText}
          </span>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleDraw} className="gap-2 px-4 py-2 text-sm">
              <Shuffle size={16} />
              {matches.length ? t('button.shuffle') : t('button.draw')}
            </Button>
            <Button
              onClick={handleReset}
              className="gap-2 px-4 py-2 text-sm bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
            >
              <RotateCcw size={16} />
              {t('button.reset')}
            </Button>
          </div>
        </div>

        {errorMessage ? <p className="text-sm text-red-500">{errorMessage}</p> : null}
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {t('result.title')}
          </h3>
          <Button
            onClick={handleCopy}
            className="gap-2 px-3 py-2 text-xs bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
            disabled={!matches.length}
          >
            <Copy size={14} />
            {t('button.copy')}
          </Button>
        </div>

        {matches.length ? (
          <ul className="space-y-2">
            {matches.map((match) => (
              <li
                key={`${match.participant}-${match.result}`}
                className="flex items-center justify-between rounded-lg border border-zinc-200/70 bg-white/80 px-3 py-2 text-sm text-gray-700 shadow-sm dark:border-zinc-700/70 dark:bg-zinc-900/70 dark:text-gray-200"
              >
                <span className="font-medium">{match.participant}</span>
                <span className="text-gray-500 dark:text-gray-400">→</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {match.result}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('result.empty')}</p>
        )}

        {copied ? <p className="text-xs text-green-500">{t('result.copied')}</p> : null}
      </section>
    </div>
  );
}
