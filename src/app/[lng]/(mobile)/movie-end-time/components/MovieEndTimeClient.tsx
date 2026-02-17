'use client';

import React, { useMemo, useState } from 'react';
import { Input } from '@components/basic/Input';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface MovieEndTimeClientProps {
  lng: Language;
}

const toTimeString = (date: Date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const formatDuration = (
  minutes: number,
  unit: {
    hour: string;
    minute: string;
  },
) => {
  const hours = Math.floor(minutes / 60);
  const remain = minutes % 60;
  if (hours === 0) return `${remain}${unit.minute}`;
  if (remain === 0) return `${hours}${unit.hour}`;
  return `${hours}${unit.hour} ${remain}${unit.minute}`;
};

export default function MovieEndTimeClient({ lng }: MovieEndTimeClientProps) {
  const { t } = useTranslation(lng, 'movie-end-time');
  const [startTime, setStartTime] = useState('19:00');
  const [runtime, setRuntime] = useState('120');
  const [trailers, setTrailers] = useState('10');
  const [credits, setCredits] = useState('0');

  const results = useMemo(() => {
    if (!startTime) return null;

    const [hours, minutes] = startTime.split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

    const runtimeMinutes = Math.max(0, Number(runtime));
    if (!runtimeMinutes) return null;

    const trailersMinutes = Math.max(0, Number(trailers));
    const creditsMinutes = Math.max(0, Number(credits));
    const totalMinutes = runtimeMinutes + trailersMinutes + creditsMinutes;

    const base = new Date();
    base.setHours(hours, minutes, 0, 0);

    const movieStart = new Date(base.getTime() + trailersMinutes * 60 * 1000);
    const endTime = new Date(base.getTime() + totalMinutes * 60 * 1000);

    return {
      totalMinutes,
      movieStart,
      endTime,
      trailersMinutes,
      runtimeMinutes,
      creditsMinutes,
    };
  }, [credits, runtime, startTime, trailers]);

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {t('section.input')}
        </p>
        <div className="space-y-3">
          <label
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
            htmlFor="start-time"
          >
            {t('label.startTime')}
          </label>
          <Input
            id="start-time"
            type="time"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
          />
        </div>
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="runtime">
            {t('label.runtime')}
          </label>
          <Input
            id="runtime"
            type="number"
            min={1}
            placeholder={t('placeholder.runtime')}
            value={runtime}
            onChange={(event) => setRuntime(event.target.value)}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper.runtime')}</p>
        </div>
        <div className="space-y-3">
          <label
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
            htmlFor="trailers"
          >
            {t('label.trailers')}
          </label>
          <Input
            id="trailers"
            type="number"
            min={0}
            placeholder={t('placeholder.trailers')}
            value={trailers}
            onChange={(event) => setTrailers(event.target.value)}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper.trailers')}</p>
        </div>
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="credits">
            {t('label.credits')}
          </label>
          <Input
            id="credits"
            type="number"
            min={0}
            placeholder={t('placeholder.credits')}
            value={credits}
            onChange={(event) => setCredits(event.target.value)}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper.credits')}</p>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper.note')}</p>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {t('section.result')}
        </p>
        {!results ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('empty')}</p>
        ) : (
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center justify-between">
              <span>{t('result.totalDuration')}</span>
              <strong className="text-gray-900 dark:text-white">
                {formatDuration(results.totalMinutes, {
                  hour: t('unit.hour'),
                  minute: t('unit.minute'),
                })}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span>{t('result.movieStart')}</span>
              <strong className="text-gray-900 dark:text-white">
                {toTimeString(results.movieStart)}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span>{t('result.endTime')}</span>
              <strong className="text-gray-900 dark:text-white">
                {toTimeString(results.endTime)}
              </strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
