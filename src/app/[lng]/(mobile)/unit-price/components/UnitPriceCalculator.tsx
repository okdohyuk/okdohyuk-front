'use client';

import React, { useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, Plus, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface UnitPriceCalculatorProps {
  lng: Language;
}

interface ItemForm {
  id: string;
  name: string;
  price: string;
  amount: string;
}

interface SampleData {
  baseAmount: number;
  baseUnit: string;
  currency: string;
  items: Array<Pick<ItemForm, 'name' | 'price' | 'amount'>>;
}

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const createEmptyItem = (): ItemForm => ({
  id: createId(),
  name: '',
  price: '',
  amount: '',
});

const parseNumber = (value: string) => {
  const normalized = value.replace(/,/g, '').trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

export default function UnitPriceCalculator({ lng }: UnitPriceCalculatorProps) {
  const { t } = useTranslation(lng, 'unit-price');
  const [baseAmount, setBaseAmount] = useState('100');
  const [baseUnit, setBaseUnit] = useState('g');
  const [currency, setCurrency] = useState('₩');
  const [items, setItems] = useState<ItemForm[]>([createEmptyItem(), createEmptyItem()]);
  const [copied, setCopied] = useState(false);

  const formatter = useMemo(() => new Intl.NumberFormat(lng, { maximumFractionDigits: 2 }), [lng]);

  const baseAmountValue = parseNumber(baseAmount) ?? 0;

  const computedItems = useMemo(() => {
    return items.map((item) => {
      const price = parseNumber(item.price);
      const amount = parseNumber(item.amount);
      const isValid = baseAmountValue > 0 && price !== null && amount !== null && amount > 0;
      const unitPrice = isValid ? (price / amount) * baseAmountValue : null;
      return { ...item, priceValue: price, amountValue: amount, unitPrice, isValid };
    });
  }, [items, baseAmountValue]);

  const cheapestValue = useMemo(() => {
    const validPrices = computedItems
      .filter((item) => item.unitPrice !== null)
      .map((item) => item.unitPrice as number);
    if (!validPrices.length) return null;
    return Math.min(...validPrices);
  }, [computedItems]);

  const summaryText = useMemo(() => {
    const validItems = computedItems.filter((item) => item.unitPrice !== null);
    if (!validItems.length || baseAmountValue <= 0) return '';

    const lines = validItems.map((item, index) => {
      const name = item.name?.trim() || t('result.unnamed', { index: index + 1 });
      const unitPrice = formatter.format(item.unitPrice ?? 0);
      return `${name}: ${currency}${unitPrice} / ${baseAmountValue}${baseUnit}`;
    });

    return [t('result.summaryTitle', { baseAmount: baseAmountValue, baseUnit }), ...lines].join(
      '\n',
    );
  }, [computedItems, baseAmountValue, baseUnit, currency, formatter, t]);

  const handleItemChange = (id: string, field: keyof ItemForm, value: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleAddItem = () => {
    setItems((prev) => [...prev, createEmptyItem()]);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClear = () => {
    setItems([createEmptyItem(), createEmptyItem()]);
    setCopied(false);
  };

  const handleSample = () => {
    const sample = t('sample', { returnObjects: true }) as SampleData;
    setBaseAmount(String(sample.baseAmount));
    setBaseUnit(sample.baseUnit);
    setCurrency(sample.currency);
    setItems(
      sample.items.map((item) => ({
        id: createId(),
        name: item.name,
        price: item.price,
        amount: item.amount,
      })),
    );
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!summaryText) return;
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy summary:', error);
    }
  };

  return (
    <div className="space-y-6">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {t('label.baseUnit')}
          </span>
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <Input
              className="max-w-[120px]"
              inputMode="decimal"
              value={baseAmount}
              onChange={(event) => setBaseAmount(event.target.value)}
            />
            <Input
              className="max-w-[120px]"
              value={baseUnit}
              onChange={(event) => setBaseUnit(event.target.value)}
              placeholder={t('placeholder.unit')}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {t('label.currency')}
            </span>
            <Input
              className="max-w-[100px]"
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              placeholder={t('placeholder.currency')}
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper')}</p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={handleSample}
            className="flex items-center gap-2 px-3 py-2 text-xs"
          >
            <Sparkles size={16} />
            {t('button.sample')}
          </Button>
          <Button type="button" onClick={handleClear} className="px-3 py-2 text-xs" variant="ghost">
            {t('button.clear')}
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        {items.map((item, index) => {
          const isCheapest =
            cheapestValue !== null && item.unitPrice !== null && item.unitPrice === cheapestValue;

          return (
            <div
              key={item.id}
              className={cn(
                SERVICE_PANEL_SOFT,
                SERVICE_CARD_INTERACTIVE,
                'space-y-3 p-4',
                isCheapest && 'border border-point-1/50',
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {t('label.item', { index: index + 1 })}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  className="flex items-center gap-1 px-2 py-1 text-xs"
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={items.length <= 1}
                >
                  <Trash2 size={14} />
                  {t('button.remove')}
                </Button>
              </div>
              <div className="grid gap-2 md:grid-cols-4">
                <Input
                  value={item.name}
                  onChange={(event) => handleItemChange(item.id, 'name', event.target.value)}
                  placeholder={t('placeholder.name')}
                />
                <Input
                  inputMode="decimal"
                  value={item.price}
                  onChange={(event) => handleItemChange(item.id, 'price', event.target.value)}
                  placeholder={t('placeholder.price')}
                />
                <Input
                  inputMode="decimal"
                  value={item.amount}
                  onChange={(event) => handleItemChange(item.id, 'amount', event.target.value)}
                  placeholder={t('placeholder.amount', { unit: baseUnit || t('placeholder.unit') })}
                />
                <div className="flex items-center justify-between rounded-lg border border-dashed border-gray-200 px-3 py-2 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">
                  {item.unitPrice === null ? (
                    <span>{t('result.pending')}</span>
                  ) : (
                    <span>
                      {currency}
                      {formatter.format(item.unitPrice)} / {baseAmountValue}
                      {baseUnit}
                    </span>
                  )}
                  {isCheapest && (
                    <span className="ml-2 rounded-full bg-point-1/10 px-2 py-0.5 text-xs font-semibold text-point-1">
                      {t('result.bestDeal')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={handleAddItem}
            className="flex items-center gap-2 px-3 py-2 text-xs"
          >
            <Plus size={16} />
            {t('button.add')}
          </Button>
          <Button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 text-xs"
            disabled={!summaryText}
          >
            {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copied ? t('button.copied') : t('button.copy')}
          </Button>
        </div>
      </section>
    </div>
  );
}
