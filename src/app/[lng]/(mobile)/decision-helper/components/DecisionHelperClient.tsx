'use client';

import React, { useState } from 'react';
import { Button } from '@components/basic/Button';
import { Textarea } from '@components/basic/Textarea';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface DecisionHelperClientProps {
  lng: Language;
}

const parseLines = (value: string) =>
  value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

const shuffle = <T,>(items: T[]) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

const createId = () => {
  if (typeof globalThis.crypto !== 'undefined' && 'randomUUID' in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random()}`;
};

export default function DecisionHelperClient({ lng }: DecisionHelperClientProps) {
  const { t } = useTranslation(lng, 'decision-helper');
  const [participants, setParticipants] = useState('');
  const [outcomes, setOutcomes] = useState('');
  const [ladderResults, setLadderResults] = useState<
    { id: string; participant: string; outcome: string }[]
  >([]);
  const [ladderError, setLadderError] = useState('');

  const [pickerItems, setPickerItems] = useState('');
  const [pickerResult, setPickerResult] = useState('');
  const [pickerHistory, setPickerHistory] = useState<{ id: string; label: string }[]>([]);
  const [pickerError, setPickerError] = useState('');

  const [coinResult, setCoinResult] = useState<'heads' | 'tails' | null>(null);

  const handleDraw = () => {
    setLadderError('');
    const playerList = parseLines(participants);
    if (playerList.length < 2) {
      setLadderResults([]);
      setLadderError(t('sections.ladder.errorParticipants'));
      return;
    }

    const outcomeList = parseLines(outcomes);
    const filledOutcomes = [...outcomeList];

    if (filledOutcomes.length === 0) {
      playerList.forEach((_, index) => {
        filledOutcomes.push(t('sections.ladder.defaultOutcome', { index: index + 1 }));
      });
    } else if (filledOutcomes.length < playerList.length) {
      const missing = playerList.length - filledOutcomes.length;
      const baseIndex = filledOutcomes.length;
      Array.from({ length: missing }).forEach((_, index) => {
        filledOutcomes.push(t('sections.ladder.defaultOutcome', { index: baseIndex + index + 1 }));
      });
    }

    const shuffled = shuffle(filledOutcomes).slice(0, playerList.length);
    setLadderResults(
      playerList.map((participant, index) => ({
        id: createId(),
        participant,
        outcome: shuffled[index],
      })),
    );
  };

  const handlePick = () => {
    setPickerError('');
    const itemList = parseLines(pickerItems);
    if (itemList.length === 0) {
      setPickerResult('');
      setPickerError(t('sections.picker.errorItems'));
      return;
    }
    const choice = itemList[Math.floor(Math.random() * itemList.length)];
    setPickerResult(choice);
    setPickerHistory((prev) => [{ id: createId(), label: choice }, ...prev].slice(0, 5));
  };

  const handleFlip = () => {
    setCoinResult(Math.random() > 0.5 ? 'heads' : 'tails');
  };

  return (
    <div className="w-full space-y-8">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {t('sections.ladder.title')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('sections.ladder.description')}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="decision-helper-participants"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('sections.ladder.labels.participants')}
            </label>
            <Textarea
              id="decision-helper-participants"
              className="min-h-[120px]"
              value={participants}
              onChange={(event) => setParticipants(event.target.value)}
              placeholder={t('sections.ladder.placeholders.participants')}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="decision-helper-outcomes"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('sections.ladder.labels.outcomes')}
            </label>
            <Textarea
              id="decision-helper-outcomes"
              className="min-h-[120px]"
              value={outcomes}
              onChange={(event) => setOutcomes(event.target.value)}
              placeholder={t('sections.ladder.placeholders.outcomes')}
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('sections.ladder.helper')}</p>
        {ladderError && <p className="text-xs text-red-500">{ladderError}</p>}
        <Button type="button" onClick={handleDraw} className="w-full">
          {ladderResults.length > 0
            ? t('sections.ladder.button.redraw')
            : t('sections.ladder.button.draw')}
        </Button>
        <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-3 p-4')}>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t('sections.ladder.resultTitle')}
          </h3>
          {ladderResults.length > 0 ? (
            <ul className="space-y-2">
              {ladderResults.map((result) => (
                <li
                  key={result.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-200/70 bg-white/80 px-3 py-2 text-sm text-gray-700 shadow-sm dark:border-zinc-700/70 dark:bg-zinc-900/80 dark:text-gray-200"
                >
                  <span className="font-medium">{result.participant}</span>
                  <span className="font-semibold text-point-1">{result.outcome}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('sections.ladder.empty')}</p>
          )}
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {t('sections.picker.title')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('sections.picker.description')}
          </p>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="decision-helper-items"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('sections.picker.labels.items')}
          </label>
          <Textarea
            id="decision-helper-items"
            className="min-h-[110px]"
            value={pickerItems}
            onChange={(event) => setPickerItems(event.target.value)}
            placeholder={t('sections.picker.placeholders.items')}
          />
        </div>
        {pickerError && <p className="text-xs text-red-500">{pickerError}</p>}
        <Button type="button" onClick={handlePick} className="w-full">
          {pickerResult ? t('sections.picker.button.repick') : t('sections.picker.button.pick')}
        </Button>
        <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-3 p-4')}>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t('sections.picker.resultLabel')}
          </h3>
          {pickerResult ? (
            <p className="text-lg font-semibold text-point-1">{pickerResult}</p>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('sections.picker.empty')}</p>
          )}
          {pickerHistory.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {t('sections.picker.historyLabel')}
              </p>
              <div className="flex flex-wrap gap-2">
                {pickerHistory.map((item) => (
                  <span
                    key={item.id}
                    className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  >
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {t('sections.coin.title')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('sections.coin.description')}
          </p>
        </div>
        <Button type="button" onClick={handleFlip} className="w-full">
          {coinResult ? t('sections.coin.button.reflip') : t('sections.coin.button.flip')}
        </Button>
        <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-3 p-4')}>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t('sections.coin.resultLabel')}
          </h3>
          {coinResult ? (
            <p className="text-lg font-semibold text-point-1">
              {t(`sections.coin.result.${coinResult}`)}
            </p>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('sections.coin.empty')}</p>
          )}
        </div>
      </section>
    </div>
  );
}
