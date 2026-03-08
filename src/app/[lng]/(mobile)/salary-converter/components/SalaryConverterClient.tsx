'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import { cn } from '@utils/cn';
import {
  DEFAULT_DAYS,
  DEFAULT_HOURS,
  DEFAULT_WEEKS,
  SalaryMode,
  calculateSalaryValues,
  formatCurrencyInput,
  normalizeCurrencyInput,
} from '../utils/salaryConverter';

type SalaryConverterClientProps = {
  lng: Language;
};

const localeMap: Record<Language, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  zh: 'zh-CN',
};

export default function SalaryConverterClient({ lng }: SalaryConverterClientProps) {
  const { t } = useTranslation(lng, 'salary-converter');
  const [mode, setMode] = useState<SalaryMode>('annual');
  const [monthlySalary, setMonthlySalary] = useState('');
  const [hourlyWage, setHourlyWage] = useState('');
  const [annualSalary, setAnnualSalary] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState(String(DEFAULT_DAYS));
  const [hoursPerDay, setHoursPerDay] = useState(String(DEFAULT_HOURS));
  const [weeksPerMonth, setWeeksPerMonth] = useState(String(DEFAULT_WEEKS));
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(localeMap[lng], {
        maximumFractionDigits: 0,
      }),
    [lng],
  );

  const values = useMemo(() => {
    return calculateSalaryValues({
      mode,
      monthlySalary,
      hourlyWage,
      annualSalary,
      daysPerWeek,
      hoursPerDay,
      weeksPerMonth,
    });
  }, [mode, monthlySalary, hourlyWage, annualSalary, daysPerWeek, hoursPerDay, weeksPerMonth]);

  const reset = () => {
    setMonthlySalary('');
    setHourlyWage('');
    setAnnualSalary('');
    setDaysPerWeek(String(DEFAULT_DAYS));
    setHoursPerDay(String(DEFAULT_HOURS));
    setWeeksPerMonth(String(DEFAULT_WEEKS));
  };

  const primaryInputByMode = {
    annual: {
      label: t('annualLabel'),
      placeholder: t('annualPlaceholder'),
      value: formatCurrencyInput(annualSalary),
      onChange: setAnnualSalary,
    },
    monthly: {
      label: t('monthlyLabel'),
      placeholder: t('monthlyPlaceholder'),
      value: formatCurrencyInput(monthlySalary),
      onChange: setMonthlySalary,
    },
    hourly: {
      label: t('hourlyLabel'),
      placeholder: t('hourlyPlaceholder'),
      value: formatCurrencyInput(hourlyWage),
      onChange: setHourlyWage,
    },
  } satisfies Record<
    SalaryMode,
    {
      label: string;
      placeholder: string;
      value: string;
      onChange: React.Dispatch<React.SetStateAction<string>>;
    }
  >;

  const primaryInput = primaryInputByMode[mode];

  return (
    <div className="space-y-4">
      <section className={`${SERVICE_PANEL_SOFT} space-y-4 p-4`}>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">{t('modeLabel')}</p>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'annual', label: t('modeAnnual') },
              { key: 'monthly', label: t('modeMonthly') },
              { key: 'hourly', label: t('modeHourly') },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setMode(item.key as SalaryMode)}
                className={cn(
                  'rounded-full px-3 py-1 text-sm font-medium transition-colors',
                  mode === item.key
                    ? 'bg-point-2 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-semibold text-gray-700">{primaryInput.label}</span>
          <Input
            type="text"
            inputMode="numeric"
            placeholder={primaryInput.placeholder}
            value={primaryInput.value}
            onChange={(event) => primaryInput.onChange(normalizeCurrencyInput(event.target.value))}
            className="min-h-11 px-3 text-base"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('daysLabel')}</span>
            <Input
              type="number"
              min={1}
              max={7}
              step="1"
              value={daysPerWeek}
              onChange={(event) => setDaysPerWeek(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('hoursLabel')}</span>
            <Input
              type="number"
              min={1}
              max={24}
              step="0.5"
              value={hoursPerDay}
              onChange={(event) => setHoursPerDay(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-gray-700">{t('weeksLabel')}</span>
            <Input
              type="number"
              min={1}
              step="0.1"
              value={weeksPerMonth}
              onChange={(event) => setWeeksPerMonth(event.target.value)}
            />
          </div>
        </div>

        <p className="text-xs text-gray-500">{t('tips')}</p>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={reset} className="px-4 bg-gray-200 text-gray-700">
            {t('reset')}
          </Button>
        </div>
      </section>

      <section className={`${SERVICE_PANEL_SOFT} space-y-3 p-4`}>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('hourlyResult')}</p>
          <p className="text-lg font-semibold text-gray-800">
            {t('currency', { value: currencyFormatter.format(Math.round(values.baseHourly)) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('dailyResult')}</p>
          <p className="text-base font-medium text-gray-700">
            {t('currency', { value: currencyFormatter.format(Math.round(values.daily)) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('weeklyResult')}</p>
          <p className="text-base font-medium text-gray-700">
            {t('currency', { value: currencyFormatter.format(Math.round(values.weekly)) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('monthlyResult')}</p>
          <p className="text-base font-medium text-gray-700">
            {t('currency', { value: currencyFormatter.format(Math.round(values.baseMonthly)) })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-700">{t('annualResult')}</p>
          <p className="text-base font-medium text-gray-700">
            {t('currency', { value: currencyFormatter.format(Math.round(values.annual)) })}
          </p>
        </div>
      </section>
    </div>
  );
}
