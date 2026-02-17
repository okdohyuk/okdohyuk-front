'use client';

import React, { useMemo, useState } from 'react';
import { Input } from '@components/basic/Input';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface BudgetSplitterClientProps {
  lng: Language;
}

const clampNumber = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default function BudgetSplitterClient({ lng }: BudgetSplitterClientProps) {
  const { t } = useTranslation(lng, 'budget-splitter');
  const [totalBudget, setTotalBudget] = useState('');
  const [days, setDays] = useState('3');
  const [people, setPeople] = useState('2');
  const [bufferPercent, setBufferPercent] = useState('10');

  const formatter = useMemo(() => new Intl.NumberFormat(lng, { maximumFractionDigits: 0 }), [lng]);

  const calculations = useMemo(() => {
    const budgetValue = Number(totalBudget);
    const dayValue = Number(days) || 0;
    const peopleValue = Number(people) || 0;
    const bufferValue = clampNumber(Number(bufferPercent) || 0, 0, 90);

    if (!budgetValue || budgetValue <= 0) {
      return {
        bufferValue,
        reserveAmount: 0,
        usableBudget: 0,
        perDay: 0,
        perPerson: 0,
        perPersonPerDay: 0,
      };
    }

    const reserveAmount = budgetValue * (bufferValue / 100);
    const usableBudget = Math.max(budgetValue - reserveAmount, 0);
    const perDay = dayValue > 0 ? usableBudget / dayValue : 0;
    const perPerson = peopleValue > 0 ? usableBudget / peopleValue : 0;
    const perPersonPerDay =
      dayValue > 0 && peopleValue > 0 ? usableBudget / (dayValue * peopleValue) : 0;

    return {
      bufferValue,
      reserveAmount,
      usableBudget,
      perDay,
      perPerson,
      perPersonPerDay,
    };
  }, [totalBudget, days, people, bufferPercent]);

  const formatValue = (value: number) => formatter.format(Math.round(value));

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div>
          <label
            htmlFor="total-budget"
            className="text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            {t('label.totalBudget')}
          </label>
          <Input
            id="total-budget"
            type="number"
            inputMode="decimal"
            placeholder={t('placeholder.totalBudget')}
            value={totalBudget}
            onChange={(event) => setTotalBudget(event.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="days" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('label.days')}
            </label>
            <Input
              id="days"
              type="number"
              inputMode="numeric"
              placeholder={t('placeholder.days')}
              value={days}
              min={1}
              onChange={(event) => setDays(event.target.value)}
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
              min={1}
              onChange={(event) => setPeople(event.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="buffer" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {t('label.bufferPercent')}
          </label>
          <Input
            id="buffer"
            type="number"
            inputMode="decimal"
            placeholder={t('placeholder.bufferPercent')}
            value={bufferPercent}
            min={0}
            max={90}
            onChange={(event) => setBufferPercent(event.target.value)}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('helper')}</p>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {t('result.title')}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-200/70 p-3 dark:border-gray-700/70">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('result.usableBudget')}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatValue(calculations.usableBudget)} {t('unit.currency')}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200/70 p-3 dark:border-gray-700/70">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('result.reserveAmount')}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatValue(calculations.reserveAmount)} {t('unit.currency')}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200/70 p-3 dark:border-gray-700/70">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('result.perDay')}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatValue(calculations.perDay)} {t('unit.currency')}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200/70 p-3 dark:border-gray-700/70">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('result.perPerson')}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatValue(calculations.perPerson)} {t('unit.currency')}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200/70 p-3 dark:border-gray-700/70 sm:col-span-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('result.perPersonPerDay')}
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatValue(calculations.perPersonPerDay)} {t('unit.currency')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
