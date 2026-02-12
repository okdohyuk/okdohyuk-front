'use client';

import React, { useMemo, useState } from 'react';
import { RotateCcw, Shuffle } from 'lucide-react';
import { Button } from '@components/basic/Button';
import { Textarea } from '@components/basic/Textarea';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface LadderGameClientProps {
  lng: Language;
}

interface Assignment {
  name: string;
  result: string;
}

const parseList = (raw: string) =>
  raw
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const shuffleList = (items: string[]) => {
  const list = [...items];
  for (let index = list.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [list[index], list[randomIndex]] = [list[randomIndex], list[index]];
  }
  return list;
};

export default function LadderGameClient({ lng }: LadderGameClientProps) {
  const { t } = useTranslation(lng, 'ladder-game');
  const [participantsInput, setParticipantsInput] = useState('');
  const [resultsInput, setResultsInput] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const participants = useMemo(() => parseList(participantsInput), [participantsInput]);
  const results = useMemo(() => parseList(resultsInput), [resultsInput]);

  const buildAssignments = () => {
    if (!participants.length) {
      setErrorMessage(t('error.noParticipants'));
      setAssignments([]);
      return;
    }

    const filledResults = [...results];
    if (filledResults.length < participants.length) {
      for (let index = filledResults.length; index < participants.length; index += 1) {
        filledResults.push(t('autoResult', { index: index + 1 }));
      }
    }

    const normalizedResults = filledResults.slice(0, participants.length);
    const shuffledResults = shuffleList(normalizedResults);

    const nextAssignments = participants.map((name, index) => ({
      name,
      result: shuffledResults[index],
    }));

    setErrorMessage(null);
    setAssignments(nextAssignments);
  };

  const handleReset = () => {
    setParticipantsInput('');
    setResultsInput('');
    setAssignments([]);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="ladder-participants"
              className="text-sm font-semibold text-zinc-800 dark:text-zinc-100"
            >
              {t('participants.label')}
            </label>
            <Textarea
              id="ladder-participants"
              value={participantsInput}
              onChange={(event) => setParticipantsInput(event.target.value)}
              placeholder={t('participants.placeholder')}
              rows={6}
              className="text-sm"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('participants.helper')}</p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="ladder-results"
              className="text-sm font-semibold text-zinc-800 dark:text-zinc-100"
            >
              {t('results.label')}
            </label>
            <Textarea
              id="ladder-results"
              value={resultsInput}
              onChange={(event) => setResultsInput(event.target.value)}
              placeholder={t('results.placeholder')}
              rows={6}
              className="text-sm"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('results.helper')}</p>
          </div>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('notice')}</p>
        {errorMessage ? <p className="text-xs font-semibold text-red-500">{errorMessage}</p> : null}

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={buildAssignments} className="flex items-center gap-2">
            <Shuffle size={16} />
            {t('buttons.generate')}
          </Button>
          <Button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 bg-zinc-200 text-sm text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
          >
            <RotateCcw size={16} />
            {t('buttons.reset')}
          </Button>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
            {t('resultsTitle')}
          </h3>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {t('resultsCount', { count: assignments.length })}
          </span>
        </div>

        {assignments.length ? (
          <ul className="grid gap-3 md:grid-cols-2">
            {assignments.map((assignment) => (
              <li
                key={`${assignment.name}-${assignment.result}`}
                className={cn(
                  SERVICE_PANEL_SOFT,
                  SERVICE_CARD_INTERACTIVE,
                  'flex items-center justify-between gap-3 p-3',
                )}
              >
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  {assignment.name}
                </span>
                <span className="text-sm font-semibold text-point-1">{assignment.result}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('empty')}</p>
        )}
      </div>
    </div>
  );
}
