'use client';

import React, { useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, RotateCcw, Sparkles } from 'lucide-react';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { H1, Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface SleepDebtClientProps {
  lng: Language;
}

const clampNumber = (value: number) => (Number.isNaN(value) ? 0 : value);

export default function SleepDebtClient({ lng }: SleepDebtClientProps) {
  const { t } = useTranslation(lng, 'sleep-debt');
  const [idealHours, setIdealHours] = useState('');
  const [actualHours, setActualHours] = useState('');
  const [days, setDays] = useState('');
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const ideal = clampNumber(Number(idealHours));
    const actual = clampNumber(Number(actualHours));
    const dayCount = clampNumber(Number(days));

    if (!ideal || !actual || !dayCount) {
      return { isValid: false };
    }

    const diff = ideal - actual;
    const total = diff * dayCount;

    return {
      isValid: true,
      diff,
      total,
      ideal,
    };
  }, [idealHours, actualHours, days]);

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(lng, {
        maximumFractionDigits: 1,
        minimumFractionDigits: 0,
      }),
    [lng],
  );

  const formatSigned = (value: number) => {
    if (value > 0) {
      return `+${formatter.format(value)}`;
    }

    if (value < 0) {
      return `-${formatter.format(Math.abs(value))}`;
    }

    return formatter.format(0);
  };

  const formatDuration = (hours: number) => {
    const totalMinutes = Math.round(Math.abs(hours) * 60);
    const displayHours = Math.floor(totalMinutes / 60);
    const displayMinutes = totalMinutes % 60;

    return t('result.duration', {
      hours: formatter.format(displayHours),
      minutes: formatter.format(displayMinutes),
    });
  };

  const handleCopy = async () => {
    if (!result.isValid) return;
    const statusKey = result.total >= 0 ? 'result.debt' : 'result.surplus';
    const copyText = t('copyText', {
      status: t(statusKey),
      total: t('result.hoursOnly', {
        value: formatter.format(Math.abs(result.total)),
      }),
      perDay: t('result.hoursOnly', {
        value: formatSigned(result.diff),
      }),
    });

    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy result:', error);
    }
  };

  const handleSample = () => {
    setIdealHours('8');
    setActualHours('6.5');
    setDays('7');
    setCopied(false);
  };

  const handleReset = () => {
    setIdealHours('');
    setActualHours('');
    setDays('');
    setCopied(false);
  };

  const showResult = result.isValid;
  const totalAbs = showResult ? Math.abs(result.total) : 0;
  const recoveryDays = showResult && result.total > 0 ? totalAbs / result.ideal : 0;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <H1>{t('title')}</H1>
        <Text className="text-sm text-gray-600 dark:text-gray-300">{t('description')}</Text>
      </div>

      <section className={cn(SERVICE_PANEL, 'space-y-4 p-4')}>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label
              htmlFor="ideal-hours"
              className="text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              {t('labels.ideal')}
            </label>
            <Input
              id="ideal-hours"
              type="number"
              min={0}
              step={0.1}
              value={idealHours}
              onChange={(event) => setIdealHours(event.target.value)}
              placeholder={t('placeholders.ideal')}
            />
            <Text className="text-xs text-gray-500 dark:text-gray-400">{t('helper.ideal')}</Text>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="actual-hours"
              className="text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              {t('labels.actual')}
            </label>
            <Input
              id="actual-hours"
              type="number"
              min={0}
              step={0.1}
              value={actualHours}
              onChange={(event) => setActualHours(event.target.value)}
              placeholder={t('placeholders.actual')}
            />
            <Text className="text-xs text-gray-500 dark:text-gray-400">{t('helper.actual')}</Text>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="day-count"
              className="text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              {t('labels.days')}
            </label>
            <Input
              id="day-count"
              type="number"
              min={1}
              step={1}
              value={days}
              onChange={(event) => setDays(event.target.value)}
              placeholder={t('placeholders.days')}
            />
            <Text className="text-xs text-gray-500 dark:text-gray-400">{t('helper.days')}</Text>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleSample} className="gap-2 px-3 py-2 text-xs">
            <Sparkles size={14} />
            {t('buttons.sample')}
          </Button>
          <Button
            type="button"
            onClick={handleReset}
            className="gap-2 px-3 py-2 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
          >
            <RotateCcw size={14} />
            {t('buttons.clear')}
          </Button>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <Text className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {t('result.title')}
          </Text>
          <Button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 text-xs"
            disabled={!showResult}
          >
            {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copied ? t('buttons.copied') : t('buttons.copy')}
          </Button>
        </div>

        {!showResult ? (
          <Text className="text-sm text-gray-500 dark:text-gray-400">{t('result.invalid')}</Text>
        ) : (
          <div className="space-y-3">
            <div className="rounded-2xl border border-dashed border-zinc-200/70 p-3 text-center text-sm dark:border-zinc-700/70">
              <Text className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                {result.total >= 0 ? t('result.debt') : t('result.surplus')}
              </Text>
              <Text className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {t('result.hoursOnly', {
                  value: formatter.format(totalAbs),
                })}
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                {formatDuration(totalAbs)}
              </Text>
            </div>

            <div className="grid gap-3 text-sm text-gray-700 dark:text-gray-200 md:grid-cols-3">
              <div className="space-y-1">
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {t('result.perDayLabel')}
                </Text>
                <Text className="font-semibold">
                  {t('result.hoursOnly', {
                    value: formatSigned(result.diff),
                  })}
                </Text>
              </div>
              <div className="space-y-1">
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {t('result.totalLabel')}
                </Text>
                <Text className="font-semibold">
                  {t('result.hoursOnly', {
                    value: formatter.format(totalAbs),
                  })}
                </Text>
              </div>
              <div className="space-y-1">
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  {t('result.recoveryLabel')}
                </Text>
                <Text className="font-semibold">
                  {result.total > 0
                    ? t('result.daysOnly', {
                        value: formatter.format(recoveryDays),
                      })
                    : t('result.notNeeded')}
                </Text>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-2 p-4')}>
        <Text className="text-sm font-semibold text-gray-800 dark:text-gray-100">
          {t('notes.title')}
        </Text>
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-600 dark:text-gray-300">
          {(t('notes.items', { returnObjects: true }) as string[]).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
