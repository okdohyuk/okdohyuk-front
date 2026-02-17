'use client';

import React from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Input } from '@components/basic/Input';
import { SERVICE_PANEL, SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import { cn } from '@utils/cn';
import type { Language } from '~/app/i18n/settings';

const localeMap: Record<Language, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  zh: 'zh-CN',
};

const toNumber = (value: string) => {
  if (!value) return null;
  const normalized = value.replace(/,/g, '').trim();
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
};

const formatNumber = (language: Language, value: number) => {
  return new Intl.NumberFormat(localeMap[language], {
    maximumFractionDigits: 2,
  }).format(value);
};

type Props = {
  lng: Language;
};

export default function CurrencyConverterClient({ lng }: Props) {
  const { t } = useTranslation(lng, 'currency-converter');
  const [baseCurrency, setBaseCurrency] = React.useState('USD');
  const [targetCurrency, setTargetCurrency] = React.useState('KRW');
  const [rate, setRate] = React.useState('');
  const [baseAmount, setBaseAmount] = React.useState('');
  const [feeRate, setFeeRate] = React.useState('');
  const [targetAmount, setTargetAmount] = React.useState('');

  const rateValue = toNumber(rate);
  const baseValue = toNumber(baseAmount);
  const feeValue = toNumber(feeRate) ?? 0;
  const targetValue = toNumber(targetAmount);

  const quickResult = React.useMemo(() => {
    if (!rateValue || !baseValue) return null;
    return baseValue * rateValue;
  }, [rateValue, baseValue]);

  const feeResult = React.useMemo(() => {
    if (!rateValue || !baseValue) return null;
    const feeMultiplier = Math.max(0, 1 - feeValue / 100);
    const afterFee = baseValue * feeMultiplier;
    return {
      afterFee,
      converted: afterFee * rateValue,
    };
  }, [rateValue, baseValue, feeValue]);

  const reverseResult = React.useMemo(() => {
    if (!rateValue || !targetValue) return null;
    const feeMultiplier = 1 - feeValue / 100;
    if (feeMultiplier <= 0) return null;
    return targetValue / rateValue / feeMultiplier;
  }, [rateValue, targetValue, feeValue]);

  return (
    <div className="space-y-4">
      <section className={cn(SERVICE_PANEL, 'p-4 space-y-3')}>
        <header className="space-y-1">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            {t('quick.title')}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('quick.description')}</p>
        </header>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            value={baseCurrency}
            onChange={(e) => setBaseCurrency(e.target.value.toUpperCase())}
            placeholder={t('labels.baseCurrency')}
            className="text-sm"
          />
          <Input
            value={targetCurrency}
            onChange={(e) => setTargetCurrency(e.target.value.toUpperCase())}
            placeholder={t('labels.targetCurrency')}
            className="text-sm"
          />
          <Input
            type="number"
            inputMode="decimal"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder={t('labels.ratePlaceholder')}
            className="text-sm"
          />
          <Input
            type="number"
            inputMode="decimal"
            value={baseAmount}
            onChange={(e) => setBaseAmount(e.target.value)}
            placeholder={t('labels.amountPlaceholder')}
            className="text-sm"
          />
        </div>
        <div className={cn(SERVICE_PANEL_SOFT, 'p-3 text-sm text-zinc-700 dark:text-zinc-200')}>
          {quickResult ? (
            <span>
              {formatNumber(lng, baseValue ?? 0)} {baseCurrency} →{' '}
              <strong className="text-zinc-900 dark:text-white">
                {formatNumber(lng, quickResult)} {targetCurrency}
              </strong>
            </span>
          ) : (
            <span className="text-zinc-400">{t('labels.empty')}</span>
          )}
        </div>
      </section>

      <section className={cn(SERVICE_PANEL, 'p-4 space-y-3')}>
        <header className="space-y-1">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{t('fee.title')}</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('fee.description')}</p>
        </header>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input
            type="number"
            inputMode="decimal"
            value={feeRate}
            onChange={(e) => setFeeRate(e.target.value)}
            placeholder={t('fee.feePlaceholder')}
            className="text-sm"
          />
          <Input
            type="number"
            inputMode="decimal"
            value={baseAmount}
            onChange={(e) => setBaseAmount(e.target.value)}
            placeholder={t('labels.amountPlaceholder')}
            className="text-sm"
          />
          <Input
            type="number"
            inputMode="decimal"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder={t('labels.ratePlaceholder')}
            className="text-sm"
          />
        </div>
        <div className={cn(SERVICE_PANEL_SOFT, 'p-3 text-sm text-zinc-700 dark:text-zinc-200')}>
          {feeResult ? (
            <div className="space-y-1">
              <p>
                {t('fee.afterFee', {
                  amount: formatNumber(lng, feeResult.afterFee),
                  currency: baseCurrency,
                })}
              </p>
              <p className="font-semibold text-zinc-900 dark:text-white">
                {t('fee.converted', {
                  amount: formatNumber(lng, feeResult.converted),
                  currency: targetCurrency,
                })}
              </p>
            </div>
          ) : (
            <span className="text-zinc-400">{t('labels.empty')}</span>
          )}
        </div>
      </section>

      <section className={cn(SERVICE_PANEL, 'p-4 space-y-3')}>
        <header className="space-y-1">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            {t('reverse.title')}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('reverse.description')}</p>
        </header>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input
            type="number"
            inputMode="decimal"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder={t('reverse.targetPlaceholder')}
            className="text-sm"
          />
          <Input
            type="number"
            inputMode="decimal"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder={t('labels.ratePlaceholder')}
            className="text-sm"
          />
          <Input
            type="number"
            inputMode="decimal"
            value={feeRate}
            onChange={(e) => setFeeRate(e.target.value)}
            placeholder={t('fee.feePlaceholder')}
            className="text-sm"
          />
        </div>
        <div className={cn(SERVICE_PANEL_SOFT, 'p-3 text-sm text-zinc-700 dark:text-zinc-200')}>
          {reverseResult ? (
            <span className="font-semibold text-zinc-900 dark:text-white">
              {t('reverse.result', {
                amount: formatNumber(lng, reverseResult),
                currency: baseCurrency,
              })}
            </span>
          ) : (
            <span className="text-zinc-400">{t('labels.empty')}</span>
          )}
        </div>
      </section>
    </div>
  );
}
