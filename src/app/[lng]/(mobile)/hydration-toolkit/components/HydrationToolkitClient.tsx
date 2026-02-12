'use client';

import React, { useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, Droplets } from 'lucide-react';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import { Text } from '@components/basic/Text';
import Tag from '@components/basic/Tag';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface HydrationToolkitClientProps {
  lng: Language;
}

const ACTIVITY_LEVELS = ['low', 'medium', 'high'] as const;
const CLIMATE_LEVELS = ['normal', 'hot'] as const;

const DEFAULTS = {
  weight: '65',
  activity: 'medium',
  climate: 'normal',
  customTarget: '',
  startTime: '09:00',
  endTime: '21:00',
  interval: '120',
  bottleSize: '500',
};

function parseNumber(value: string) {
  const normalized = value.replace(/,/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseTime(value: string) {
  if (!value) return null;
  const [hours, minutes] = value.split(':').map((segment) => Number(segment));
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function formatTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export default function HydrationToolkitClient({ lng }: HydrationToolkitClientProps) {
  const { t } = useTranslation(lng, 'hydration-toolkit');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState<(typeof ACTIVITY_LEVELS)[number]>(DEFAULTS.activity);
  const [climate, setClimate] = useState<(typeof CLIMATE_LEVELS)[number]>(DEFAULTS.climate);
  const [customTarget, setCustomTarget] = useState('');
  const [startTime, setStartTime] = useState(DEFAULTS.startTime);
  const [endTime, setEndTime] = useState(DEFAULTS.endTime);
  const [interval, setInterval] = useState(DEFAULTS.interval);
  const [bottleSize, setBottleSize] = useState(DEFAULTS.bottleSize);
  const [copied, setCopied] = useState(false);

  const weightValue = parseNumber(weight);
  const customTargetValue = parseNumber(customTarget);

  const targetMl = useMemo(() => {
    if (customTargetValue && customTargetValue > 0) return Math.round(customTargetValue);
    if (!weightValue || weightValue <= 0) return 0;
    const base = weightValue * 30;
    let activityBonus = 0;
    if (activity === 'medium') {
      activityBonus = weightValue * 5;
    } else if (activity === 'high') {
      activityBonus = weightValue * 10;
    }
    const climateBonus = climate === 'hot' ? weightValue * 5 : 0;
    return Math.round(base + activityBonus + climateBonus);
  }, [weightValue, customTargetValue, activity, climate]);

  const liters = targetMl ? (targetMl / 1000).toFixed(2) : '0.00';
  const cups = targetMl ? Math.round(targetMl / 250) : 0;

  const weightError = useMemo(() => {
    if (!weight) return '';
    if (!weightValue) return t('errors.weight');
    if (weightValue < 20 || weightValue > 200) return t('errors.weightRange');
    return '';
  }, [weight, weightValue, t]);

  const intervalValue = parseNumber(interval);
  const bottleValue = parseNumber(bottleSize);

  const schedule = useMemo(() => {
    const start = parseTime(startTime);
    const end = parseTime(endTime);
    if (!startTime || !endTime || start === null || end === null) return null;
    if (!intervalValue || intervalValue <= 0) return null;
    if (end <= start) return null;
    const count = Math.floor((end - start) / intervalValue) + 1;
    const times = Array.from({ length: count }, (_, index) =>
      formatTime(start + intervalValue * index),
    );
    const perDrink = targetMl > 0 ? Math.round(targetMl / count) : 0;
    return { times, count, perDrink };
  }, [startTime, endTime, intervalValue, targetMl]);

  const scheduleError = useMemo(() => {
    const start = parseTime(startTime);
    const end = parseTime(endTime);
    if (!startTime || !endTime) return t('errors.scheduleRequired');
    if (start === null || end === null) return t('errors.scheduleFormat');
    if (!intervalValue || intervalValue <= 0) return t('errors.interval');
    if (end <= start) return t('errors.scheduleOrder');
    return '';
  }, [startTime, endTime, intervalValue, t]);

  const bottleCount = useMemo(() => {
    if (!targetMl || !bottleValue || bottleValue <= 0) return 0;
    return Math.ceil(targetMl / bottleValue);
  }, [targetMl, bottleValue]);

  const bottleError = useMemo(() => {
    if (!bottleSize) return '';
    if (!bottleValue || bottleValue <= 0) return t('errors.bottle');
    return '';
  }, [bottleSize, bottleValue, t]);

  const handleCopy = async () => {
    if (!targetMl) return;
    const summaryLines = [
      `${t('summary.target')}: ${targetMl}ml (${liters}L)`,
      `${t('summary.cups')}: ${cups}`,
    ];
    if (schedule) {
      summaryLines.push(
        `${t('summary.schedule')}: ${schedule.times.join(', ')} (${t('summary.perDrink')} ${
          schedule.perDrink
        }ml)`,
      );
    }
    if (bottleCount) {
      summaryLines.push(`${t('summary.bottles')}: ${bottleCount} x ${bottleValue ?? ''}ml`);
    }
    try {
      await navigator.clipboard.writeText(summaryLines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy hydration summary:', error);
    }
  };

  const handleExample = () => {
    setWeight(DEFAULTS.weight);
    setActivity(DEFAULTS.activity);
    setClimate(DEFAULTS.climate);
    setCustomTarget(DEFAULTS.customTarget);
    setStartTime(DEFAULTS.startTime);
    setEndTime(DEFAULTS.endTime);
    setInterval(DEFAULTS.interval);
    setBottleSize(DEFAULTS.bottleSize);
    setCopied(false);
  };

  const handleClear = () => {
    setWeight('');
    setActivity(DEFAULTS.activity);
    setClimate(DEFAULTS.climate);
    setCustomTarget('');
    setStartTime('');
    setEndTime('');
    setInterval('');
    setBottleSize('');
    setCopied(false);
  };

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4 text-point-2" />
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {t('section.intake')}
          </Text>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="weight">
            {t('label.weight')}
          </label>
          <Input
            id="weight"
            value={weight}
            inputMode="decimal"
            placeholder={t('placeholder.weight')}
            onChange={(event) => setWeight(event.target.value)}
          />
          {weightError && <Text className="text-xs text-red-500">{weightError}</Text>}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('label.activity')}
            </Text>
            <Select
              value={activity}
              onValueChange={(value) => setActivity(value as typeof activity)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('placeholder.activity')} />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {t(`activity.${level}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('label.climate')}
            </Text>
            <Select value={climate} onValueChange={(value) => setClimate(value as typeof climate)}>
              <SelectTrigger>
                <SelectValue placeholder={t('placeholder.climate')} />
              </SelectTrigger>
              <SelectContent>
                {CLIMATE_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {t(`climate.${level}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
            htmlFor="customTarget"
          >
            {t('label.customTarget')}
          </label>
          <Input
            id="customTarget"
            value={customTarget}
            inputMode="decimal"
            placeholder={t('placeholder.customTarget')}
            onChange={(event) => setCustomTarget(event.target.value)}
          />
          <Text className="text-xs text-gray-500 dark:text-gray-400">{t('helper.custom')}</Text>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {t('section.result')}
          </Text>
          <div className="flex flex-wrap gap-2">
            <Button type="button" className="px-3 py-2 text-xs" onClick={handleExample}>
              {t('button.example')}
            </Button>
            <Button type="button" className="px-3 py-2 text-xs" onClick={handleClear}>
              {t('button.clear')}
            </Button>
            <Button
              type="button"
              className="flex items-center gap-2 px-3 py-2 text-xs"
              onClick={handleCopy}
              disabled={!targetMl}
            >
              {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
              {copied ? t('button.copied') : t('button.copy')}
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Tag tag={`${t('result.target')}: ${targetMl || 0}ml`} />
          <Tag tag={`${t('result.liters')}: ${liters}L`} />
          <Tag tag={`${t('result.cups')}: ${cups}`} />
        </div>
        <Text className="text-xs text-gray-500 dark:text-gray-400">{t('helper.result')}</Text>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <Text className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {t('section.schedule')}
        </Text>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="start">
              {t('label.startTime')}
            </label>
            <Input
              id="start"
              type="time"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="end">
              {t('label.endTime')}
            </label>
            <Input
              id="end"
              type="time"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
              htmlFor="interval"
            >
              {t('label.interval')}
            </label>
            <Input
              id="interval"
              value={interval}
              inputMode="numeric"
              placeholder={t('placeholder.interval')}
              onChange={(event) => setInterval(event.target.value)}
            />
          </div>
        </div>
        {scheduleError && <Text className="text-xs text-red-500">{scheduleError}</Text>}
        {schedule && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {schedule.times.map((time) => (
                <Tag key={time} tag={time} />
              ))}
            </div>
            <Text className="text-xs text-gray-500 dark:text-gray-400">
              {t('helper.schedule', { perDrink: schedule.perDrink })}
            </Text>
          </div>
        )}
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <Text className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {t('section.bottle')}
        </Text>
        <div className="grid gap-3 md:grid-cols-[2fr_1fr]">
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
              htmlFor="bottle"
            >
              {t('label.bottleSize')}
            </label>
            <Input
              id="bottle"
              value={bottleSize}
              inputMode="numeric"
              placeholder={t('placeholder.bottleSize')}
              onChange={(event) => setBottleSize(event.target.value)}
            />
            {bottleError && <Text className="text-xs text-red-500">{bottleError}</Text>}
          </div>
          <div className="space-y-2">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('label.quickBottle')}
            </Text>
            <div className="flex flex-wrap gap-2">
              {[350, 500, 750, 1000].map((size) => (
                <Button
                  key={size}
                  type="button"
                  className="px-3 py-2 text-xs"
                  onClick={() => setBottleSize(String(size))}
                >
                  {size}ml
                </Button>
              ))}
            </div>
          </div>
        </div>
        <Text className="text-sm text-gray-700 dark:text-gray-200">
          {t('result.bottles', { count: bottleCount || 0 })}
        </Text>
      </div>
    </div>
  );
}
