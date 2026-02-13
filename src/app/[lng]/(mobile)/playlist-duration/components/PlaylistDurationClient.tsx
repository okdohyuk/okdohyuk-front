'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import { Textarea } from '@components/basic/Textarea';
import { Button } from '@components/basic/Button';
import { Copy, Eraser, Sparkles } from 'lucide-react';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import { parseDurationLine } from '~/app/[lng]/(mobile)/playlist-duration/utils/parseDuration';

const formatDurationText = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return { hours, minutes, seconds: remainingSeconds };
};

type PlaylistDurationClientProps = {
  lng: Language;
};

const exampleList = ['3:45', '4:10', '2:58', '5:02', '3:30'].join('\n');

export default function PlaylistDurationClient({ lng }: PlaylistDurationClientProps) {
  const { t } = useTranslation(lng, 'playlist-duration');
  const [trackCount, setTrackCount] = useState('');
  const [avgMinutes, setAvgMinutes] = useState('');
  const [avgSeconds, setAvgSeconds] = useState('');
  const [durationsText, setDurationsText] = useState('');

  const parsedList = useMemo(() => {
    const lines = durationsText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const durations: number[] = [];
    let invalidCount = 0;

    lines.forEach((line) => {
      const result = parseDurationLine(line);
      if (!result) {
        invalidCount += 1;
        return;
      }
      durations.push(result.seconds);
    });

    return { durations, invalidCount, lineCount: lines.length };
  }, [durationsText]);

  const fallbackSeconds = useMemo(() => {
    const count = Number(trackCount);
    const minutes = Number(avgMinutes);
    const seconds = Number(avgSeconds);

    if (!Number.isFinite(count) || count <= 0) return null;
    if (!Number.isFinite(minutes) && !Number.isFinite(seconds)) return null;

    const normalizedMinutes = Number.isFinite(minutes) ? minutes : 0;
    const normalizedSeconds = Number.isFinite(seconds) ? seconds : 0;

    if (normalizedMinutes <= 0 && normalizedSeconds <= 0) return null;

    return count * (normalizedMinutes * 60 + normalizedSeconds);
  }, [trackCount, avgMinutes, avgSeconds]);

  const totalSeconds = parsedList.durations.length
    ? parsedList.durations.reduce((acc, value) => acc + value, 0)
    : fallbackSeconds || 0;

  const totalTracks = parsedList.durations.length
    ? parsedList.durations.length
    : Number(trackCount) || 0;

  const averageSeconds = totalTracks > 0 ? Math.round(totalSeconds / totalTracks) : 0;

  const timeParts = formatDurationText(totalSeconds);
  const averageParts = formatDurationText(averageSeconds);

  const formatUnit = (value: number, unitKey: 'unit.hours' | 'unit.minutes' | 'unit.seconds') =>
    `${value}${t(unitKey)}`;

  const totalLabel = `${formatUnit(timeParts.hours, 'unit.hours')} ${formatUnit(
    timeParts.minutes,
    'unit.minutes',
  )} ${formatUnit(timeParts.seconds, 'unit.seconds')}`;

  const averageLabel = `${formatUnit(averageParts.minutes, 'unit.minutes')} ${formatUnit(
    averageParts.seconds,
    'unit.seconds',
  )}`;

  const copySummary = async () => {
    const summary = [
      `${t('result.total')}: ${totalLabel}`,
      `${t('result.trackCount')}: ${totalTracks}`,
      `${t('result.average')}: ${averageLabel}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summary);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Copy failed', error);
    }
  };

  const resetAll = () => {
    setTrackCount('');
    setAvgMinutes('');
    setAvgSeconds('');
    setDurationsText('');
  };

  const fillExample = () => {
    setDurationsText(exampleList);
  };

  return (
    <div className="space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <h2 className="t-b-1 text-gray-900 dark:text-gray-100">{t('section.manual')}</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            type="text"
            inputMode="numeric"
            value={trackCount}
            placeholder={t('placeholder.trackCount')}
            onChange={(event) => setTrackCount(event.target.value.replace(/[^0-9]/g, ''))}
          />
          <Input
            type="text"
            inputMode="numeric"
            value={avgMinutes}
            placeholder={t('placeholder.avgMinutes')}
            onChange={(event) => setAvgMinutes(event.target.value.replace(/[^0-9]/g, ''))}
          />
          <Input
            type="text"
            inputMode="numeric"
            value={avgSeconds}
            placeholder={t('placeholder.avgSeconds')}
            onChange={(event) => setAvgSeconds(event.target.value.replace(/[^0-9]/g, ''))}
          />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('helper.fallback')}</p>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <h2 className="t-b-1 text-gray-900 dark:text-gray-100">{t('section.list')}</h2>
        <Textarea
          className="min-h-[140px] font-mono"
          value={durationsText}
          placeholder={t('placeholder.list')}
          onChange={(event) => setDurationsText(event.target.value)}
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('helper.list')}</p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={fillExample}
            className="flex items-center gap-2 px-3 py-2 text-sm"
          >
            <Sparkles size={16} />
            {t('button.example')}
          </Button>
          <Button
            type="button"
            onClick={resetAll}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100"
          >
            <Eraser size={16} />
            {t('button.reset')}
          </Button>
        </div>
      </div>

      <div
        className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-6 text-center')}
      >
        <h3 className="t-b-1 text-gray-900 dark:text-gray-100">{t('result.title')}</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white/70 px-4 py-3 text-left shadow-sm dark:bg-gray-900/40">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('result.total')}</p>
            <p className="t-d-1 text-gray-900 dark:text-gray-100">{totalLabel}</p>
          </div>
          <div className="rounded-lg bg-white/70 px-4 py-3 text-left shadow-sm dark:bg-gray-900/40">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('result.trackCount')}</p>
            <p className="t-d-1 text-gray-900 dark:text-gray-100">{totalTracks}</p>
          </div>
          <div className="rounded-lg bg-white/70 px-4 py-3 text-left shadow-sm dark:bg-gray-900/40">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('result.average')}</p>
            <p className="t-d-1 text-gray-900 dark:text-gray-100">{averageLabel}</p>
          </div>
        </div>
        {parsedList.lineCount > 0 && parsedList.invalidCount > 0 && (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            {t('result.invalid', { count: parsedList.invalidCount })}
          </p>
        )}
        <div className="flex justify-center">
          <Button
            type="button"
            onClick={copySummary}
            className="flex items-center gap-2 px-4 py-2 text-sm"
          >
            <Copy size={16} />
            {t('button.copy')}
          </Button>
        </div>
      </div>
    </div>
  );
}
