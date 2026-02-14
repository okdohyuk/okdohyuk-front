'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck } from 'lucide-react';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import {
  createDateTimeFromInputs,
  formatDateInput,
  formatTimeInput,
  formatWeekday,
  formatDateOutput,
  formatTimeOutput,
  getLocaleTag,
} from '~/app/[lng]/(mobile)/time-calculator/utils/time';

interface TimeCalculatorClientProps {
  lng: Language;
}

type Mode = 'add' | 'subtract';

export default function TimeCalculatorClient({ lng }: TimeCalculatorClientProps) {
  const { t } = useTranslation(lng, 'time-calculator');
  const [baseDate, setBaseDate] = useState('');
  const [baseTime, setBaseTime] = useState('');
  const [mode, setMode] = useState<Mode>('add');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const now = new Date();
    setBaseDate(formatDateInput(now));
    setBaseTime(formatTimeInput(now));
    setHours('1');
    setMinutes('30');
  }, []);

  const localeTag = useMemo(() => getLocaleTag(lng), [lng]);

  const calculation = useMemo(() => {
    const baseDateTime = createDateTimeFromInputs(baseDate, baseTime);
    if (!baseDateTime) {
      return {
        isValid: false,
        totalMinutes: 0,
        resultDate: null as Date | null,
        resultText: '',
      };
    }

    const hoursValue = Number(hours || 0);
    const minutesValue = Number(minutes || 0);
    const safeHours = Number.isFinite(hoursValue) ? Math.max(0, hoursValue) : 0;
    const safeMinutes = Number.isFinite(minutesValue) ? Math.max(0, minutesValue) : 0;

    const totalMinutes = safeHours * 60 + safeMinutes;
    const signedMinutes = mode === 'add' ? totalMinutes : -totalMinutes;
    const resultDate = new Date(baseDateTime.getTime() + signedMinutes * 60 * 1000);

    const resultText = `${formatDateOutput(resultDate, localeTag)} ${formatTimeOutput(
      resultDate,
      localeTag,
    )} (${formatWeekday(resultDate, localeTag)})`;

    return {
      isValid: true,
      totalMinutes,
      resultDate,
      resultText,
    };
  }, [baseDate, baseTime, hours, minutes, mode, localeTag]);

  useEffect(() => {
    setCopied(false);
  }, [calculation.resultText]);

  const handleNow = () => {
    const now = new Date();
    setBaseDate(formatDateInput(now));
    setBaseTime(formatTimeInput(now));
  };

  const handleExample = () => {
    const now = new Date();
    setBaseDate(formatDateInput(now));
    setBaseTime('09:00');
    setMode('add');
    setHours('2');
    setMinutes('45');
  };

  const handleClear = () => {
    setBaseDate('');
    setBaseTime('');
    setMode('add');
    setHours('');
    setMinutes('');
  };

  const handleCopy = async () => {
    if (!calculation.resultText) return;
    try {
      await navigator.clipboard.writeText(calculation.resultText);
      setCopied(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy result:', error);
    }
  };

  return (
    <div className="space-y-6">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('label.baseDate')}
          </Text>
          <Input
            type="date"
            value={baseDate}
            onChange={(event) => setBaseDate(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('label.baseTime')}
          </Text>
          <Input
            type="time"
            step={60}
            value={baseTime}
            onChange={(event) => setBaseTime(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('label.mode')}
          </Text>
          <Select value={mode} onValueChange={(value) => setMode(value as Mode)}>
            <SelectTrigger aria-label={t('label.mode')}>
              <SelectValue placeholder={t('placeholder.mode')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="add">{t('mode.add')}</SelectItem>
              <SelectItem value="subtract">{t('mode.subtract')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('label.durationHours')}
            </Text>
            <Input
              type="number"
              min={0}
              inputMode="numeric"
              placeholder={t('placeholder.hours')}
              value={hours}
              onChange={(event) => setHours(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('label.durationMinutes')}
            </Text>
            <Input
              type="number"
              min={0}
              inputMode="numeric"
              placeholder={t('placeholder.minutes')}
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </div>
        </div>
        <Text className="text-xs text-gray-500 dark:text-gray-400">{t('helper')}</Text>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleNow} className="px-3 py-2 text-xs">
            {t('button.now')}
          </Button>
          <Button type="button" onClick={handleExample} className="px-3 py-2 text-xs">
            {t('button.example')}
          </Button>
          <Button type="button" onClick={handleClear} className="px-3 py-2 text-xs">
            {t('button.clear')}
          </Button>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('label.result')}
          </Text>
          <Button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 text-xs"
            disabled={!calculation.resultText}
          >
            {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copied ? t('button.copied') : t('button.copy')}
          </Button>
        </div>
        <div className="space-y-3">
          <Input readOnly value={calculation.resultText} placeholder={t('empty')} />
          {calculation.isValid && calculation.resultDate ? (
            <div className="grid gap-2 rounded-2xl border border-zinc-200/70 bg-white/70 p-3 text-sm text-gray-700 shadow-sm dark:border-zinc-700/70 dark:bg-zinc-900/60 dark:text-gray-200">
              <div className="flex items-center justify-between">
                <Text>{t('label.resultDate')}</Text>
                <Text className="font-semibold">
                  {formatDateOutput(calculation.resultDate, localeTag)}
                </Text>
              </div>
              <div className="flex items-center justify-between">
                <Text>{t('label.resultTime')}</Text>
                <Text className="font-semibold">
                  {formatTimeOutput(calculation.resultDate, localeTag)}
                </Text>
              </div>
              <div className="flex items-center justify-between">
                <Text>{t('label.resultWeekday')}</Text>
                <Text className="font-semibold">
                  {formatWeekday(calculation.resultDate, localeTag)}
                </Text>
              </div>
              <div className="flex items-center justify-between">
                <Text>{t('label.totalMinutes')}</Text>
                <Text className="font-semibold">
                  {t('value.minutes', { count: calculation.totalMinutes })}
                </Text>
              </div>
            </div>
          ) : (
            <Text className="text-xs text-gray-500 dark:text-gray-400">{t('emptyHint')}</Text>
          )}
        </div>
      </section>
    </div>
  );
}
