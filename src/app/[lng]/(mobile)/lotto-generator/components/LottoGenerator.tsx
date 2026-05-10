'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface LottoGeneratorStrings {
  settingsTitle: string;
  resultsTitle: string;
  helper: string;
  labels: {
    minNumber: string;
    maxNumber: string;
    picksPerTicket: string;
    ticketCount: string;
    includeBonus: string;
  };
  placeholders: {
    minNumber: string;
    maxNumber: string;
    picksPerTicket: string;
    ticketCount: string;
  };
  buttons: {
    generate: string;
    clear: string;
    copy: string;
    reset: string;
  };
  status: {
    copied: string;
    empty: string;
  };
  validation: {
    range: string;
    picks: string;
    tickets: string;
  };
}

interface LottoResult {
  id: string;
  numbers: number[];
  bonus?: number;
}

interface LottoGeneratorProps {
  strings: LottoGeneratorStrings;
}

const DEFAULT_SETTINGS = {
  minNumber: 1,
  maxNumber: 45,
  picksPerTicket: 6,
  ticketCount: 5,
  includeBonus: false,
};

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
};

const generateTicket = (
  minNumber: number,
  maxNumber: number,
  picksPerTicket: number,
  includeBonus: boolean,
): LottoResult => {
  const pool = Array.from({ length: maxNumber - minNumber + 1 }, (_, index) => index + minNumber);

  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const numbers = pool.slice(0, picksPerTicket).sort((a, b) => a - b);
  let bonus: number | undefined;

  if (includeBonus) {
    bonus = pool[picksPerTicket];
  }

  return { id: createId(), numbers, bonus };
};

