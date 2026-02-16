'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';

const zodiacRanges = [
  { key: 'aquarius', start: [1, 20], end: [2, 18] },
  { key: 'pisces', start: [2, 19], end: [3, 20] },
  { key: 'aries', start: [3, 21], end: [4, 19] },
  { key: 'taurus', start: [4, 20], end: [5, 20] },
  { key: 'gemini', start: [5, 21], end: [6, 20] },
  { key: 'cancer', start: [6, 21], end: [7, 22] },
  { key: 'leo', start: [7, 23], end: [8, 22] },
  { key: 'virgo', start: [8, 23], end: [9, 22] },
  { key: 'libra', start: [9, 23], end: [10, 22] },
  { key: 'scorpio', start: [10, 23], end: [11, 21] },
  { key: 'sagittarius', start: [11, 22], end: [12, 21] },
  { key: 'capricorn', start: [12, 22], end: [1, 19] },
];

const formatTwoDigits = (value: number) => value.toString().padStart(2, '0');

const getZodiacKey = (month: number, day: number) => {
  const isWithinRange = (
    currentMonth: number,
    currentDay: number,
    startMonth: number,
    startDay: number,
    endMonth: number,
    endDay: number,
  ) => {
    if (startMonth < endMonth || (startMonth === endMonth && startDay <= endDay)) {
      if (currentMonth < startMonth || currentMonth > endMonth) return false;
      if (currentMonth === startMonth && currentDay < startDay) return false;
      if (currentMonth === endMonth && currentDay > endDay) return false;
      return true;
    }

    if (currentMonth > startMonth || currentMonth < endMonth) return true;
    if (currentMonth === startMonth && currentDay >= startDay) return true;
    if (currentMonth === endMonth && currentDay <= endDay) return true;
    return false;
  };

  const match = zodiacRanges.find(({ start, end }) =>
    isWithinRange(month, day, start[0], start[1], end[0], end[1]),
  );

  return match?.key ?? 'capricorn';
};

type ZodiacFinderClientProps = {
  lng: Language;
};

export default function ZodiacFinderClient({ lng }: ZodiacFinderClientProps) {
  const { t } = useTranslation(lng, 'zodiac-finder');
  const [birthDate, setBirthDate] = useState('');
  const [copied, setCopied] = useState(false);

  const zodiacKey = useMemo(() => {
    if (!birthDate) return null;
    const [year, month, day] = birthDate.split('-').map(Number);
    if (!year || !month || !day) return null;
    return getZodiacKey(month, day);
  }, [birthDate]);

  const zodiacInfo = zodiacKey ? t(`signs.${zodiacKey}`, { returnObjects: true }) : null;
  const traits = zodiacInfo?.traits as string[] | undefined;

  const handleCopy = async () => {
    if (!zodiacInfo || !traits) return;

    const text = [
      t('result.title'),
      `${zodiacInfo.emoji} ${zodiacInfo.name} (${zodiacInfo.range})`,
      `${t('result.traits')}: ${traits.join(', ')}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard might be blocked in some browsers
    }
  };

  const handleToday = () => {
    const today = new Date();
    const value = `${today.getFullYear()}-${formatTwoDigits(
      today.getMonth() + 1,
    )}-${formatTwoDigits(today.getDate())}`;
    setBirthDate(value);
  };

  const handleClear = () => {
    setBirthDate('');
    setCopied(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Text className="text-sm text-gray-500 dark:text-gray-400">{t('label.birthDate')}</Text>
        <Input
          type="date"
          value={birthDate}
          onChange={(event) => setBirthDate(event.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleToday}>
            {t('buttons.today')}
          </Button>
          <Button
            type="button"
            onClick={handleClear}
            className="bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            {t('buttons.clear')}
          </Button>
        </div>
        <Text className="text-xs text-gray-500 dark:text-gray-400">{t('hint')}</Text>
      </div>

      <div
        className={cn(
          'rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-3',
          !zodiacInfo && 'text-gray-400 dark:text-gray-500',
        )}
      >
        {zodiacInfo ? (
          <>
            <div className="space-y-1">
              <Text className="text-sm text-gray-500 dark:text-gray-400">{t('result.title')}</Text>
              <Text className="text-2xl font-semibold">
                {zodiacInfo.emoji} {zodiacInfo.name}
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">{zodiacInfo.range}</Text>
            </div>
            <div className="space-y-2">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {t('result.traits')}
              </Text>
              <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                {traits?.map((trait) => (
                  <li key={trait}>{trait}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={handleCopy}>
                {copied ? t('buttons.copied') : t('buttons.copy')}
              </Button>
            </div>
          </>
        ) : (
          <Text className="text-sm">{t('result.empty')}</Text>
        )}
      </div>
    </div>
  );
}
