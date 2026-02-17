'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import { cn } from '@utils/cn';

type HomeSize = 'studio' | 'small' | 'large';

type ChecklistTask = {
  id: string;
  offset: number;
};

const localeMap: Record<Language, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  zh: 'zh-CN',
};

const baseTasks: ChecklistTask[] = [
  { id: 'compareQuotes', offset: -30 },
  { id: 'declutter', offset: -21 },
  { id: 'packingSupplies', offset: -14 },
  { id: 'addressChange', offset: -7 },
  { id: 'utilityTransfer', offset: -5 },
  { id: 'packing', offset: -2 },
  { id: 'essentialsBag', offset: -1 },
  { id: 'moveDay', offset: 0 },
  { id: 'cleaning', offset: 1 },
  { id: 'unpack', offset: 3 },
  { id: 'neighbors', offset: 7 },
];

const sizeTasks: Record<HomeSize, ChecklistTask[]> = {
  studio: [],
  small: [],
  large: [
    { id: 'bulkTrash', offset: -10 },
    { id: 'elevatorReservation', offset: -7 },
  ],
};

const sizeBoxes: Record<HomeSize, number> = {
  studio: 10,
  small: 20,
  large: 35,
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export default function MovingChecklistPage({ params }: LanguageParams) {
  const { lng } = React.use(params);
  const language = lng as Language;
  const { t } = useTranslation(language, 'moving-checklist');

  const [moveDate, setMoveDate] = useState('');
  const [homeSize, setHomeSize] = useState<HomeSize>('small');
  const [copied, setCopied] = useState(false);

  const checklist = useMemo(() => {
    const tasks = [...baseTasks, ...sizeTasks[homeSize]].sort((a, b) => a.offset - b.offset);
    const targetDate = moveDate ? new Date(moveDate) : null;

    return tasks.map((task) => {
      let dayLabel = t('labels.moveDay');
      if (task.offset < 0) {
        dayLabel = t('labels.dayBefore', { days: Math.abs(task.offset) });
      } else if (task.offset > 0) {
        dayLabel = t('labels.dayAfter', { days: task.offset });
      }

      const dateLabel = targetDate
        ? new Intl.DateTimeFormat(localeMap[language], {
            month: 'short',
            day: 'numeric',
          }).format(addDays(targetDate, task.offset))
        : null;

      return {
        id: task.id,
        title: t(`tasks.${task.id}`),
        dayLabel,
        dateLabel,
      };
    });
  }, [homeSize, language, moveDate, t]);

  const summaryText = useMemo(() => {
    const targetDate = moveDate
      ? new Intl.DateTimeFormat(localeMap[language], {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }).format(new Date(moveDate))
      : t('copyNoDate');

    return t('copyFormat', {
      date: targetDate,
      size: t(`size.${homeSize}`),
      boxes: sizeBoxes[homeSize],
      tasks: checklist.length,
    });
  }, [checklist.length, homeSize, language, moveDate, t]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Ignore clipboard errors.
    }
  };

  const handleSample = () => {
    const sampleDate = addDays(new Date(), 21).toISOString().slice(0, 10);
    setMoveDate(sampleDate);
    setHomeSize('small');
  };

  const handleReset = () => {
    setMoveDate('');
    setHomeSize('small');
    setCopied(false);
  };

  return (
    <div className="space-y-4">
      <ServicePageHeader
        title={t('title')}
        description={t('openGraph.description')}
        badge="Life Planner"
      />

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <label className="t-b-2" htmlFor="move-date-input">
            {t('form.moveDate')}
          </label>
          <Input
            id="move-date-input"
            type="date"
            value={moveDate}
            onChange={(event) => setMoveDate(event.target.value)}
          />
          <p className="t-d-2 text-gray-500">{t('form.moveDateHint')}</p>
        </div>
        <div className="space-y-2">
          <p className="t-b-2">{t('form.homeSize')}</p>
          <Select value={homeSize} onValueChange={(value) => setHomeSize(value as HomeSize)}>
            <SelectTrigger aria-label={t('form.homeSize')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="studio">{t('size.studio')}</SelectItem>
              <SelectItem value="small">{t('size.small')}</SelectItem>
              <SelectItem value="large">{t('size.large')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleSample}>
            {t('actions.sample')}
          </Button>
          <Button type="button" onClick={handleReset} className="bg-gray-600 hover:bg-gray-500">
            {t('actions.reset')}
          </Button>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="flex items-center justify-between">
          <h2 className="t-b-2">{t('summary.title')}</h2>
          <Button
            type="button"
            onClick={handleCopy}
            className={cn('min-w-[104px]', copied ? 'bg-emerald-500 hover:bg-emerald-500' : '')}
          >
            {copied ? t('actions.copied') : t('actions.copy')}
          </Button>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 dark:bg-gray-900/40">
            <span className="t-d-2 text-gray-500">{t('summary.boxes')}</span>
            <span className="t-b-2">{sizeBoxes[homeSize]}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 dark:bg-gray-900/40">
            <span className="t-d-2 text-gray-500">{t('summary.tasks')}</span>
            <span className="t-b-2">{checklist.length}</span>
          </div>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <h2 className="t-b-2">{t('result.title')}</h2>
        {!moveDate ? <p className="t-d-2 text-gray-500">{t('result.empty')}</p> : null}
        <ul className="space-y-2">
          {checklist.map((task) => (
            <li
              key={task.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white/70 px-3 py-2 dark:border-gray-800 dark:bg-gray-900/40"
            >
              <div className="flex flex-col">
                <span className="t-b-2">{task.title}</span>
                {task.dateLabel ? (
                  <span className="t-d-2 text-gray-500">{task.dateLabel}</span>
                ) : null}
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-200">
                {task.dayLabel}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
