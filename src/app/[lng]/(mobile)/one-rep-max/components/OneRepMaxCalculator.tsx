'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { Text } from '@components/basic/Text';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/basic/Table';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface OneRepMaxCalculatorProps {
  lng: Language;
}

const PERCENT_STEPS = [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];

const roundToStep = (value: number, step: number) => Math.round(value / step) * step;

export default function OneRepMaxCalculator({ lng }: OneRepMaxCalculatorProps) {
  const { t } = useTranslation(lng, 'one-rep-max');
  const [unit, setUnit] = useState<'kg' | 'lb'>('kg');
  const [weightInput, setWeightInput] = useState('');
  const [repsInput, setRepsInput] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const weight = useMemo(() => Number.parseFloat(weightInput), [weightInput]);
  const reps = useMemo(() => Number.parseInt(repsInput, 10), [repsInput]);
  const validation = useMemo(() => {
    if (!weightInput && !repsInput) {
      return { weight: '', reps: '' };
    }
    const weightError = Number.isFinite(weight) && weight > 0 ? '' : t('validation.weight');
    const repsError = Number.isFinite(reps) && reps >= 1 && reps <= 12 ? '' : t('validation.reps');
    return { weight: weightError, reps: repsError };
  }, [reps, repsInput, t, weight, weightInput]);
  const result = useMemo(() => {
    if (validation.weight || validation.reps) {
      return null;
    }
    if (!Number.isFinite(weight) || !Number.isFinite(reps)) {
      return null;
    }
    const epley = weight * (1 + reps / 30);
    const brzycki = weight * (36 / (37 - reps));
    const average = (epley + brzycki) / 2;

    const roundStep = unit === 'kg' ? 0.5 : 1;

    const summary = {
      epley: roundToStep(epley, roundStep),
      brzycki: roundToStep(brzycki, roundStep),
      average: roundToStep(average, roundStep),
    };

    const table = PERCENT_STEPS.map((percent) => ({
      percent,
      weight: roundToStep((average * percent) / 100, roundStep),
    }));

    return { summary, table, roundStep };
  }, [reps, unit, validation.reps, validation.weight, weight]);

  const handleCopy = async () => {
    if (!result) {
      setCopyMessage(t('copy.fallback'));
      return;
    }

    const lines = [
      `${t('result.title')}: ${result.summary.average}${unit}`,
      `${t('result.epley')}: ${result.summary.epley}${unit}`,
      `${t('result.brzycki')}: ${result.summary.brzycki}${unit}`,
      '',
      `${t('table.title')}`,
      ...result.table.map((row) => `${row.percent}% → ${row.weight}${unit}`),
    ];

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopyMessage(t('copy.success'));
    } catch (error) {
      setCopyMessage(t('copy.fallback'));
    }
  };

  const handleReset = () => {
    setWeightInput('');
    setRepsInput('');
    setCopyMessage('');
  };

  return (
    <div className="space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <Text asChild variant="d2" color="basic-4">
            <label htmlFor="weight-input">{t('input.weightLabel')}</label>
          </Text>
          <Input
            id="weight-input"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            placeholder={t('input.weightPlaceholder')}
            value={weightInput}
            onChange={(event) => setWeightInput(event.target.value)}
          />
          {validation.weight && (
            <Text variant="c1" color="basic-5">
              {validation.weight}
            </Text>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
          <div className="space-y-2">
            <Text asChild variant="d2" color="basic-4">
              <label htmlFor="reps-input">{t('input.repsLabel')}</label>
            </Text>
            <Input
              id="reps-input"
              type="number"
              inputMode="numeric"
              min="1"
              max="12"
              step="1"
              placeholder={t('input.repsPlaceholder')}
              value={repsInput}
              onChange={(event) => setRepsInput(event.target.value)}
            />
            {validation.reps && (
              <Text variant="c1" color="basic-5">
                {validation.reps}
              </Text>
            )}
          </div>

          <div className="space-y-2">
            <Text asChild variant="d2" color="basic-4">
              <label htmlFor="unit-select">{t('unit.label')}</label>
            </Text>
            <Select value={unit} onValueChange={(value) => setUnit(value as 'kg' | 'lb')}>
              <SelectTrigger id="unit-select" aria-label={t('unit.label')}>
                <SelectValue placeholder={t('unit.label')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">{t('unit.kg')}</SelectItem>
                <SelectItem value="lb">{t('unit.lb')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <Text variant="c1" color="basic-5">
            {t('helper.formula')}
          </Text>
          <Text variant="c1" color="basic-6">
            {t('helper.disclaimer')}
          </Text>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleCopy} className="px-4 py-2 text-sm">
            {t('button.copy')}
          </Button>
          <Button
            onClick={handleReset}
            className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100"
          >
            {t('button.reset')}
          </Button>
          {copyMessage && (
            <Text variant="c1" color="basic-5" className="self-center">
              {copyMessage}
            </Text>
          )}
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <Text variant="d1" color="basic-2">
            {t('result.title')}
          </Text>
          {result ? (
            <div className="space-y-2">
              <Text asChild variant="t2" color="basic-1">
                <p>
                  {result.summary.average}
                  <span className="text-base font-normal text-gray-500">{unit}</span>
                </p>
              </Text>
              <div className="grid gap-2 text-sm text-gray-600 dark:text-gray-300 sm:grid-cols-2">
                <Text variant="d3" color="basic-4">
                  {t('result.epley')}: {result.summary.epley}
                  {unit}
                </Text>
                <Text variant="d3" color="basic-4">
                  {t('result.brzycki')}: {result.summary.brzycki}
                  {unit}
                </Text>
              </div>
            </div>
          ) : (
            <Text variant="d2" color="basic-5">
              {t('result.placeholder')}
            </Text>
          )}
        </div>

        <div className="space-y-3">
          <Text variant="d2" color="basic-3">
            {t('table.title')}
          </Text>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.headerPercent')}</TableHead>
                <TableHead>{t('table.headerWeight')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PERCENT_STEPS.map((percent) => {
                const row = result?.table.find((item) => item.percent === percent);
                return (
                  <TableRow key={percent}>
                    <TableCell>{percent}%</TableCell>
                    <TableCell>{row ? `${row.weight}${unit}` : `—${unit}`}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
