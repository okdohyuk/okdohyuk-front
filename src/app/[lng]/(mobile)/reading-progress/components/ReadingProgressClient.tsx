'use client';

import React, { useId, useMemo, useState } from 'react';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface ReadingProgressClientProps {
  lng: Language;
}

const formatNumber = (value: number) => new Intl.NumberFormat().format(value);

export default function ReadingProgressClient({ lng }: ReadingProgressClientProps) {
  const { t } = useTranslation(lng, 'reading-progress');
  const [totalPages, setTotalPages] = useState('');
  const [currentPage, setCurrentPage] = useState('');
  const [pagesPerDay, setPagesPerDay] = useState('');
  const [baseTimestamp] = useState(() => Date.now());

  const totalId = useId();
  const currentId = useId();
  const perDayId = useId();

  const example = {
    total: '320',
    current: '118',
    perDay: '20',
  };

  const { result, errorMessage } = useMemo(() => {
    const total = Number(totalPages);
    const current = Number(currentPage);
    const perDay = Number(pagesPerDay);

    if (!totalPages && !currentPage && !pagesPerDay) {
      return { result: null, errorMessage: null };
    }

    if (!totalPages || Number.isNaN(total) || total <= 0) {
      return { result: null, errorMessage: t('error.totalPages') };
    }

    if (Number.isNaN(current) || current < 0) {
      return { result: null, errorMessage: t('error.currentPage') };
    }

    if (current > total) {
      return { result: null, errorMessage: t('error.exceedTotal') };
    }

    if (pagesPerDay && (Number.isNaN(perDay) || perDay <= 0)) {
      return { result: null, errorMessage: t('error.pagesPerDay') };
    }

    const progress = total === 0 ? 0 : Math.round((current / total) * 1000) / 10;
    const pagesLeft = total - current;
    const daysLeft = perDay ? Math.ceil(pagesLeft / perDay) : null;
    const finishDate = daysLeft ? new Date(baseTimestamp + daysLeft * 24 * 60 * 60 * 1000) : null;

    return {
      result: {
        progress,
        pagesLeft,
        daysLeft,
        finishDate,
      },
      errorMessage: null,
    };
  }, [baseTimestamp, currentPage, pagesPerDay, t, totalPages]);

  const finishDateLabel = result?.finishDate
    ? new Intl.DateTimeFormat(lng, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(result.finishDate)
    : null;

  const resetInputs = () => {
    setTotalPages('');
    setCurrentPage('');
    setPagesPerDay('');
  };

  const applyExample = () => {
    setTotalPages(example.total);
    setCurrentPage(example.current);
    setPagesPerDay(example.perDay);
  };

  let resultContent = (
    <Text variant="d2" color="basic-4">
      {t('result.empty')}
    </Text>
  );

  if (errorMessage) {
    resultContent = (
      <Text variant="d2" className="text-red-500">
        {errorMessage}
      </Text>
    );
  } else if (result) {
    resultContent = (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Text variant="d2" color="basic-5">
            {t('result.progress')}
          </Text>
          <Text variant="d1" className="font-semibold">
            {result.progress}%
          </Text>
        </div>
        <div className="flex items-center justify-between">
          <Text variant="d2" color="basic-5">
            {t('result.pagesLeft')}
          </Text>
          <Text variant="d1" className="font-semibold">
            {formatNumber(result.pagesLeft)} {t('unit.pages')}
          </Text>
        </div>
        <div className="flex items-center justify-between">
          <Text variant="d2" color="basic-5">
            {t('result.daysLeft')}
          </Text>
          <Text variant="d1" className="font-semibold">
            {result.daysLeft ? formatNumber(result.daysLeft) : '-'} {t('unit.days')}
          </Text>
        </div>
        <div className="flex items-center justify-between">
          <Text variant="d2" color="basic-5">
            {t('result.finishDate')}
          </Text>
          <Text variant="d1" className="font-semibold">
            {finishDateLabel || t('result.finishDateEmpty')}
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-5')}>
        <div className="space-y-2">
          <Text variant="d3" color="basic-5">
            {t('hint')}
          </Text>
        </div>
        <div className="grid gap-4">
          <label htmlFor={totalId} className="space-y-2">
            <Text variant="d2" className="font-semibold">
              {t('label.totalPages')}
            </Text>
            <Input
              id={totalId}
              type="number"
              min={1}
              inputMode="numeric"
              placeholder={t('placeholder.totalPages')}
              value={totalPages}
              onChange={(event) => setTotalPages(event.target.value)}
            />
          </label>
          <label htmlFor={currentId} className="space-y-2">
            <Text variant="d2" className="font-semibold">
              {t('label.currentPage')}
            </Text>
            <Input
              id={currentId}
              type="number"
              min={0}
              inputMode="numeric"
              placeholder={t('placeholder.currentPage')}
              value={currentPage}
              onChange={(event) => setCurrentPage(event.target.value)}
            />
          </label>
          <label htmlFor={perDayId} className="space-y-2">
            <Text variant="d2" className="font-semibold">
              {t('label.pagesPerDay')}
            </Text>
            <Input
              id={perDayId}
              type="number"
              min={0}
              inputMode="numeric"
              placeholder={t('placeholder.pagesPerDay')}
              value={pagesPerDay}
              onChange={(event) => setPagesPerDay(event.target.value)}
            />
            <Text variant="c1" color="basic-5">
              {t('helper.pagesPerDay')}
            </Text>
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={applyExample} className="px-4 py-2 text-sm">
            {t('button.example')}
          </Button>
          <Button
            type="button"
            onClick={resetInputs}
            className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100"
          >
            {t('button.reset')}
          </Button>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-5')}>
        <Text variant="t3" className="font-bold">
          {t('result.title')}
        </Text>
        {resultContent}
      </section>
    </div>
  );
}
