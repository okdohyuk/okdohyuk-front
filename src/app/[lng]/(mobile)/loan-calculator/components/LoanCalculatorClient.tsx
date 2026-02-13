'use client';

import React, { useMemo, useState } from 'react';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface LoanCalculatorClientProps {
  lng: Language;
}

type Mode = 'payment' | 'maxLoan';

const sanitizeNumber = (value: string) => value.replace(/[^0-9.]/g, '');

const toNumber = (value: string) => {
  const normalized = value.replace(/,/g, '');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toLocale = (lng: Language) => {
  switch (lng) {
    case 'ko':
      return 'ko-KR';
    case 'ja':
      return 'ja-JP';
    case 'zh':
      return 'zh-CN';
    default:
      return 'en-US';
  }
};

const formatNumber = (value: number, lng: Language) =>
  new Intl.NumberFormat(toLocale(lng), {
    maximumFractionDigits: 2,
  }).format(value);

const calculateMonthlyPayment = (principal: number, annualRate: number, years: number) => {
  const n = years * 12;
  if (n <= 0) return 0;
  if (annualRate === 0) return principal / n;
  const r = annualRate / 100 / 12;
  const numerator = principal * r * (1 + r) ** n;
  const denominator = (1 + r) ** n - 1;
  return denominator === 0 ? 0 : numerator / denominator;
};

const calculatePrincipal = (monthlyPayment: number, annualRate: number, years: number) => {
  const n = years * 12;
  if (n <= 0) return 0;
  if (annualRate === 0) return monthlyPayment * n;
  const r = annualRate / 100 / 12;
  const factor = (1 + r) ** n;
  const numerator = monthlyPayment * (factor - 1);
  const denominator = r * factor;
  return denominator === 0 ? 0 : numerator / denominator;
};

export default function LoanCalculatorClient({ lng }: LoanCalculatorClientProps) {
  const { t } = useTranslation(lng, 'loan-calculator');
  const [mode, setMode] = useState<Mode>('payment');
  const [principal, setPrincipal] = useState('300000000');
  const [annualRate, setAnnualRate] = useState('4.2');
  const [termYears, setTermYears] = useState('30');
  const [monthlyPayment, setMonthlyPayment] = useState('1500000');

  const paymentResult = useMemo(() => {
    const principalValue = toNumber(principal);
    const rateValue = toNumber(annualRate);
    const termValue = toNumber(termYears);

    if (principalValue <= 0 || termValue <= 0 || rateValue < 0) return null;

    const monthly = calculateMonthlyPayment(principalValue, rateValue, termValue);
    const total = monthly * termValue * 12;
    const interest = total - principalValue;

    return { monthly, total, interest };
  }, [principal, annualRate, termYears]);

  const maxLoanResult = useMemo(() => {
    const paymentValue = toNumber(monthlyPayment);
    const rateValue = toNumber(annualRate);
    const termValue = toNumber(termYears);

    if (paymentValue <= 0 || termValue <= 0 || rateValue < 0) return null;

    const maxPrincipal = calculatePrincipal(paymentValue, rateValue, termValue);
    const total = paymentValue * termValue * 12;
    const interest = total - maxPrincipal;

    return { maxPrincipal, total, interest };
  }, [monthlyPayment, annualRate, termYears]);

  const handleCopy = async () => {
    const summary =
      mode === 'payment'
        ? t('copy.payment', {
            monthly: formatNumber(paymentResult?.monthly ?? 0, lng),
            total: formatNumber(paymentResult?.total ?? 0, lng),
            interest: formatNumber(paymentResult?.interest ?? 0, lng),
          })
        : t('copy.maxLoan', {
            maxLoan: formatNumber(maxLoanResult?.maxPrincipal ?? 0, lng),
            total: formatNumber(maxLoanResult?.total ?? 0, lng),
            interest: formatNumber(maxLoanResult?.interest ?? 0, lng),
          });

    await navigator.clipboard.writeText(summary);
  };

  const applyExample = () => {
    if (mode === 'payment') {
      setPrincipal('300000000');
      setAnnualRate('4.2');
      setTermYears('30');
      return;
    }
    setMonthlyPayment('1500000');
    setAnnualRate('4.2');
    setTermYears('30');
  };

  const handleReset = () => {
    setPrincipal('');
    setAnnualRate('');
    setTermYears('');
    setMonthlyPayment('');
  };

  const resultContent = () => {
    if (mode === 'payment') {
      if (!paymentResult) {
        return (
          <Text variant="d3" color="basic-5">
            {t('results.empty')}
          </Text>
        );
      }
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Text variant="d3" color="basic-5">
              {t('results.monthlyPayment')}
            </Text>
            <Text variant="d2" color="basic-1" className="font-semibold">
              {formatNumber(paymentResult.monthly, lng)}
            </Text>
          </div>
          <div className="flex items-center justify-between">
            <Text variant="d3" color="basic-5">
              {t('results.totalPayment')}
            </Text>
            <Text variant="d2" color="basic-1" className="font-semibold">
              {formatNumber(paymentResult.total, lng)}
            </Text>
          </div>
          <div className="flex items-center justify-between">
            <Text variant="d3" color="basic-5">
              {t('results.totalInterest')}
            </Text>
            <Text variant="d2" color="basic-1" className="font-semibold">
              {formatNumber(paymentResult.interest, lng)}
            </Text>
          </div>
          <Button type="button" onClick={handleCopy} className="w-full px-4 py-2 text-sm">
            {t('buttons.copy')}
          </Button>
        </div>
      );
    }

    if (!maxLoanResult) {
      return (
        <Text variant="d3" color="basic-5">
          {t('results.empty')}
        </Text>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Text variant="d3" color="basic-5">
            {t('results.maxLoan')}
          </Text>
          <Text variant="d2" color="basic-1" className="font-semibold">
            {formatNumber(maxLoanResult.maxPrincipal, lng)}
          </Text>
        </div>
        <div className="flex items-center justify-between">
          <Text variant="d3" color="basic-5">
            {t('results.totalPayment')}
          </Text>
          <Text variant="d2" color="basic-1" className="font-semibold">
            {formatNumber(maxLoanResult.total, lng)}
          </Text>
        </div>
        <div className="flex items-center justify-between">
          <Text variant="d3" color="basic-5">
            {t('results.totalInterest')}
          </Text>
          <Text variant="d2" color="basic-1" className="font-semibold">
            {formatNumber(maxLoanResult.interest, lng)}
          </Text>
        </div>
        <Button type="button" onClick={handleCopy} className="w-full px-4 py-2 text-sm">
          {t('buttons.copy')}
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() => setMode('payment')}
          className={cn(
            'px-4 py-2 text-sm',
            mode === 'payment'
              ? 'bg-point-2 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200',
          )}
        >
          {t('mode.payment')}
        </Button>
        <Button
          type="button"
          onClick={() => setMode('maxLoan')}
          className={cn(
            'px-4 py-2 text-sm',
            mode === 'maxLoan'
              ? 'bg-point-2 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200',
          )}
        >
          {t('mode.maxLoan')}
        </Button>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <Text variant="d2" color="basic-2" className="font-semibold">
          {mode === 'payment' ? t('section.payment') : t('section.maxLoan')}
        </Text>
        {mode === 'payment' ? (
          <div className="space-y-4">
            <label htmlFor="principal-input" className="space-y-1">
              <Text variant="d3" color="basic-4">
                {t('fields.principal')}
              </Text>
              <Input
                id="principal-input"
                value={principal}
                onChange={(event) => setPrincipal(sanitizeNumber(event.target.value))}
                placeholder={t('placeholders.principal')}
                inputMode="decimal"
              />
            </label>
            <label htmlFor="annual-rate-input" className="space-y-1">
              <Text variant="d3" color="basic-4">
                {t('fields.annualRate')}
              </Text>
              <Input
                id="annual-rate-input"
                value={annualRate}
                onChange={(event) => setAnnualRate(sanitizeNumber(event.target.value))}
                placeholder={t('placeholders.annualRate')}
                inputMode="decimal"
              />
            </label>
            <label htmlFor="term-years-input" className="space-y-1">
              <Text variant="d3" color="basic-4">
                {t('fields.termYears')}
              </Text>
              <Input
                id="term-years-input"
                value={termYears}
                onChange={(event) => setTermYears(sanitizeNumber(event.target.value))}
                placeholder={t('placeholders.termYears')}
                inputMode="decimal"
              />
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <label htmlFor="monthly-payment-input" className="space-y-1">
              <Text variant="d3" color="basic-4">
                {t('fields.monthlyPayment')}
              </Text>
              <Input
                id="monthly-payment-input"
                value={monthlyPayment}
                onChange={(event) => setMonthlyPayment(sanitizeNumber(event.target.value))}
                placeholder={t('placeholders.monthlyPayment')}
                inputMode="decimal"
              />
            </label>
            <label htmlFor="annual-rate-input" className="space-y-1">
              <Text variant="d3" color="basic-4">
                {t('fields.annualRate')}
              </Text>
              <Input
                id="annual-rate-input"
                value={annualRate}
                onChange={(event) => setAnnualRate(sanitizeNumber(event.target.value))}
                placeholder={t('placeholders.annualRate')}
                inputMode="decimal"
              />
            </label>
            <label htmlFor="term-years-input" className="space-y-1">
              <Text variant="d3" color="basic-4">
                {t('fields.termYears')}
              </Text>
              <Input
                id="term-years-input"
                value={termYears}
                onChange={(event) => setTermYears(sanitizeNumber(event.target.value))}
                placeholder={t('placeholders.termYears')}
                inputMode="decimal"
              />
            </label>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={applyExample} className="px-4 py-2 text-sm">
            {t('buttons.example')}
          </Button>
          <Button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200"
          >
            {t('buttons.reset')}
          </Button>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <Text variant="d2" color="basic-2" className="font-semibold">
          {t('results.title')}
        </Text>
        {resultContent()}
      </div>

      <Text variant="c1" color="basic-6">
        {t('helper')}
      </Text>
    </div>
  );
}
