'use client';

import React, { useMemo, useState } from 'react';
import { Text } from '@components/basic/Text';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { Language } from '~/app/i18n/settings';
import { useTranslation } from '~/app/i18n/client';

const DEFAULT_RATIO = {
  needs: 50,
  wants: 30,
  savings: 20,
};

type RatioKeys = keyof typeof DEFAULT_RATIO;

type BudgetPlannerClientProps = {
  lng: Language;
};

export default function BudgetPlannerClient({ lng }: BudgetPlannerClientProps) {
  const { t } = useTranslation(lng, 'budget-planner');
  const [income, setIncome] = useState('');
  const [ratio, setRatio] = useState(DEFAULT_RATIO);
  const [copied, setCopied] = useState(false);

  const numericIncome = useMemo(() => {
    const normalized = income.replace(/,/g, '').trim();
    const value = Number(normalized);
    return Number.isFinite(value) ? value : 0;
  }, [income]);

  const ratioSum = ratio.needs + ratio.wants + ratio.savings;
  const isRatioValid = Math.abs(ratioSum - 100) < 0.01;

  const formatAmount = (value: number) =>
    new Intl.NumberFormat(lng, { maximumFractionDigits: 0 }).format(Math.round(value));

  const breakdown = useMemo(() => {
    if (numericIncome <= 0 || !isRatioValid) {
      return null;
    }

    return {
      needs: numericIncome * (ratio.needs / 100),
      wants: numericIncome * (ratio.wants / 100),
      savings: numericIncome * (ratio.savings / 100),
    };
  }, [numericIncome, ratio, isRatioValid]);

  const handleRatioChange = (key: RatioKeys, value: string) => {
    const nextValue = Math.min(Math.max(Number(value), 0), 100);
    if (Number.isNaN(nextValue)) {
      return;
    }
    setRatio((prev) => ({ ...prev, [key]: nextValue }));
  };

  const handleReset = () => {
    setIncome('');
    setRatio(DEFAULT_RATIO);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!breakdown) return;

    const lines = [
      t('result.title'),
      `${t('result.needs')}: ${formatAmount(breakdown.needs)}`,
      `${t('result.wants')}: ${formatAmount(breakdown.wants)}`,
      `${t('result.savings')}: ${formatAmount(breakdown.savings)}`,
    ];

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-4">
        <div className="space-y-2">
          <Text variant="d2" className="t-basic-2">
            {t('labels.income')}
          </Text>
          <Input
            inputMode="numeric"
            placeholder={t('placeholders.income')}
            value={income}
            onChange={(event) => setIncome(event.target.value)}
          />
          <Text variant="c1" className="t-basic-5">
            {t('helper')}
          </Text>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(
            [
              { key: 'needs', label: t('labels.needs') },
              { key: 'wants', label: t('labels.wants') },
              { key: 'savings', label: t('labels.savings') },
            ] as { key: RatioKeys; label: string }[]
          ).map((item) => (
            <div key={item.key} className="space-y-2">
              <Text variant="d3" className="t-basic-2">
                {item.label}
              </Text>
              <Input
                type="number"
                min={0}
                max={100}
                inputMode="decimal"
                value={ratio[item.key]}
                onChange={(event) => handleRatioChange(item.key, event.target.value)}
              />
              <Text variant="c1" className="t-basic-5">
                {t('labels.percent', { value: ratio[item.key] })}
              </Text>
            </div>
          ))}
        </div>

        {!isRatioValid && (
          <Text variant="c1" className="text-red-500">
            {t('errors.ratio')}
          </Text>
        )}

        <div className="flex flex-wrap gap-2">
          <Button type="button" className="px-3 text-sm" onClick={handleCopy} disabled={!breakdown}>
            {copied ? t('buttons.copied') : t('buttons.copy')}
          </Button>
          <Button
            type="button"
            className="px-3 text-sm bg-gray-200 text-gray-900"
            onClick={handleReset}
          >
            {t('buttons.reset')}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <Text variant="d2" className="t-basic-2">
          {t('result.title')}
        </Text>

        {breakdown ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-100 dark:border-gray-800 p-3 space-y-1">
              <Text variant="d3" className="t-basic-3">
                {t('result.needs')}
              </Text>
              <Text variant="t3" className="t-basic-1">
                {formatAmount(breakdown.needs)}
              </Text>
              <Text variant="c1" className="t-basic-5">
                {t('result.needsHint')}
              </Text>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-gray-800 p-3 space-y-1">
              <Text variant="d3" className="t-basic-3">
                {t('result.wants')}
              </Text>
              <Text variant="t3" className="t-basic-1">
                {formatAmount(breakdown.wants)}
              </Text>
              <Text variant="c1" className="t-basic-5">
                {t('result.wantsHint')}
              </Text>
            </div>
            <div className="rounded-lg border border-gray-100 dark:border-gray-800 p-3 space-y-1">
              <Text variant="d3" className="t-basic-3">
                {t('result.savings')}
              </Text>
              <Text variant="t3" className="t-basic-1">
                {formatAmount(breakdown.savings)}
              </Text>
              <Text variant="c1" className="t-basic-5">
                {t('result.savingsHint')}
              </Text>
            </div>
          </div>
        ) : (
          <Text variant="d3" className="t-basic-4">
            {t('empty')}
          </Text>
        )}
      </div>
    </section>
  );
}
