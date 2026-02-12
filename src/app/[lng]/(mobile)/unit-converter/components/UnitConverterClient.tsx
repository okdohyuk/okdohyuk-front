'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
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
import { Copy, Check } from 'lucide-react';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import {
  formatValue,
  UNIT_CATEGORIES,
  UnitCategory,
  UnitKey,
} from '~/app/[lng]/(mobile)/unit-converter/utils/conversions';

interface UnitConverterClientProps {
  lng: Language;
}

const QUICK_VALUES = ['1', '10', '100'];

export default function UnitConverterClient({ lng }: UnitConverterClientProps) {
  const { t } = useTranslation(lng, 'unit-converter');
  const [category, setCategory] = useState<UnitCategory>('length');
  const [unit, setUnit] = useState<UnitKey>(UNIT_CATEGORIES.length.defaultUnit);
  const [inputValue, setInputValue] = useState('');
  const [copiedKey, setCopiedKey] = useState<UnitKey | null>(null);

  const currentCategory = UNIT_CATEGORIES[category];
  const currentUnit = currentCategory.units.find((item) => item.key === unit);

  const normalizedValue = inputValue.replace(/,/g, '');
  const parsedValue = normalizedValue === '' ? null : Number(normalizedValue);
  const isNumeric = parsedValue !== null && Number.isFinite(parsedValue);
  const isNegative = isNumeric && parsedValue !== null && parsedValue < 0;
  const canCalculate = isNumeric && (!isNegative || category === 'temperature') && currentUnit;

  const convertedValues = useMemo(() => {
    if (!canCalculate || parsedValue === null || !currentUnit) {
      return [];
    }
    const baseValue = currentUnit.toBase(parsedValue);
    return currentCategory.units.map((item) => ({
      ...item,
      value: item.fromBase(baseValue),
    }));
  }, [canCalculate, parsedValue, currentCategory.units, currentUnit]);

  const handleCategoryChange = (value: string) => {
    const nextCategory = value as UnitCategory;
    const nextDefinition = UNIT_CATEGORIES[nextCategory];
    setCategory(nextCategory);
    setUnit(nextDefinition.defaultUnit);
  };

  const handleCopy = async (value: number, key: UnitKey) => {
    const formatted = formatValue(value);
    try {
      await navigator.clipboard.writeText(formatted);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1200);
    } catch (error) {
      setCopiedKey(null);
    }
  };

  const helperText = (() => {
    if (inputValue.length === 0) return t('helper.empty');
    if (!isNumeric) return t('helper.invalid');
    if (isNegative && category !== 'temperature') return t('helper.negative');
    return t('helper.ready');
  })();

  return (
    <div className="w-full space-y-6">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="grid gap-4 md:grid-cols-[1.2fr_1fr_1fr]">
          <div className="space-y-2">
            <label
              htmlFor="unit-value"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('label.value')}
            </label>
            <Input
              id="unit-value"
              inputMode="decimal"
              placeholder={t('placeholder.value')}
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="unit-category"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('label.category')}
            </label>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger id="unit-category" aria-label={t('label.category')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(UNIT_CATEGORIES).map((key) => (
                  <SelectItem key={key} value={key}>
                    {t(`categories.${key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="unit-base"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('label.unit')}
            </label>
            <Select value={unit} onValueChange={(value) => setUnit(value as UnitKey)}>
              <SelectTrigger id="unit-base" aria-label={t('label.unit')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currentCategory.units.map((item) => (
                  <SelectItem key={item.key} value={item.key}>
                    {t(`units.${item.key}`)} ({item.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            {t('quickLabel')}
          </span>
          {QUICK_VALUES.map((value) => (
            <Button
              key={value}
              type="button"
              onClick={() => setInputValue(value)}
              className="px-3 py-1 text-xs"
            >
              {value}
            </Button>
          ))}
          <Button
            type="button"
            onClick={() => setInputValue('')}
            className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100"
          >
            {t('button.clear')}
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('result.title')}
          </h2>
          <span className="text-xs text-gray-400">{t('result.note')}</span>
        </div>
        {convertedValues.length === 0 ? (
          <div className={cn(SERVICE_PANEL_SOFT, 'p-4 text-sm text-gray-500')}>
            {t('result.empty')}
          </div>
        ) : (
          <div className="grid gap-3">
            {convertedValues.map((item) => (
              <div
                key={item.key}
                className={cn(
                  SERVICE_PANEL_SOFT,
                  SERVICE_CARD_INTERACTIVE,
                  'flex flex-wrap items-center justify-between gap-3 p-4',
                )}
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {t(`units.${item.key}`)}
                  </p>
                  <p className="text-xs text-gray-400">{item.symbol}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {formatValue(item.value)}
                  </p>
                  <Button
                    type="button"
                    onClick={() => handleCopy(item.value, item.key)}
                    className="h-7 w-7 rounded-full p-0 text-xs"
                    aria-label={t('button.copy')}
                  >
                    {copiedKey === item.key ? <Check size={14} /> : <Copy size={14} />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
