'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, RotateCcw } from 'lucide-react';
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
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

const THRESHOLD_PRESETS = [75, 80, 90, 100];

interface AttendanceRateToolProps {
  lng: Language;
}

const clampNumber = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default function AttendanceRateTool({ lng }: AttendanceRateToolProps) {
  const { t } = useTranslation(lng, 'attendance-rate');
  const [mode, setMode] = useState<'attended' | 'missed'>('attended');
  const [total, setTotal] = useState('');
  const [attended, setAttended] = useState('');
  const [missed, setMissed] = useState('');
  const [threshold, setThreshold] = useState('75');
  const [copied, setCopied] = useState(false);

  const summary = useMemo(() => {
    const totalValue = Math.max(0, Math.floor(Number(total) || 0));
    const attendedValue = Math.max(0, Math.floor(Number(attended) || 0));
    const missedValue = Math.max(0, Math.floor(Number(missed) || 0));
    const rawThreshold = Number(threshold) || 0;
    const thresholdValue = clampNumber(rawThreshold, 0, 100);

    const resolvedAttended =
      mode === 'attended'
        ? Math.min(attendedValue, totalValue)
        : Math.max(0, totalValue - Math.min(missedValue, totalValue));
    const resolvedMissed = Math.max(0, totalValue - resolvedAttended);

    const attendanceRate = totalValue ? (resolvedAttended / totalValue) * 100 : 0;
    const minimumAttendance = totalValue ? Math.ceil((thresholdValue / 100) * totalValue) : 0;
    const remainingAbsences = Math.max(0, totalValue - minimumAttendance - resolvedMissed);
    const needAttend = Math.max(0, minimumAttendance - resolvedAttended);

    return {
      totalValue,
      resolvedAttended,
      resolvedMissed,
      attendanceRate,
      minimumAttendance,
      remainingAbsences,
      needAttend,
      thresholdValue,
    };
  }, [attended, missed, mode, threshold, total]);

  useEffect(() => {
    setCopied(false);
  }, [summary]);

  const handleReset = () => {
    setTotal('');
    setAttended('');
    setMissed('');
    setThreshold('75');
    setMode('attended');
  };

  const handleExample = () => {
    setTotal('16');
    setAttended('13');
    setMissed('3');
    setThreshold('80');
    setMode('attended');
  };

  const handleCopy = async () => {
    if (!summary.totalValue) return;
    const text = [
      `${t('summary.attendanceRate')}: ${summary.attendanceRate.toFixed(1)}%`,
      `${t('summary.requiredAttendance')}: ${summary.minimumAttendance}`,
      `${t('summary.remainingAbsences')}: ${summary.remainingAbsences}`,
      `${t('summary.needAttend')}: ${summary.needAttend}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy attendance summary:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <label
            htmlFor="attendance-mode"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.mode')}
          </label>
          <Select value={mode} onValueChange={(value) => setMode(value as typeof mode)}>
            <SelectTrigger id="attendance-mode" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="attended">{t('mode.attended')}</SelectItem>
              <SelectItem value="missed">{t('mode.missed')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="attendance-total"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('label.total')}
            </label>
            <Input
              id="attendance-total"
              type="text"
              inputMode="numeric"
              value={total}
              onChange={(event) => setTotal(event.target.value)}
              placeholder="0"
            />
          </div>

          {mode === 'attended' ? (
            <div className="space-y-2">
              <label
                htmlFor="attendance-attended"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t('label.attended')}
              </label>
              <Input
                id="attendance-attended"
                type="text"
                inputMode="numeric"
                value={attended}
                onChange={(event) => setAttended(event.target.value)}
                placeholder="0"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label
                htmlFor="attendance-missed"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t('label.missed')}
              </label>
              <Input
                id="attendance-missed"
                type="text"
                inputMode="numeric"
                value={missed}
                onChange={(event) => setMissed(event.target.value)}
                placeholder="0"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="attendance-threshold"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.threshold')}
          </label>
          <Input
            id="attendance-threshold"
            type="text"
            inputMode="numeric"
            value={threshold}
            onChange={(event) => setThreshold(event.target.value)}
            placeholder="75"
          />
          <div className="flex flex-wrap gap-2">
            {THRESHOLD_PRESETS.map((preset) => (
              <Button
                key={preset}
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setThreshold(String(preset))}
              >
                {preset}%
              </Button>
            ))}
          </div>
        </div>

        <Text className="text-xs text-gray-500 dark:text-gray-400">{t('helper')}</Text>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <Text className="text-sm font-semibold">{t('summary.title')}</Text>
          <Button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 text-xs"
            disabled={!summary.totalValue}
          >
            {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copied ? t('button.copied') : t('button.copy')}
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {t('summary.attendanceRate')}
            </Text>
            <Text className="text-lg font-semibold">{summary.attendanceRate.toFixed(1)}%</Text>
          </div>
          <div className="space-y-1">
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {t('summary.requiredAttendance')}
            </Text>
            <Text className="text-lg font-semibold">{summary.minimumAttendance}</Text>
          </div>
          <div className="space-y-1">
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {t('summary.remainingAbsences')}
            </Text>
            <Text className="text-lg font-semibold">{summary.remainingAbsences}</Text>
          </div>
          <div className="space-y-1">
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {t('summary.needAttend')}
            </Text>
            <Text className="text-lg font-semibold">{summary.needAttend}</Text>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={handleExample}>
          {t('button.example')}
        </Button>
        <Button type="button" variant="ghost" onClick={handleReset}>
          <RotateCcw size={16} className="mr-2" />
          {t('button.reset')}
        </Button>
      </div>
    </div>
  );
}
