'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { Text, H2 } from '@components/basic/Text';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface BingeCalculatorClientProps {
  lng: Language;
}

const parseNumber = (value: string) => {
  if (!value.trim()) return 0;
  const normalized = value.replace(/,/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export default function BingeCalculatorClient({ lng }: BingeCalculatorClientProps) {
  const { t } = useTranslation(lng, 'binge-calculator');
  const [totalEpisodesInput, setTotalEpisodesInput] = useState('');
  const [seasonsInput, setSeasonsInput] = useState('1');
  const [episodesPerSeasonInput, setEpisodesPerSeasonInput] = useState('10');
  const [minutesPerEpisodeInput, setMinutesPerEpisodeInput] = useState('45');
  const [introSkipInput, setIntroSkipInput] = useState('0');
  const [hoursPerDayInput, setHoursPerDayInput] = useState('2');

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(lng, {
        maximumFractionDigits: 2,
      }),
    [lng],
  );

  const computed = useMemo(() => {
    const totalEpisodesValue = parseNumber(totalEpisodesInput);
    const seasonsValue = clamp(parseNumber(seasonsInput), 0, 999);
    const episodesPerSeasonValue = clamp(parseNumber(episodesPerSeasonInput), 0, 999);
    const minutesPerEpisodeValue = clamp(parseNumber(minutesPerEpisodeInput), 0, 1000);
    const introSkipValue = clamp(parseNumber(introSkipInput), 0, 60);
    const hoursPerDayValue = clamp(parseNumber(hoursPerDayInput), 0, 24);

    const computedEpisodes = totalEpisodesValue || seasonsValue * episodesPerSeasonValue;
    const effectiveMinutes = Math.max(minutesPerEpisodeValue - introSkipValue, 1);
    const totalMinutes = computedEpisodes * effectiveMinutes;
    const totalHours = totalMinutes / 60;
    const totalDays = totalHours / 24;
    const totalWeeks = totalDays / 7;
    const finishDays = hoursPerDayValue > 0 ? totalHours / hoursPerDayValue : 0;

    return {
      totalEpisodes: computedEpisodes,
      minutesPerEpisode: minutesPerEpisodeValue,
      totalMinutes,
      totalHours,
      totalDays,
      totalWeeks,
      finishDays,
      hoursPerDay: hoursPerDayValue,
      introSkip: introSkipValue,
      hasEpisodes: computedEpisodes > 0,
      hasMinutes: minutesPerEpisodeValue > 0,
    };
  }, [
    totalEpisodesInput,
    seasonsInput,
    episodesPerSeasonInput,
    minutesPerEpisodeInput,
    introSkipInput,
    hoursPerDayInput,
  ]);

  const summary =
    computed.hasEpisodes && computed.hasMinutes
      ? t('summary', {
          episodes: formatter.format(computed.totalEpisodes),
          hours: formatter.format(computed.totalHours),
          days: formatter.format(computed.totalDays),
        })
      : t('summaryEmpty');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Copy failed', error);
    }
  };

  const handleReset = () => {
    setTotalEpisodesInput('');
    setSeasonsInput('1');
    setEpisodesPerSeasonInput('10');
    setMinutesPerEpisodeInput('45');
    setIntroSkipInput('0');
    setHoursPerDayInput('2');
  };

  const handleExample = () => {
    setTotalEpisodesInput('');
    setSeasonsInput('3');
    setEpisodesPerSeasonInput('12');
    setMinutesPerEpisodeInput('50');
    setIntroSkipInput('1.5');
    setHoursPerDayInput('2');
  };

  return (
    <div className="w-full space-y-6">
      <section className={cn(SERVICE_PANEL, 'space-y-4 p-4')}>
        <div className="space-y-1">
          <H2 className="text-xl">{t('inputSection.title')}</H2>
          <Text className="text-sm text-zinc-600 dark:text-zinc-300">
            {t('inputSection.description')}
          </Text>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label htmlFor="total-episodes" className="space-y-2">
            <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {t('label.totalEpisodes')}
            </Text>
            <Input
              id="total-episodes"
              type="text"
              inputMode="numeric"
              placeholder={t('placeholder.totalEpisodes')}
              value={totalEpisodesInput}
              onChange={(event) => setTotalEpisodesInput(event.target.value)}
            />
            <Text className="text-xs text-zinc-500 dark:text-zinc-400">
              {t('helper.totalEpisodes')}
            </Text>
          </label>

          <label htmlFor="seasons" className="space-y-2">
            <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {t('label.seasons')}
            </Text>
            <Input
              id="seasons"
              type="text"
              inputMode="numeric"
              placeholder={t('placeholder.seasons')}
              value={seasonsInput}
              onChange={(event) => setSeasonsInput(event.target.value)}
            />
          </label>

          <label htmlFor="episodes-per-season" className="space-y-2">
            <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {t('label.episodesPerSeason')}
            </Text>
            <Input
              id="episodes-per-season"
              type="text"
              inputMode="numeric"
              placeholder={t('placeholder.episodesPerSeason')}
              value={episodesPerSeasonInput}
              onChange={(event) => setEpisodesPerSeasonInput(event.target.value)}
            />
          </label>

          <label htmlFor="minutes-per-episode" className="space-y-2">
            <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {t('label.minutesPerEpisode')}
            </Text>
            <Input
              id="minutes-per-episode"
              type="text"
              inputMode="decimal"
              placeholder={t('placeholder.minutesPerEpisode')}
              value={minutesPerEpisodeInput}
              onChange={(event) => setMinutesPerEpisodeInput(event.target.value)}
            />
          </label>

          <label htmlFor="intro-skip" className="space-y-2">
            <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {t('label.introSkip')}
            </Text>
            <Input
              id="intro-skip"
              type="text"
              inputMode="decimal"
              placeholder={t('placeholder.introSkip')}
              value={introSkipInput}
              onChange={(event) => setIntroSkipInput(event.target.value)}
            />
            <Text className="text-xs text-zinc-500 dark:text-zinc-400">
              {t('helper.introSkip')}
            </Text>
          </label>

          <label htmlFor="hours-per-day" className="space-y-2">
            <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {t('label.hoursPerDay')}
            </Text>
            <Input
              id="hours-per-day"
              type="text"
              inputMode="decimal"
              placeholder={t('placeholder.hoursPerDay')}
              value={hoursPerDayInput}
              onChange={(event) => setHoursPerDayInput(event.target.value)}
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button className="px-4 py-2 text-sm" onClick={handleExample}>
            {t('button.example')}
          </Button>
          <Button
            className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100"
            onClick={handleReset}
          >
            {t('button.reset')}
          </Button>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex flex-col gap-2">
          <H2 className="text-xl">{t('resultSection.title')}</H2>
          <Text className="text-sm text-zinc-600 dark:text-zinc-300">
            {t('resultSection.description')}
          </Text>
        </div>

        {computed.hasEpisodes && computed.hasMinutes ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200/70 bg-white/80 p-3 text-sm shadow-sm dark:border-zinc-700/70 dark:bg-zinc-900/70">
                <Text className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  {t('result.totalEpisodes')}
                </Text>
                <Text className="text-lg font-semibold">
                  {formatter.format(computed.totalEpisodes)} {t('unit.episodes')}
                </Text>
              </div>
              <div className="rounded-2xl border border-zinc-200/70 bg-white/80 p-3 text-sm shadow-sm dark:border-zinc-700/70 dark:bg-zinc-900/70">
                <Text className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  {t('result.totalHours')}
                </Text>
                <Text className="text-lg font-semibold">
                  {formatter.format(computed.totalHours)} {t('unit.hours')}
                </Text>
              </div>
              <div className="rounded-2xl border border-zinc-200/70 bg-white/80 p-3 text-sm shadow-sm dark:border-zinc-700/70 dark:bg-zinc-900/70">
                <Text className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  {t('result.totalDays')}
                </Text>
                <Text className="text-lg font-semibold">
                  {formatter.format(computed.totalDays)} {t('unit.days')}
                </Text>
              </div>
              <div className="rounded-2xl border border-zinc-200/70 bg-white/80 p-3 text-sm shadow-sm dark:border-zinc-700/70 dark:bg-zinc-900/70">
                <Text className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  {t('result.totalWeeks')}
                </Text>
                <Text className="text-lg font-semibold">
                  {formatter.format(computed.totalWeeks)} {t('unit.weeks')}
                </Text>
              </div>
            </div>

            {computed.hoursPerDay > 0 ? (
              <div className="rounded-2xl border border-point-2/40 bg-point-2/10 p-4">
                <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                  {t('result.finishDays', {
                    days: formatter.format(computed.finishDays),
                    hours: formatter.format(computed.hoursPerDay),
                  })}
                </Text>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-zinc-200/70 bg-white/80 p-4 text-sm dark:border-zinc-700/70 dark:bg-zinc-900/70">
              <Text className="text-sm text-zinc-600 dark:text-zinc-300">{summary}</Text>
              <Button className="px-4 py-2 text-sm" onClick={handleCopy}>
                {t('button.copy')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-200/70 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700/70">
            {t('result.empty')}
          </div>
        )}
      </section>
    </div>
  );
}
