'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface ChangeCalculatorClientProps {
  lng: Language;
}

type CurrencyConfig = {
  key: 'krw' | 'usd' | 'jpy';
  code: 'KRW' | 'USD' | 'JPY';
  symbol: string;
  decimals: number;
  denominations: number[];
};

const currencyConfigs: CurrencyConfig[] = [
  {
    key: 'krw',
    code: 'KRW',
    symbol: '₩',
    decimals: 0,
    denominations: [50000, 10000, 5000, 1000, 500, 100, 50, 10, 1],
  },
  {
    key: 'usd',
    code: 'USD',
    symbol: '$',
    decimals: 2,
    denominations: [10000, 5000, 2000, 1000, 500, 100, 25, 10, 5, 1],
  },
  {
    key: 'jpy',
    code: 'JPY',
    symbol: '¥',
    decimals: 0,
    denominations: [10000, 5000, 2000, 1000, 500, 100, 50, 10, 5, 1],
  },
];

const localeMap: Record<Language, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  zh: 'zh-CN',
};

const sanitizeAmount = (value: string) => value.replace(/[^\d.,]/g, '');

const parseAmount = (value: string, decimals: number) => {
  const normalized = value.replace(/,/g, '').trim();
  if (!normalized) {
    return 0;
  }
  const parsed = Number(normalized);
  if (Number.isNaN(parsed)) {
    return 0;
  }
  return Math.round(parsed * 10 ** decimals);
};

export default function ChangeCalculatorClient({ lng }: ChangeCalculatorClientProps) {
  const { t } = useTranslation(lng, 'change-calculator');
  const [currencyKey, setCurrencyKey] = useState<CurrencyConfig['key']>('krw');
  const [price, setPrice] = useState('');
  const [paid, setPaid] = useState('');

  const currency = useMemo(
    () => currencyConfigs.find((item) => item.key === currencyKey) ?? currencyConfigs[0],
    [currencyKey],
  );

  const priceMinor = useMemo(() => parseAmount(price, currency.decimals), [price, currency]);
  const paidMinor = useMemo(() => parseAmount(paid, currency.decimals), [paid, currency]);
  const changeMinor = paidMinor - priceMinor;

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(localeMap[lng], {
        style: 'currency',
        currency: currency.code,
        minimumFractionDigits: currency.decimals,
        maximumFractionDigits: currency.decimals,
      }),
    [currency.code, currency.decimals, lng],
  );

  const formatAmount = (value: number) => formatter.format(value / 10 ** currency.decimals);

  const breakdown = useMemo(() => {
    if (changeMinor <= 0) {
      return [];
    }
    let remaining = changeMinor;
    return currency.denominations
      .map((unit) => {
        const count = Math.floor(remaining / unit);
        remaining -= count * unit;
        return { unit, count };
      })
      .filter((item) => item.count > 0);
  }, [changeMinor, currency.denominations]);

  const handleCopy = async () => {
    if (changeMinor <= 0) {
      return;
    }
    const summary = t('copyTemplate', {
      price: formatAmount(priceMinor),
      paid: formatAmount(paidMinor),
      change: formatAmount(changeMinor),
    });
    const breakdownText = breakdown
      .map((item) => `${formatAmount(item.unit)} × ${item.count}`)
      .join(', ');
    const text = breakdownText ? `${summary}\n${t('result.breakdown')}: ${breakdownText}` : summary;

    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Copy failed', error);
    }
  };

  const handleClear = () => {
    setPrice('');
    setPaid('');
  };

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <Text variant="d2" color="basic-4" className="font-medium">
            {t('currency.label')}
          </Text>
          <Select
            value={currencyKey}
            onValueChange={(value) => setCurrencyKey(value as CurrencyConfig['key'])}
          >
            <SelectTrigger aria-label={t('currency.label')}>
              <SelectValue placeholder={t('currency.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="krw">{t('currency.krw')}</SelectItem>
              <SelectItem value="usd">{t('currency.usd')}</SelectItem>
              <SelectItem value="jpy">{t('currency.jpy')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Text variant="d2" color="basic-4" className="font-medium">
            {t('input.priceLabel')}
          </Text>
          <Input
            inputMode="decimal"
            placeholder={t('input.pricePlaceholder')}
            value={price}
            onChange={(event) => setPrice(sanitizeAmount(event.target.value))}
          />
          <Text variant="c1" color="basic-6">
            {t('helper.price')}
          </Text>
        </div>

        <div className="space-y-2">
          <Text variant="d2" color="basic-4" className="font-medium">
            {t('input.paidLabel')}
          </Text>
          <Input
            inputMode="decimal"
            placeholder={t('input.paidPlaceholder')}
            value={paid}
            onChange={(event) => setPaid(sanitizeAmount(event.target.value))}
          />
          <Text variant="c1" color="basic-6">
            {t('helper.paid')}
          </Text>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleCopy} disabled={changeMinor <= 0}>
            {t('button.copy')}
          </Button>
          <Button
            type="button"
            onClick={handleClear}
            className="bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
          >
            {t('button.clear')}
          </Button>
        </div>

        <Text variant="c1" color="basic-6">
          {t('note', { symbol: currency.symbol })}
        </Text>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <Text variant="t3" color="basic-2" className="font-bold">
          {t('result.title')}
        </Text>

        {changeMinor < 0 && (
          <Text variant="d1" color="basic-3">
            {t('result.insufficient', { amount: formatAmount(Math.abs(changeMinor)) })}
          </Text>
        )}

        {changeMinor === 0 && priceMinor > 0 && (
          <Text variant="d1" color="basic-3">
            {t('result.exact')}
          </Text>
        )}

        {changeMinor > 0 && (
          <div className="space-y-4">
            <div>
              <Text variant="t2" color="basic-1" className="font-bold">
                {formatAmount(changeMinor)}
              </Text>
              <Text variant="c1" color="basic-6">
                {t('result.summary', {
                  price: formatAmount(priceMinor),
                  paid: formatAmount(paidMinor),
                })}
              </Text>
            </div>

            <div className="space-y-2">
              <Text variant="d2" color="basic-4" className="font-medium">
                {t('result.breakdown')}
              </Text>
              <ul className="space-y-1">
                {breakdown.map((item) => (
                  <li key={item.unit} className="flex items-center justify-between">
                    <Text variant="d2" color="basic-2">
                      {formatAmount(item.unit)}
                    </Text>
                    <Text variant="d2" color="basic-4">
                      × {item.count}
                    </Text>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {priceMinor === 0 && paidMinor === 0 && (
          <Text variant="d2" color="basic-6">
            {t('result.empty')}
          </Text>
        )}
      </div>
    </div>
  );
}