export default function LottoGenerator({ strings }: LottoGeneratorProps) {
  const [minNumber, setMinNumber] = useState(DEFAULT_SETTINGS.minNumber);
  const [maxNumber, setMaxNumber] = useState(DEFAULT_SETTINGS.maxNumber);
  const [picksPerTicket, setPicksPerTicket] = useState(DEFAULT_SETTINGS.picksPerTicket);
  const [ticketCount, setTicketCount] = useState(DEFAULT_SETTINGS.ticketCount);
  const [includeBonus, setIncludeBonus] = useState(DEFAULT_SETTINGS.includeBonus);

  const [results, setResults] = useState<LottoResult[]>([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const resultsText = useMemo(() => {
    if (results.length === 0) return '';

    return results
      .map((result, index) => {
        const main = result.numbers.join(', ');
        const bonus = result.bonus !== undefined ? ` (+ ${result.bonus})` : '';
        return `${index + 1}. ${main}${bonus}`;
      })
      .join('\n');
  }, [results]);

  const handleGenerate = () => {
    setError('');
    setCopied(false);

    if (minNumber >= maxNumber) {
      setError(strings.validation.range);
      return;
    }

    const rangeSize = maxNumber - minNumber + 1;
    const totalNeeded = includeBonus ? picksPerTicket + 1 : picksPerTicket;

    if (totalNeeded > rangeSize) {
      setError(strings.validation.picks);
      return;
    }

    if (ticketCount < 1 || ticketCount > 20) {
      setError(strings.validation.tickets);
      return;
    }

    const nextResults = Array.from({ length: ticketCount }, () =>
      generateTicket(minNumber, maxNumber, picksPerTicket, includeBonus),
    );

    setResults(nextResults);
  };

  const handleClear = () => {
    setResults([]);
    setError('');
    setCopied(false);
  };

  const handleReset = () => {
    setMinNumber(DEFAULT_SETTINGS.minNumber);
    setMaxNumber(DEFAULT_SETTINGS.maxNumber);
    setPicksPerTicket(DEFAULT_SETTINGS.picksPerTicket);
    setTicketCount(DEFAULT_SETTINGS.ticketCount);
    setIncludeBonus(DEFAULT_SETTINGS.includeBonus);
    handleClear();
  };

  const handleCopy = async () => {
    if (!resultsText) return;

    try {
      await navigator.clipboard.writeText(resultsText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch (copyError) {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className={cn(SERVICE_PANEL, 'space-y-4 p-4')}>
        <div className="space-y-1">
          <Text className="text-sm font-semibold text-fg-1">{strings.settingsTitle}</Text>
          <Text className="text-xs text-fg-5">{strings.helper}</Text>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="lotto-min-number" className="text-xs font-medium text-fg-4">
              {strings.labels.minNumber}
            </label>
            <Input
              id="lotto-min-number"
              type="number"
              min={1}
              value={minNumber}
              onChange={(event) => setMinNumber(Number(event.target.value))}
              placeholder={strings.placeholders.minNumber}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="lotto-max-number" className="text-xs font-medium text-fg-4">
              {strings.labels.maxNumber}
            </label>
            <Input
              id="lotto-max-number"
              type="number"
              min={1}
              value={maxNumber}
              onChange={(event) => setMaxNumber(Number(event.target.value))}
              placeholder={strings.placeholders.maxNumber}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="lotto-picks" className="text-xs font-medium text-fg-4">
              {strings.labels.picksPerTicket}
            </label>
            <Input
              id="lotto-picks"
              type="number"
              min={1}
              value={picksPerTicket}
              onChange={(event) => setPicksPerTicket(Number(event.target.value))}
              placeholder={strings.placeholders.picksPerTicket}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="lotto-ticket-count" className="text-xs font-medium text-fg-4">
              {strings.labels.ticketCount}
            </label>
            <Input
              id="lotto-ticket-count"
              type="number"
              min={1}
              max={20}
              value={ticketCount}
              onChange={(event) => setTicketCount(Number(event.target.value))}
              placeholder={strings.placeholders.ticketCount}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="lotto-include-bonus"
            type="checkbox"
            checked={includeBonus}
            onChange={() => setIncludeBonus((prev) => !prev)}
            className="h-4 w-4 rounded border-basic-3 bg-basic-2 text-point-fg focus:ring-2 focus:ring-point-1"
          />
          <label htmlFor="lotto-include-bonus" className="text-xs text-fg-4">
            {strings.labels.includeBonus}
          </label>
        </div>

        {error && <Text className="text-xs text-danger-2">{error}</Text>}

        <div className="flex flex-wrap gap-2">
          <Button type="button" className="px-4 text-sm" onClick={handleGenerate}>
            {strings.buttons.generate}
          </Button>
          <button
            type="button"
            className="rounded-md border border-basic-3 px-3 py-1 text-xs font-medium text-fg-4 transition hover:border-point-2/70 hover:text-point-2"
            onClick={handleClear}
          >
            {strings.buttons.clear}
          </button>
          <button
            type="button"
            className="rounded-md border border-basic-3 px-3 py-1 text-xs font-medium text-fg-4 transition hover:border-point-2/70 hover:text-point-2"
            onClick={handleReset}
          >
            {strings.buttons.reset}
          </button>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Text className="text-sm font-semibold text-fg-1">{strings.resultsTitle}</Text>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-md border border-basic-3 px-3 py-1 text-xs font-medium text-fg-4 transition hover:border-point-2/70 hover:text-point-2 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleCopy}
              disabled={!resultsText}
            >
              {copied ? strings.status.copied : strings.buttons.copy}
            </button>
          </div>
        </div>

        {results.length === 0 ? (
          <Text className="text-sm text-fg-5">{strings.status.empty}</Text>
        ) : (
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={result.id}
                className="flex flex-wrap items-center gap-2 rounded-2xl border border-basic-3 bg-basic-0/80 p-3 text-sm text-fg-3 shadow-sm"
              >
                <Text className="text-xs font-semibold text-fg-5">#{index + 1}</Text>
                <div className="flex flex-wrap items-center gap-2">
                  {result.numbers.map((number) => (
                    <span
                      key={number}
                      className="rounded-full bg-point-1/10 px-3 py-1 text-xs font-semibold text-point-fg"
                    >
                      {number}
                    </span>
                  ))}
                  {result.bonus !== undefined && (
                    <span className="rounded-full bg-point-2/10 px-3 py-1 text-xs font-semibold text-point-2">
                      + {result.bonus}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
