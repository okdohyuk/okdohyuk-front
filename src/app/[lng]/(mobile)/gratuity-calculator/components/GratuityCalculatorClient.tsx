'use client';

import React, { useMemo, useState } from 'react';
import { Input } from '@components/basic/Input';
import Select from '@components/complex/Select';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface GratuityCalculatorClientProps {
  lng: Language;
}

const QUICK_RATES = [10, 12, 15, 18, 20];
const CURRENCIES = ['KRW', 'USD', 'JPY', 'CNY'];

const currencyFractionDigits: Record<string, number> = {
  KRW: 0,
  JPY: 0,
  USD: 2,
  CNY: 2,
};

export default function GratuityCalculatorClient({ lng }: GratuityCalculatorClientProps) {
  const { t } = useTranslation(lng, 'gratuity-calculator');
  const [bill, setBill] = useState('');
  const [tipRate, setTipRate] = useState('15');
  const [people, setPeople] = useState('2');
  const [currency, setCurrency] = useState('USD');

  const formatter = useMemo(() => {
    const maximumFractionDigits = currencyFractionDigits[currency] ?? 2;
    return new Intl.NumberFormat(lng, {
      style: 'currency',
      currency,
      minimumFractionDigits: maximumFractionDigits,
      maximumFractionDigits,
    });
  }, [lng, currency]);

  const calculations = useMemo(() => {
    const billValue = Math.max(Number(bill) || 0, 0);
    const tipRateValue = Math.max(Number(tipRate) || 0, 0);
    const peopleValue = Math.max(Math.floor(Number(people) || 1), 1);

    const tipAmount = billValue * (tipRateValue / 100);
    const totalAmount = billValue + tipAmount;
    const perPerson = totalAmount / peopleValue;
    const tipPerPerson = tipAmount / peopleValue;

    return {
      billValue,
      tipRateValue,
      peopleValue,
      tipAmount,
      totalAmount,
      perPerson,
      tipPerPerson,
    };
  }, [bill, tipRate, people]);

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div>
          <label htmlFor="bill" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {t('label.bill')}
          </label>
          <Input
            id="bill"
            type="number"
            inputMode="decimal"
            placeholder={t('placeholder.bill')}
            value={bill}
            onChange={(event) => setBill(event.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="tip-rate"
              className="text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              {t('label.tipRate')}
            </label>
            <Input
              id="tip-rate"
              type="number"
              inputMode="decimal"
              placeholder={t('placeholder.tipRate')}
              value={tipRate}
              onChange={(event) => setTipRate(event.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="people"
              className="text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              {t('label.people')}
            </label>
            <Input
              id="people"
              type="number"
              inputMode="numeric"
              placeholder={t('placeholder.people')}
              value={people}
              onChange={(event) => setPeople(event.target.value)}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="currency"
            className="text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            {t('label.currency')}
          </label>
          <Select className="w-full" value={currency} onChange={setCurrency}>
            {CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {t(`currency.${code.toLowerCase()}`)}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {t('label.quickRates')}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {QUICK_RATES.map((rate) => {
              const isActive = Number(tipRate) === rate;
              return (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setTipRate(String(rate))}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-semibold transition-all',
                    isActive
                      ? 'border-point-2 bg-point-2 text-white'
                      : 'border-zinc-200 bg-white text-gray-700 hover:border-point-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-200',
                  )}
                >
                  {rate}%
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {t('result.title')}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-200/70 p-3 dark:border-gray-700/70">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('result.tip')}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatter.format(calculations.tipAmount)}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200/70 p-3 dark:border-gray-700/70">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('result.total')}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatter.format(calculations.totalAmount)}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200/70 p-3 dark:border-gray-700/70">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('result.perPerson')}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatter.format(calculations.perPerson)}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200/70 p-3 dark:border-gray-700/70">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('result.tipPerPerson')}
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatter.format(calculations.tipPerPerson)}
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper.split')}</p>
      </div>
    </div>
  );
}
