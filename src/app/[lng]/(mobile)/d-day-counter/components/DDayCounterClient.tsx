'use client';

import React, { useMemo, useState } from 'react';
import { Language } from '~/app/i18n/settings';
import { useTranslation } from '~/app/i18n/client';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

const DAY_MS = 1000 * 60 * 60 * 24;

interface DDayCounterClientProps {
  lng: Language;
}

export default function DDayCounterClient({ lng }: DDayCounterClientProps) {
  const { t } = useTranslation(lng, 'd-day-counter');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [includeToday, setIncludeToday] = useState(true);
  const [copyStatus, setCopyStatus] = useState('');

  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  const result = useMemo(() => {
    if (!date) {
      return null;
    }

    const target = new Date(`${date}T00:00:00`);
    if (Number.isNaN(target.getTime())) {
      return null;
    }

    const diffDays = Math.round((target.getTime() - today.getTime()) / DAY_MS);
    const absoluteDays = Math.abs(diffDays);
    const countedDays = includeToday ? absoluteDays + 1 : absoluteDays;

    return {
      diffDays,
      countedDays,
      weeks: countedDays / 7,
      months: countedDays / 30.4375,
    };
  }, [date, includeToday, today]);

  const titleText = title.trim() || t('label.defaultTitle');

  const buildResultLabel = () => {
    if (!result) return t('result.empty');
    if (result.diffDays === 0) return t('result.dDay');
    if (result.diffDays > 0) return t('result.dMinus', { count: result.diffDays });
    return t('result.dPlus', { count: Math.abs(result.diffDays) });
  };

  const buildDetailLabel = () => {
    if (!result) return '';
    if (result.diffDays === 0) return t('result.todayLabel');
    return result.diffDays > 0 ? t('result.daysRemaining') : t('result.daysSince');
  };

  const resultLabel = buildResultLabel();
  const detailLabel = buildDetailLabel();

  const handleCopy = async () => {
    if (!result) return;
    const detail = `${detailLabel}: ${result.countedDays}${t('label.days')}`;
    const message = `${titleText} · ${resultLabel} (${detail})`;

    try {
      await navigator.clipboard.writeText(message);
      setCopyStatus(t('copy.success'));
    } catch (error) {
      setCopyStatus(t('copy.fail'));
    }

    setTimeout(() => setCopyStatus(''), 2000);
  };

  const handleToday = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    setDate(`${yyyy}-${mm}-${dd}`);
  };

  const handleClear = () => {
    setTitle('');
    setDate('');
    setCopyStatus('');
  };

  return (
    <div className="space-y-4">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <Text variant="d2" color="basic-3">
            {t('label.title')}
          </Text>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={t('placeholder.title')}
          />
        </div>
        <div className="space-y-2">
          <Text variant="d2" color="basic-3">
            {t('label.date')}
          </Text>
          <div className="flex flex-wrap gap-2">
            <Input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="min-w-[180px]"
            />
            <Button type="button" onClick={handleToday}>
              {t('button.today')}
            </Button>
            <Button type="button" onClick={handleClear}>
              {t('button.clear')}
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            id="include-today"
            type="checkbox"
            checked={includeToday}
            onChange={() => setIncludeToday((prev) => !prev)}
            className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
          />
          <label htmlFor="include-today">{t('label.includeToday')}</label>
        </div>
        <Text variant="c1" color="basic-5">
          {t('helper')}
        </Text>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-1">
          <Text variant="d2" color="basic-4">
            {titleText}
          </Text>
          <Text variant="t2" color="basic-1">
            {resultLabel}
          </Text>
        </div>
        {result ? (
          <div className="grid gap-3 text-sm text-gray-700 dark:text-gray-300 sm:grid-cols-3">
            <div className="space-y-1">
              <Text variant="d3" color="basic-4">
                {detailLabel}
              </Text>
              <Text variant="t3" color="basic-2">
                {result.countedDays}
                {t('label.days')}
              </Text>
            </div>
            <div className="space-y-1">
              <Text variant="d3" color="basic-4">
                {t('label.weeks')}
              </Text>
              <Text variant="t3" color="basic-2">
                {result.weeks.toFixed(1)}
              </Text>
            </div>
            <div className="space-y-1">
              <Text variant="d3" color="basic-4">
                {t('label.months')}
              </Text>
              <Text variant="t3" color="basic-2">
                {result.months.toFixed(1)}
              </Text>
            </div>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" onClick={handleCopy} disabled={!result}>
            {t('button.copy')}
          </Button>
          {copyStatus ? (
            <Text variant="c1" color="basic-5">
              {copyStatus}
            </Text>
          ) : null}
        </div>
      </section>
    </div>
  );
}
