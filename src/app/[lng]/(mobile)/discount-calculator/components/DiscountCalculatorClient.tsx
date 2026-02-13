'use client';

import React, { useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface DiscountCalculatorClientProps {
  lng: Language;
}

type DiscountItem = {
  id: string;
  value: string;
};

type DiscountStep = {
  rate: number;
  before: number;
  amount: number;
  after: number;
};

const localeMap: Record<Language, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  zh: 'zh-CN',
};

const createDiscount = (value = ''): DiscountItem => ({
  id: crypto.randomUUID(),
  value,
});

const parseNumber = (value: string) => {
  if (!value) return Number.NaN;
  const cleaned = value.replace(/,/g, '').trim();
  if (!cleaned) return Number.NaN;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

const clampRate = (value: number) => Math.min(Math.max(value, 0), 100);

export default function DiscountCalculatorClient({ lng }: DiscountCalculatorClientProps) {
  const { t } = useTranslation(lng, 'discount-calculator');
  const [price, setPrice] = useState('');
  const [discounts, setDiscounts] = useState<DiscountItem[]>([createDiscount('10')]);
  const [copied, setCopied] = useState(false);

  const formatter = useMemo(() => new Intl.NumberFormat(localeMap[lng]), [lng]);
  const rateFormatter = useMemo(
    () => new Intl.NumberFormat(localeMap[lng], { maximumFractionDigits: 2 }),
    [lng],
  );

  const parsedPrice = useMemo(() => parseNumber(price), [price]);

  const parsedDiscounts = useMemo(
    () =>
      discounts.map(({ value }) => {
        const parsed = parseNumber(value);
        if (Number.isNaN(parsed)) return null;
        return clampRate(parsed);
      }),
    [discounts],
  );

  const { steps, finalPrice, totalDiscountAmount, effectiveRate } = useMemo(() => {
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return { steps: [], finalPrice: 0, totalDiscountAmount: 0, effectiveRate: 0 };
    }
    let current = parsedPrice;
    const computedSteps = parsedDiscounts
      .map((rate) => {
        if (rate === null) return null;
        const before = current;
        const amount = (before * rate) / 100;
        const after = before - amount;
        current = after;
        return { rate, before, amount, after };
      })
      .filter((step): step is NonNullable<typeof step> => Boolean(step));

    const totalDiscount = parsedPrice - current;
    const effective = parsedPrice > 0 ? (totalDiscount / parsedPrice) * 100 : 0;

    return {
      steps: computedSteps,
      finalPrice: current,
      totalDiscountAmount: totalDiscount,
      effectiveRate: effective,
    };
  }, [parsedDiscounts, parsedPrice]);

  const hasResult = Number.isFinite(parsedPrice) && parsedPrice > 0;

  const handleDiscountChange = (id: string, value: string) => {
    setDiscounts((prev) => prev.map((item) => (item.id === id ? { ...item, value } : item)));
    setCopied(false);
  };

  const handleAddDiscount = () => {
    setDiscounts((prev) => [...prev, createDiscount()]);
  };

  const handleRemoveDiscount = (id: string) => {
    setDiscounts((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClear = () => {
    setPrice('');
    setDiscounts([createDiscount('10')]);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!hasResult) return;
    try {
      await navigator.clipboard.writeText(formatter.format(finalPrice));
      setCopied(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy result:', error);
    }
  };

  const getStepLabel = (step: DiscountStep, index: number) => {
    const prefix = `${t('labels.step')} ${index + 1}: -${rateFormatter.format(step.rate)}%`;
    const suffix = `(${formatter.format(step.amount)}) → ${formatter.format(step.after)}`;
    return `${prefix} ${suffix}`;
  };

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <label
          htmlFor="discount-price"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('labels.basePrice')}
        </label>
        <Input
          id="discount-price"
          inputMode="decimal"
          placeholder={t('placeholder.price')}
          value={price}
          onChange={(event) => {
            setPrice(event.target.value);
            setCopied(false);
          }}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper.tip')}</p>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <Text asChild variant="d2" color="basic-2">
            <h2>{t('labels.discounts')}</h2>
          </Text>
          <Button
            type="button"
            onClick={handleAddDiscount}
            className="flex items-center gap-2 px-3 py-2 text-xs"
          >
            <Plus size={16} />
            {t('buttons.add')}
          </Button>
        </div>
        <div className="space-y-3">
          {discounts.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <Input
                inputMode="decimal"
                type="number"
                min={0}
                max={100}
                step={0.1}
                placeholder={t('placeholder.discount')}
                value={item.value}
                onChange={(event) => handleDiscountChange(item.id, event.target.value)}
              />
              <span className="text-sm text-gray-500">%</span>
              <Button
                type="button"
                onClick={() => handleRemoveDiscount(item.id)}
                className="flex items-center justify-center px-2 py-2 text-xs"
                disabled={discounts.length === 1}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper.discountNote')}</p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-2 px-3 py-2 text-xs"
          >
            <RefreshCw size={16} />
            {t('buttons.clear')}
          </Button>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex items-center justify-between gap-3">
          <Text asChild variant="d2" color="basic-2">
            <h2>{t('labels.result')}</h2>
          </Text>
          <Button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 text-xs"
            disabled={!hasResult}
          >
            {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copied ? t('buttons.copied') : t('buttons.copy')}
          </Button>
        </div>
        {!hasResult ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('emptyResult')}</p>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <Text variant="c1" color="basic-5">
                  {t('labels.finalPrice')}
                </Text>
                <Text variant="t3" color="basic-1">
                  {formatter.format(finalPrice)}
                </Text>
              </div>
              <div className="space-y-1">
                <Text variant="c1" color="basic-5">
                  {t('labels.totalDiscount')}
                </Text>
                <Text variant="t3" color="basic-2">
                  {formatter.format(totalDiscountAmount)}
                </Text>
              </div>
              <div className="space-y-1">
                <Text variant="c1" color="basic-5">
                  {t('labels.effectiveRate')}
                </Text>
                <Text variant="t3" color="basic-2">
                  {rateFormatter.format(effectiveRate)}%
                </Text>
              </div>
            </div>
            {steps.length > 0 && (
              <div className="space-y-2">
                <Text variant="c1" color="basic-5">
                  {t('labels.step')}
                </Text>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  {steps.map((step, index) => (
                    <li key={`${step.before}-${step.rate}-${step.after}`}>
                      {getStepLabel(step, index)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
