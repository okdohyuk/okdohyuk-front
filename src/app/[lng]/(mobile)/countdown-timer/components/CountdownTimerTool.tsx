'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import { H1, Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_PANEL,
  SERVICE_PANEL_SOFT,
  SERVICE_PAGE_SURFACE,
} from '@components/complex/Service/interactiveStyles';

const PRESETS = [1, 3, 5, 10, 25];

const localeMap: Record<Language, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  zh: 'zh-CN',
};

const pad = (value: number) => value.toString().padStart(2, '0');

const formatTime = (totalSeconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

const toParts = (totalSeconds: number) => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return { hours, minutes, seconds };
};

type CountdownTimerToolProps = {
  lng: Language;
};

export default function CountdownTimerTool({ lng }: CountdownTimerToolProps) {
  const { t } = useTranslation(lng, 'countdown-timer');
  const [inputs, setInputs] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [remaining, setRemaining] = useState(0);
  const [baseDuration, setBaseDuration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const totalSeconds = useMemo(
    () => inputs.hours * 3600 + inputs.minutes * 60 + inputs.seconds,
    [inputs],
  );

  const statusKey = useMemo(() => {
    if (remaining === 0 && baseDuration > 0 && !isRunning) return 'finished';
    if (isRunning) return 'running';
    if (remaining > 0 && remaining < baseDuration) return 'paused';
    return 'ready';
  }, [remaining, baseDuration, isRunning]);

  const progressPercent = useMemo(() => {
    if (baseDuration <= 0) return 0;
    return Math.min(100, Math.max(0, Math.round((remaining / baseDuration) * 100)));
  }, [remaining, baseDuration]);

  useEffect(() => {
    if (isRunning) return;
    if (remaining !== baseDuration) return;
    setRemaining(totalSeconds);
    setBaseDuration(totalSeconds);
  }, [totalSeconds, isRunning, remaining, baseDuration]);

  useEffect(() => {
    if (!isRunning) {
      return () => undefined;
    }

    const interval = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning]);

  const handleInputChange =
    (key: keyof typeof inputs) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = Number(event.target.value);
      if (Number.isNaN(rawValue)) return;
      const nextValue = Math.max(0, Math.min(Math.floor(rawValue), key === 'hours' ? 99 : 59));
      setInputs((prev) => ({ ...prev, [key]: nextValue }));
    };

  const handlePreset = (minutes: number) => {
    setInputs({ hours: 0, minutes, seconds: 0 });
    setIsRunning(false);
  };

  const handleStart = () => {
    if (remaining > 0 && remaining < baseDuration) {
      setIsRunning(true);
      return;
    }
    if (totalSeconds <= 0) return;
    setBaseDuration(totalSeconds);
    setRemaining(totalSeconds);
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemaining(totalSeconds);
    setBaseDuration(totalSeconds);
  };

  const handleClear = () => {
    setIsRunning(false);
    setInputs({ hours: 0, minutes: 0, seconds: 0 });
    setRemaining(0);
    setBaseDuration(0);
  };

  const handleAddMinute = () => {
    setRemaining((prev) => {
      const nextTotal = prev + 60;
      setInputs(toParts(nextTotal));
      setBaseDuration((prevBase) => (prevBase > 0 ? prevBase + 60 : nextTotal));
      return nextTotal;
    });
  };

  const [endTimeLabel, setEndTimeLabel] = useState(t('label.none'));

  useEffect(() => {
    if (remaining <= 0) {
      setEndTimeLabel(t('label.none'));
      return;
    }
    const endDate = new Date(Date.now() + remaining * 1000);
    setEndTimeLabel(
      endDate.toLocaleTimeString(localeMap[lng], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    );
  }, [remaining, lng, t]);

  const handleCopy = useCallback(async () => {
    const summary = `${t('label.remaining')}: ${formatTime(remaining)}\n${t(
      'label.endTime',
    )}: ${endTimeLabel}`;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      setCopied(false);
    }
  }, [endTimeLabel, remaining, t]);

  const isReadyToStart = totalSeconds > 0;
  const isPaused = !isRunning && remaining > 0 && remaining < baseDuration;

  return (
    <div className={cn(SERVICE_PAGE_SURFACE, 'space-y-4')}>
      <div className={cn(SERVICE_PANEL, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <Text variant="t4" className="text-gray-500">
            {t('label.remaining')}
          </Text>
          <H1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
            {formatTime(remaining)}
          </H1>
          <Text variant="t6" className="text-gray-500">
            {t('label.status')}: {t(`status.${statusKey}`)}
          </Text>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Text variant="t6" className="text-gray-500">
              {t('label.progress')}
            </Text>
            <Text variant="t6" className="text-gray-500">
              {progressPercent}%
            </Text>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className="h-full rounded-full bg-point-2 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className={cn(SERVICE_PANEL_SOFT, 'space-y-1 p-3')}>
            <Text variant="t6" className="text-gray-500">
              {t('label.total')}
            </Text>
            <Text variant="t4" className="text-gray-900 dark:text-gray-100">
              {formatTime(baseDuration)}
            </Text>
          </div>
          <div className={cn(SERVICE_PANEL_SOFT, 'space-y-1 p-3')}>
            <Text variant="t6" className="text-gray-500">
              {t('label.endTime')}
            </Text>
            <Text variant="t4" className="text-gray-900 dark:text-gray-100">
              {endTimeLabel}
            </Text>
          </div>
          <div className={cn(SERVICE_PANEL_SOFT, 'space-y-1 p-3')}>
            <Text variant="t6" className="text-gray-500">
              {t('label.action')}
            </Text>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                className="px-3 text-sm"
                onClick={handleAddMinute}
                disabled={!isReadyToStart && remaining === 0}
              >
                {t('buttons.addMinute')}
              </Button>
              <Button
                type="button"
                className="px-3 text-sm"
                onClick={handleCopy}
                disabled={remaining === 0}
              >
                {copied ? t('buttons.copied') : t('buttons.copy')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL, 'space-y-4 p-4')}>
        <div className="space-y-1">
          <Text variant="t4" className="text-gray-900 dark:text-gray-100">
            {t('label.setTime')}
          </Text>
          <Text variant="t6" className="text-gray-500">
            {t('helper.hint')}
          </Text>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className={cn(SERVICE_PANEL_SOFT, 'space-y-2 p-3')}>
            <Text variant="t6" className="text-gray-500">
              {t('label.hours')}
            </Text>
            <Input
              type="number"
              min={0}
              max={99}
              inputMode="numeric"
              value={inputs.hours}
              onChange={handleInputChange('hours')}
              disabled={isRunning}
            />
          </div>
          <div className={cn(SERVICE_PANEL_SOFT, 'space-y-2 p-3')}>
            <Text variant="t6" className="text-gray-500">
              {t('label.minutes')}
            </Text>
            <Input
              type="number"
              min={0}
              max={59}
              inputMode="numeric"
              value={inputs.minutes}
              onChange={handleInputChange('minutes')}
              disabled={isRunning}
            />
          </div>
          <div className={cn(SERVICE_PANEL_SOFT, 'space-y-2 p-3')}>
            <Text variant="t6" className="text-gray-500">
              {t('label.seconds')}
            </Text>
            <Input
              type="number"
              min={0}
              max={59}
              inputMode="numeric"
              value={inputs.seconds}
              onChange={handleInputChange('seconds')}
              disabled={isRunning}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((minutes) => (
            <Button
              key={minutes}
              type="button"
              className="px-3 text-sm"
              onClick={() => handlePreset(minutes)}
              disabled={isRunning}
            >
              {t('label.preset', { minutes })}
            </Button>
          ))}
          <Button type="button" className="px-3 text-sm" onClick={() => handlePreset(25)}>
            {t('buttons.example')}
          </Button>
          <Button type="button" className="px-3 text-sm" onClick={handleClear}>
            {t('buttons.clear')}
          </Button>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL, 'flex flex-wrap gap-2 p-4')}>
        <Button
          type="button"
          className="px-4 text-sm"
          onClick={handleStart}
          disabled={!isReadyToStart && !isPaused}
        >
          {isPaused ? t('buttons.resume') : t('buttons.start')}
        </Button>
        <Button type="button" className="px-4 text-sm" onClick={handlePause} disabled={!isRunning}>
          {t('buttons.pause')}
        </Button>
        <Button type="button" className="px-4 text-sm" onClick={handleReset}>
          {t('buttons.reset')}
        </Button>
      </div>
    </div>
  );
}
