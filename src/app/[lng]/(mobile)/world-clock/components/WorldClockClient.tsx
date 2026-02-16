'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Language } from '~/app/i18n/settings';
import { useTranslation } from '~/app/i18n/client';
import { Button } from '@components/basic/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { Text } from '@components/basic/Text';
import { H2 } from '@components/basic/Text/Headers';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import { DEFAULT_CITY_IDS, WORLD_CITIES } from '../utils/cities';

const LOCALE_MAP: Record<Language, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  zh: 'zh-CN',
};

type WorldClockClientProps = {
  lng: Language;
};

const getFormattedTime = (
  date: Date,
  locale: string,
  timeZone: string,
  hour12: boolean,
  showDate: boolean,
) => {
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12,
  });

  const dateFormatter = showDate
    ? new Intl.DateTimeFormat(locale, {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : null;

  const zoneFormatter = new Intl.DateTimeFormat(locale, {
    timeZone,
    timeZoneName: 'short',
  });

  const timeZoneName =
    zoneFormatter.formatToParts(date).find((part) => part.type === 'timeZoneName')?.value ?? '';

  return {
    dateText: dateFormatter?.format(date) ?? '',
    timeText: timeFormatter.format(date),
    timeZoneName,
  };
};

export default function WorldClockClient({ lng }: WorldClockClientProps) {
  const { t } = useTranslation(lng, 'world-clock');
  const locale = LOCALE_MAP[lng];

  const [cityIds, setCityIds] = useState<string[]>(DEFAULT_CITY_IDS);
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [now, setNow] = useState<Date>(() => new Date());
  const [hour12, setHour12] = useState(false);
  const [showDate, setShowDate] = useState(true);
  const [lastCopiedId, setLastCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const availableCities = useMemo(
    () => WORLD_CITIES.filter((city) => !cityIds.includes(city.id)),
    [cityIds],
  );

  useEffect(() => {
    if (!availableCities.length) {
      setSelectedCityId('');
      return;
    }

    if (!selectedCityId || !availableCities.some((city) => city.id === selectedCityId)) {
      setSelectedCityId(availableCities[0]?.id ?? '');
    }
  }, [availableCities, selectedCityId]);

  const visibleCities = useMemo(
    () => WORLD_CITIES.filter((city) => cityIds.includes(city.id)),
    [cityIds],
  );

  const handleAddCity = () => {
    if (!selectedCityId) return;
    setCityIds((prev) => [...prev, selectedCityId]);
  };

  const handleRemoveCity = (id: string) => {
    setCityIds((prev) => prev.filter((cityId) => cityId !== id));
  };

  const handleCopy = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setLastCopiedId(id);
      setTimeout(() => setLastCopiedId(null), 1500);
    } catch (error) {
      setLastCopiedId(null);
    }
  };

  const handleReset = () => {
    setCityIds(DEFAULT_CITY_IDS);
    setHour12(false);
    setShowDate(true);
  };

  return (
    <div className="space-y-4">
      <section className={`${SERVICE_PANEL_SOFT} space-y-4 p-4`}>
        <div className="space-y-2">
          <H2>{t('addCity')}</H2>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="w-full sm:flex-1">
              <Select value={selectedCityId} onValueChange={setSelectedCityId}>
                <SelectTrigger aria-label={t('selectCity')}>
                  <SelectValue placeholder={t('selectCity')} />
                </SelectTrigger>
                <SelectContent>
                  {availableCities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {t(`cities.${city.id}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={handleAddCity}
              disabled={!selectedCityId}
            >
              {t('add')}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <H2>{t('settings')}</H2>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={() => setShowDate((prev) => !prev)}
            >
              {showDate ? t('hideDate') : t('showDate')}
            </Button>
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={() => setHour12((prev) => !prev)}
            >
              {hour12 ? t('use24Hour') : t('use12Hour')}
            </Button>
            <Button type="button" className="w-full sm:w-auto" onClick={handleReset}>
              {t('reset')}
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        {visibleCities.length === 0 ? (
          <Text color="basic-5">{t('empty')}</Text>
        ) : (
          visibleCities.map((city) => {
            const { dateText, timeText, timeZoneName } = getFormattedTime(
              now,
              locale,
              city.timeZone,
              hour12,
              showDate,
            );

            const summary = [t(`cities.${city.id}`), dateText, timeText, timeZoneName]
              .filter(Boolean)
              .join(' · ');

            return (
              <div
                key={city.id}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <Text asChild variant="t3">
                      <h3>{t(`cities.${city.id}`)}</h3>
                    </Text>
                    <Text color="basic-5">{timeZoneName}</Text>
                  </div>
                  <div className="text-right">
                    {showDate && <Text color="basic-4">{dateText}</Text>}
                    <Text asChild variant="t2">
                      <p>{timeText}</p>
                    </Text>
                  </div>
                </div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    className="w-full sm:w-auto"
                    onClick={() => handleCopy(city.id, summary)}
                  >
                    {lastCopiedId === city.id ? t('copied') : t('copy')}
                  </Button>
                  <Button
                    type="button"
                    className="w-full sm:w-auto bg-gray-600 hover:bg-gray-500"
                    onClick={() => handleRemoveCity(city.id)}
                  >
                    {t('remove')}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
