'use client';

import React, { useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck } from 'lucide-react';
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

interface BillSplitterClientProps {
  lng: Language;
}

const localeMap: Record<Language, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  zh: 'zh-CN',
};

const toNumber = (value: string) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toInt = (value: string) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 1;
};

interface ResultRowProps {
  label: string;
  value: string;
  emphasize?: boolean;
}

function ResultRow({ label, value, emphasize = false }: ResultRowProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white/70 px-3 py-2 text-sm dark:border-zinc-700/80 dark:bg-zinc-900/70',
        emphasize && 'border-point-2/60 bg-point-2/10',
      )}
    >
      <Text variant="d3" color="basic-4">
        {label}
      </Text>
      <Text variant="d2" className="font-semibold text-zinc-900 dark:text-zinc-50">
        {value}
      </Text>
    </div>
  );
}

ResultRow.defaultProps = {
  emphasize: false,
};

export default function BillSplitterClient({ lng }: BillSplitterClientProps) {
  const { t } = useTranslation(lng, 'bill-splitter');
  const [billAmount, setBillAmount] = useState('');
  const [tipPercent, setTipPercent] = useState('10');
  const [taxPercent, setTaxPercent] = useState('0');
  const [people, setPeople] = useState('2');
  const [copied, setCopied] = useState(false);

  const formatter = useMemo(
    () => new Intl.NumberFormat(localeMap[lng], { maximumFractionDigits: 2 }),
    [lng],
  );

  const calculations = useMemo(() => {
    const bill = Math.max(0, toNumber(billAmount));
    const tipRate = Math.max(0, toNumber(tipPercent)) / 100;
    const taxRate = Math.max(0, toNumber(taxPercent)) / 100;
    const peopleCount = Math.max(1, toInt(people));

    const tip = bill * tipRate;
    const tax = bill * taxRate;
    const total = bill + tip + tax;
    const perPerson = total / peopleCount;

    return {
      bill,
      tip,
      tax,
      total,
      perPerson,
      peopleCount,
    };
  }, [billAmount, tipPercent, taxPercent, people]);

  const hasInput = calculations.bill > 0;

  const summaryLines = [
    `${t('results.subtotal')}: ${formatter.format(calculations.bill)}`,
    `${t('results.tip')}: ${formatter.format(calculations.tip)}`,
    `${t('results.tax')}: ${formatter.format(calculations.tax)}`,
    `${t('results.total')}: ${formatter.format(calculations.total)}`,
    `${t('results.perPerson')}: ${formatter.format(calculations.perPerson)}`,
  ].join('\n');

  const handleCopy = async () => {
    if (!hasInput) return;
    try {
      await navigator.clipboard.writeText(summaryLines);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy bill summary:', error);
    }
  };

  const handleReset = () => {
    setBillAmount('');
    setTipPercent('10');
    setTaxPercent('0');
    setPeople('2');
    setCopied(false);
  };

  const handleExample = () => {
    setBillAmount('42000');
    setTipPercent('10');
    setTaxPercent('8');
    setPeople('3');
    setCopied(false);
  };

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="bill-amount"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('label.billAmount')}
            </label>
            <Input
              id="bill-amount"
              type="number"
              min={0}
              step="0.01"
              placeholder="0"
              value={billAmount}
              onChange={(event) => setBillAmount(event.target.value)}
            />
            <Text variant="c1" color="basic-5">
              {t('helper.billAmount')}
            </Text>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="people"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('label.people')}
            </label>
            <Input
              id="people"
              type="number"
              min={1}
              step="1"
              placeholder="1"
              value={people}
              onChange={(event) => setPeople(event.target.value)}
            />
            <Text variant="c1" color="basic-5">
              {t('helper.people')}
            </Text>
          </div>

          <div className="space-y-2">
            <label htmlFor="tip" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('label.tipPercent')}
            </label>
            <Input
              id="tip"
              type="number"
              min={0}
              step="0.1"
              placeholder="0"
              value={tipPercent}
              onChange={(event) => setTipPercent(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="tax" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('label.taxPercent')}
            </label>
            <Input
              id="tax"
              type="number"
              min={0}
              step="0.1"
              placeholder="0"
              value={taxPercent}
              onChange={(event) => setTaxPercent(event.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" className="px-3 py-2 text-xs" onClick={handleExample}>
            {t('button.example')}
          </Button>
          <Button
            type="button"
            className="px-3 py-2 text-xs bg-zinc-200 text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
            onClick={handleReset}
          >
            {t('button.reset')}
          </Button>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Text variant="d2" className="font-semibold">
            {t('summary')}
          </Text>
          <Button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 text-xs"
            disabled={!hasInput}
          >
            {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copied ? t('button.copied') : t('button.copy')}
          </Button>
        </div>

        {hasInput ? (
          <div className="space-y-3">
            <ResultRow label={t('results.subtotal')} value={formatter.format(calculations.bill)} />
            <ResultRow label={t('results.tip')} value={formatter.format(calculations.tip)} />
            <ResultRow label={t('results.tax')} value={formatter.format(calculations.tax)} />
            <ResultRow label={t('results.total')} value={formatter.format(calculations.total)} />
            <ResultRow
              label={`${t('results.perPerson')} (${calculations.peopleCount})`}
              value={formatter.format(calculations.perPerson)}
              emphasize
            />
          </div>
        ) : (
          <Text variant="d3" color="basic-5">
            {t('empty')}
          </Text>
        )}
      </div>
    </div>
  );
}
