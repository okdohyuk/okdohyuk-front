'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import Tag from '@components/basic/Tag';
import { H1, Text } from '@components/basic/Text';
import { Textarea } from '@components/basic/Textarea';
import { cn } from '@utils/cn';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';

interface DiceRollerClientProps {
  lng: Language;
}

type RollHistory = {
  id: string;
  label: string;
  total: number;
};

type RollResult = {
  id: string;
  value: number;
};

const PRESET_SIDES = [4, 6, 8, 10, 12, 20, 100];
const MAX_SIDES = 1000;
const MAX_DICE = 20;

export default function DiceRollerClient({ lng }: DiceRollerClientProps) {
  const { t } = useTranslation(lng, 'dice-roller');
  const [sides, setSides] = useState(6);
  const [diceCount, setDiceCount] = useState(2);
  const [results, setResults] = useState<RollResult[]>([]);
  const [history, setHistory] = useState<RollHistory[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [note, setNote] = useState('');

  const total = useMemo(() => results.reduce((sum, result) => sum + result.value, 0), [results]);
  const totalLabel = t('labels.total');

  const resetCopiedLater = () => {
    window.setTimeout(() => setCopied(false), 1000);
  };

  const validate = () => {
    if (Number.isNaN(sides) || sides < 2 || sides > MAX_SIDES) {
      setErrorMessage(t('messages.invalidSides'));
      return false;
    }

    if (Number.isNaN(diceCount) || diceCount < 1 || diceCount > MAX_DICE) {
      setErrorMessage(t('messages.invalidCount'));
      return false;
    }

    setErrorMessage('');
    return true;
  };

  const rollDice = () => {
    if (!validate()) return;

    const nextResults = Array.from({ length: diceCount }, () => ({
      id: crypto.randomUUID(),
      value: Math.floor(Math.random() * sides + 1),
    }));
    const nextTotal = nextResults.reduce((sum, result) => sum + result.value, 0);
    const label = `d${sides} × ${diceCount} → ${nextResults
      .map((result) => result.value)
      .join(', ')} (${totalLabel} ${nextTotal})`;

    setResults(nextResults);
    setHistory((prev) =>
      [{ id: crypto.randomUUID(), label, total: nextTotal }, ...prev].slice(0, 6),
    );
    setNote('');
  };

  const handleCopy = async () => {
    if (!results.length) return;
    const text = `d${sides} × ${diceCount}: ${results
      .map((result) => result.value)
      .join(', ')} (${totalLabel} ${total})`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    resetCopiedLater();
  };

  const handleClear = () => {
    setResults([]);
    setHistory([]);
    setNote('');
    setErrorMessage('');
    setCopied(false);
  };

  const handleExample = () => {
    setSides(6);
    setDiceCount(3);
    setNote(t('messages.exampleReady'));
  };

  return (
    <div className="space-y-6">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-2 p-4')}>
        <H1 className="text-2xl">{t('headline')}</H1>
        <Text variant="d2" color="basic-4">
          {t('helper')}
        </Text>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <Text variant="d2" color="basic-4">
            {t('labels.sides')}
          </Text>
          <div className="flex flex-wrap gap-2">
            {PRESET_SIDES.map((preset) => (
              <Button
                key={preset}
                type="button"
                className={cn('px-3 py-1 text-sm', preset === sides ? 'bg-point-1' : 'bg-point-2')}
                onClick={() => setSides(preset)}
              >
                d{preset}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Text variant="d3" color="basic-5">
              {t('labels.customSides')}
            </Text>
            <Input
              type="number"
              min={2}
              max={MAX_SIDES}
              value={sides}
              onChange={(event) => setSides(Number(event.target.value))}
              className="w-24"
              aria-label={t('labels.sides')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Text variant="d2" color="basic-4">
            {t('labels.count')}
          </Text>
          <Input
            type="number"
            min={1}
            max={MAX_DICE}
            value={diceCount}
            onChange={(event) => setDiceCount(Number(event.target.value))}
            className="w-24"
            aria-label={t('labels.count')}
          />
        </div>

        {errorMessage ? (
          <Text variant="d3" className="text-red-500">
            {errorMessage}
          </Text>
        ) : null}

        {note ? (
          <Text variant="d3" color="basic-5">
            {note}
          </Text>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={rollDice}>
            {t('buttons.roll')}
          </Button>
          <Button type="button" className="bg-zinc-700 hover:bg-zinc-600" onClick={handleExample}>
            {t('buttons.example')}
          </Button>
          <Button type="button" className="bg-zinc-500 hover:bg-zinc-400" onClick={handleClear}>
            {t('buttons.clear')}
          </Button>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="flex items-center justify-between">
          <Text variant="d2" color="basic-4">
            {t('labels.result')}
          </Text>
          <Button
            type="button"
            className="bg-zinc-700 hover:bg-zinc-600"
            onClick={handleCopy}
            disabled={!results.length}
          >
            {copied ? t('messages.copied') : t('buttons.copy')}
          </Button>
        </div>
        {results.length ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {results.map((result) => (
                <Tag key={result.id} tag={`${result.value}`} />
              ))}
            </div>
            <Text variant="d2" color="basic-3">
              {totalLabel} {total}
            </Text>
          </div>
        ) : (
          <Text variant="d3" color="basic-5">
            {t('messages.empty')}
          </Text>
        )}
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="flex items-center justify-between">
          <Text variant="d2" color="basic-4">
            {t('labels.history')}
          </Text>
          <Button
            type="button"
            className="bg-zinc-600 hover:bg-zinc-500"
            onClick={() => setHistory([])}
            disabled={!history.length}
          >
            {t('buttons.clearHistory')}
          </Button>
        </div>
        {history.length ? (
          <div className="space-y-2">
            {history.map((item) => (
              <Text key={item.id} variant="d3" color="basic-5">
                {item.label}
              </Text>
            ))}
          </div>
        ) : (
          <Text variant="d3" color="basic-5">
            {t('messages.historyEmpty')}
          </Text>
        )}
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <Text variant="d2" color="basic-4">
          {t('labels.notes')}
        </Text>
        <Textarea
          value={results.map((result) => result.value).join(', ')}
          readOnly
          className="min-h-[90px] text-sm"
          placeholder={t('messages.notePlaceholder')}
        />
      </section>
    </div>
  );
}
