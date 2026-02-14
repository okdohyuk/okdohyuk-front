'use client';

import React, { useMemo, useState } from 'react';
import { Input } from '@components/basic/Input';
import { Textarea } from '@components/basic/Textarea';
import { Button } from '@components/basic/Button';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface RandomToolboxClientProps {
  lng: Language;
}

const parseItems = (value: string) => {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
};

export default function RandomToolboxClient({ lng }: RandomToolboxClientProps) {
  const { t } = useTranslation(lng, 'random-toolbox');

  const [itemsText, setItemsText] = useState('');
  const [pickedItem, setPickedItem] = useState('');
  const [minValue, setMinValue] = useState('1');
  const [maxValue, setMaxValue] = useState('10');
  const [randomNumber, setRandomNumber] = useState('');
  const [yesNo, setYesNo] = useState('');

  const items = useMemo(() => parseItems(itemsText), [itemsText]);

  const handlePickItem = () => {
    if (items.length === 0) {
      setPickedItem(t('sections.list.empty'));
      return;
    }
    const choice = items[Math.floor(Math.random() * items.length)];
    setPickedItem(choice);
  };

  const handleRandomNumber = () => {
    const min = Number(minValue);
    const max = Number(maxValue);
    if (Number.isNaN(min) || Number.isNaN(max) || min > max) {
      setRandomNumber(t('sections.number.error'));
      return;
    }
    const value = Math.floor(Math.random() * (max - min + 1)) + min;
    setRandomNumber(value.toString());
  };

  const handleYesNo = () => {
    const options = [t('sections.yesNo.yes'), t('sections.yesNo.no')];
    const choice = options[Math.floor(Math.random() * options.length)];
    setYesNo(choice);
  };

  return (
    <div className="grid gap-6">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {t('sections.list.title')}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t('sections.list.description')}
          </p>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="random-items"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('sections.list.label')}
          </label>
          <Textarea
            id="random-items"
            value={itemsText}
            placeholder={t('sections.list.placeholder')}
            onChange={(event) => setItemsText(event.target.value)}
            className="min-h-[120px]"
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('sections.list.helper')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handlePickItem} className="px-4">
            {t('sections.list.button')}
          </Button>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {t('sections.list.count', { count: items.length })}
          </span>
        </div>
        <div className={cn(SERVICE_CARD_INTERACTIVE, 'rounded-lg border border-dashed p-4')}>
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            {t('sections.list.resultLabel')}
          </p>
          <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {pickedItem || t('sections.list.resultPlaceholder')}
          </p>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {t('sections.number.title')}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t('sections.number.description')}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="min-value"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('sections.number.labelMin')}
            </label>
            <Input
              id="min-value"
              type="number"
              value={minValue}
              onChange={(event) => setMinValue(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="max-value"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('sections.number.labelMax')}
            </label>
            <Input
              id="max-value"
              type="number"
              value={maxValue}
              onChange={(event) => setMaxValue(event.target.value)}
            />
          </div>
        </div>
        <Button onClick={handleRandomNumber} className="px-4">
          {t('sections.number.button')}
        </Button>
        <div className={cn(SERVICE_CARD_INTERACTIVE, 'rounded-lg border border-dashed p-4')}>
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            {t('sections.number.resultLabel')}
          </p>
          <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {randomNumber || t('sections.number.resultPlaceholder')}
          </p>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {t('sections.yesNo.title')}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t('sections.yesNo.description')}
          </p>
        </div>
        <Button onClick={handleYesNo} className="px-4">
          {t('sections.yesNo.button')}
        </Button>
        <div className={cn(SERVICE_CARD_INTERACTIVE, 'rounded-lg border border-dashed p-4')}>
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            {t('sections.yesNo.resultLabel')}
          </p>
          <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {yesNo || t('sections.yesNo.resultPlaceholder')}
          </p>
        </div>
      </section>
    </div>
  );
}
