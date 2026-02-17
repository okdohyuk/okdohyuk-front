'use client';

import React, { useMemo, useState } from 'react';
import Select from '@components/complex/Select';
import { Input } from '@components/basic/Input';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface BedtimePlannerClientProps {
  lng: Language;
}

const CYCLES = [6, 5, 4, 3];
const CYCLE_MINUTES = 90;
const FALL_ASLEEP_MINUTES = 15;

const getTimeMinutes = (value: string) => {
  const [hours, minutes] = value.split(':').map((item) => Number(item));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

const addMinutes = (base: Date, minutes: number) => new Date(base.getTime() + minutes * 60000);

export default function BedtimePlannerClient({ lng }: BedtimePlannerClientProps) {
  const { t } = useTranslation(lng, 'bedtime-planner');
  const [mode, setMode] = useState('wake');
  const [time, setTime] = useState('07:00');

  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(lng, {
        hour: '2-digit',
        minute: '2-digit',
      }),
    [lng],
  );

  const results = useMemo(() => {
    const minutes = getTimeMinutes(time);
    if (minutes === null) return [];

    const base = new Date();
    base.setHours(0, 0, 0, 0);
    const baseTime = addMinutes(base, minutes);

    return CYCLES.map((cycle) => {
      const totalMinutes = cycle * CYCLE_MINUTES + FALL_ASLEEP_MINUTES;
      const target =
        mode === 'wake' ? addMinutes(baseTime, -totalMinutes) : addMinutes(baseTime, totalMinutes);
      const dayDiff = Math.round((target.getTime() - baseTime.getTime()) / (24 * 60 * 60 * 1000));

      return {
        cycle,
        totalMinutes,
        target,
        dayDiff,
      };
    });
  }, [mode, time]);

  const getDayLabel = (dayDiff: number) => {
    if (dayDiff === -1) return t('result.previousDay');
    if (dayDiff === 1) return t('result.nextDay');
    return '';
  };

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div>
          <label htmlFor="mode" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {t('label.mode')}
          </label>
          <Select className="w-full" value={mode} onChange={setMode}>
            <option value="wake">{t('mode.wake')}</option>
            <option value="sleep">{t('mode.sleep')}</option>
          </Select>
        </div>
        <div>
          <label htmlFor="time" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {mode === 'wake' ? t('label.wakeTime') : t('label.sleepTime')}
          </label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('helper')}</p>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {mode === 'wake' ? t('result.sleepTimes') : t('result.wakeTimes')}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {results.map((item) => {
            const dayLabel = getDayLabel(item.dayDiff);
            const sleepHours = item.cycle * 1.5;

            return (
              <div
                key={item.cycle}
                className="rounded-2xl border border-gray-200/70 p-3 dark:border-gray-700/70"
              >
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('result.cycle', { count: item.cycle })} ·{' '}
                  {t('result.sleepHours', {
                    hours: sleepHours,
                  })}
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatter.format(item.target)}
                </p>
                {dayLabel ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400">{dayLabel}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-2 p-4')}>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {t('tips.title')}
        </h3>
        <ul className="list-disc space-y-1 pl-4 text-sm text-gray-600 dark:text-gray-300">
          {(t('tips.items', { returnObjects: true }) as string[]).map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
