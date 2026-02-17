'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import { Textarea } from '@components/basic/Textarea';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface GratitudeJournalClientProps {
  lng: Language;
}

interface Entry {
  id: string;
  value: string;
}

const createEntries = (count: number, prefix: string): Entry[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `${prefix}-${index}`,
    value: '',
  }));

export default function GratitudeJournalClient({ lng }: GratitudeJournalClientProps) {
  const { t } = useTranslation(lng, 'gratitude-journal');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [gratitudeItems, setGratitudeItems] = useState<Entry[]>(() =>
    createEntries(3, 'gratitude'),
  );
  const [proudItems, setProudItems] = useState<Entry[]>(() => createEntries(1, 'proud'));
  const [intention, setIntention] = useState('');
  const [copied, setCopied] = useState(false);

  const filledCount = useMemo(() => {
    const gratitudeFilled = gratitudeItems.filter((item) => item.value.trim().length > 0).length;
    const proudFilled = proudItems.filter((item) => item.value.trim().length > 0).length;
    const intentionFilled = intention.trim().length > 0 ? 1 : 0;
    return gratitudeFilled + proudFilled + intentionFilled;
  }, [gratitudeItems, proudItems, intention]);

  const totalCount = gratitudeItems.length + proudItems.length + 1;

  const summaryText = useMemo(() => {
    const gratitudeLines = gratitudeItems.map(
      (item, index) => `- ${item.value.trim() || `${t('summary.emptyItem')} ${index + 1}`}`,
    );
    const proudLines = proudItems.map(
      (item, index) => `- ${item.value.trim() || `${t('summary.emptyItem')} ${index + 1}`}`,
    );

    return [
      `${t('section.date')}: ${date || '-'}`,
      '',
      `${t('section.gratitude')}`,
      ...gratitudeLines,
      '',
      `${t('section.proud')}`,
      ...proudLines,
      '',
      `${t('section.intention')}`,
      `- ${intention.trim() || t('summary.emptyIntention')}`,
    ].join('\n');
  }, [date, gratitudeItems, intention, proudItems, t]);

  useEffect(() => {
    setCopied(false);
  }, [summaryText]);

  const handleCopy = async () => {
    if (!summaryText) return;
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy gratitude journal:', error);
    }
  };

  const handleReset = () => {
    setDate(new Date().toISOString().slice(0, 10));
    setGratitudeItems(createEntries(3, 'gratitude'));
    setProudItems(createEntries(1, 'proud'));
    setIntention('');
    setCopied(false);
  };

  const updateEntry =
    (setEntries: React.Dispatch<React.SetStateAction<Entry[]>>, id: string) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setEntries((prev) => prev.map((item) => (item.id === id ? { ...item, value } : item)));
    };

  const addEntry =
    (setEntries: React.Dispatch<React.SetStateAction<Entry[]>>, prefix: string) => () => {
      setEntries((prev) => [
        ...prev,
        {
          id: `${prefix}-${Date.now()}`,
          value: '',
        },
      ]);
    };

  const removeEntry =
    (setEntries: React.Dispatch<React.SetStateAction<Entry[]>>, id: string) => () => {
      setEntries((prev) => prev.filter((item) => item.id !== id));
    };

  return (
    <div className="w-full space-y-6">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold t-basic-1">{t('section.date')}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper')}</p>
          </div>
          <Button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 text-xs"
            variant="ghost"
          >
            <RotateCcw size={14} />
            {t('button.reset')}
          </Button>
        </div>
        <Input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="max-w-[220px]"
        />
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold t-basic-1">{t('section.gratitude')}</h3>
          <Button type="button" onClick={addEntry(setGratitudeItems, 'gratitude')}>
            <Plus size={16} />
            {t('button.add')}
          </Button>
        </div>
        <div className="space-y-3">
          {gratitudeItems.map((item, index) => (
            <div
              key={item.id}
              className={cn(SERVICE_PANEL_SOFT, 'flex items-center gap-2 rounded-2xl p-3')}
            >
              <Input
                value={item.value}
                onChange={updateEntry(setGratitudeItems, item.id)}
                placeholder={`${t('placeholder.gratitude')} ${index + 1}`}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                className="px-2"
                disabled={gratitudeItems.length <= 1}
                onClick={removeEntry(setGratitudeItems, item.id)}
                aria-label={t('button.remove')}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold t-basic-1">{t('section.proud')}</h3>
          <Button type="button" onClick={addEntry(setProudItems, 'proud')}>
            <Plus size={16} />
            {t('button.add')}
          </Button>
        </div>
        <div className="space-y-3">
          {proudItems.map((item, index) => (
            <div
              key={item.id}
              className={cn(SERVICE_PANEL_SOFT, 'flex items-center gap-2 rounded-2xl p-3')}
            >
              <Input
                value={item.value}
                onChange={updateEntry(setProudItems, item.id)}
                placeholder={`${t('placeholder.proud')} ${index + 1}`}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                className="px-2"
                disabled={proudItems.length <= 1}
                onClick={removeEntry(setProudItems, item.id)}
                aria-label={t('button.remove')}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <h3 className="text-sm font-semibold t-basic-1">{t('section.intention')}</h3>
        <Textarea
          rows={3}
          value={intention}
          onChange={(event) => setIntention(event.target.value)}
          placeholder={t('placeholder.intention')}
        />
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold t-basic-1">{t('summary.title')}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('summary.helper')}</p>
          </div>
          <Button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 text-xs"
          >
            {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copied ? t('button.copied') : t('button.copy')}
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div
            className={cn(
              SERVICE_PANEL_SOFT,
              SERVICE_CARD_INTERACTIVE,
              'flex items-center justify-between rounded-2xl px-4 py-3',
            )}
          >
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              {t('summary.filled')}
            </span>
            <span className="text-lg font-bold text-zinc-900 dark:text-white">{filledCount}</span>
          </div>
          <div
            className={cn(
              SERVICE_PANEL_SOFT,
              SERVICE_CARD_INTERACTIVE,
              'flex items-center justify-between rounded-2xl px-4 py-3',
            )}
          >
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              {t('summary.remaining')}
            </span>
            <span className="text-lg font-bold text-zinc-900 dark:text-white">
              {Math.max(totalCount - filledCount, 0)}
            </span>
          </div>
        </div>

        {filledCount > 0 ? (
          <div className="flex flex-wrap gap-2">
            {gratitudeItems
              .filter((item) => item.value.trim().length > 0)
              .map((item) => (
                <span
                  key={item.id}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                >
                  {item.value}
                </span>
              ))}
            {proudItems
              .filter((item) => item.value.trim().length > 0)
              .map((item) => (
                <span
                  key={item.id}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                >
                  {item.value}
                </span>
              ))}
            {intention.trim().length > 0 ? (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                {intention}
              </span>
            ) : null}
          </div>
        ) : (
          <p className="text-xs text-gray-400 dark:text-gray-500">{t('summary.emptyState')}</p>
        )}
      </section>
    </div>
  );
}
