'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, RotateCcw } from 'lucide-react';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface TipCalculatorProps {
  lng: Language;
}

const PRESET_TIPS = [10, 12, 15, 18, 20];

const formatAmount = (value: number) => {
  if (!Number.isFinite(value)) return '0.00';
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function TipCalculator({ lng }: TipCalculatorProps) {
  const { t } = useTranslation(lng, 'tip-calculator');
  const [billAmount, setBillAmount] = useState('');
  const [tipPreset, setTipPreset] = useState('15');
  const [customTip, setCustomTip] = useState('');
  const [people, setPeople] = useState('1');
  const [copied, setCopied] = useState(false);

  const tipPercent = useMemo(() => {
    if (tipPreset === 'custom') {
      const parsed = Number.parseFloat(customTip);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return Number.parseFloat(tipPreset);
  }, [customTip, tipPreset]);

  useEffect(() => {
    setCopied(false);
  }, [billAmount, tipPercent, people]);

  const { tipAmount, totalAmount, perPerson } = useMemo(() => {
    const bill = Number.parseFloat(billAmount);
    const headcount = Math.max(Number.parseInt(people || '1', 10), 1);
    if (!Number.isFinite(bill) || bill <= 0) {
      return { tipAmount: 0, totalAmount: 0, perPerson: 0 };
    }
    const tipValue = (bill * tipPercent) / 100;
    const total = bill + tipValue;
    return {
      tipAmount: tipValue,
      totalAmount: total,
      perPerson: total / headcount,
    };
  }, [billAmount, people, tipPercent]);

  const handleCopy = async () => {
    try {
      const summary = t('copy.summary', {
        bill: formatAmount(Number.parseFloat(billAmount) || 0),
        tipPercent: tipPercent.toFixed(1).replace(/\.0$/, ''),
        tipAmount: formatAmount(tipAmount),
        totalAmount: formatAmount(totalAmount),
        perPerson: formatAmount(perPerson),
      });
      await navigator.clipboard.writeText(summary);
      setCopied(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy tip result:', error);
    }
  };

  const handleReset = () => {
    setBillAmount('');
    setTipPreset('15');
    setCustomTip('');
    setPeople('1');
    setCopied(false);
  };

  return (
    <div className="space-y-6">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="bill">
            {t('label.billAmount')}
          </label>
          <Input
            id="bill"
            type="number"
            min="0"
            step="0.01"
            placeholder={t('placeholder.billAmount')}
            value={billAmount}
            onChange={(event) => setBillAmount(event.target.value)}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="tip">
              {t('label.tipPercent')}
            </label>
            <Select value={tipPreset} onValueChange={setTipPreset}>
              <SelectTrigger id="tip">
                <SelectValue placeholder={t('placeholder.tipPercent')} />
              </SelectTrigger>
              <SelectContent>
                {PRESET_TIPS.map((value) => (
                  <SelectItem key={value} value={String(value)}>
                    {t('preset', { value })}
                  </SelectItem>
                ))}
                <SelectItem value="custom">{t('presetCustom')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
              htmlFor="customTip"
            >
              {t('label.customTip')}
            </label>
            <Input
              id="customTip"
              type="number"
              min="0"
              step="0.1"
              disabled={tipPreset !== 'custom'}
              placeholder={t('placeholder.customTip')}
              value={customTip}
              onChange={(event) => setCustomTip(event.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="people">
            {t('label.people')}
          </label>
          <Input
            id="people"
            type="number"
            min="1"
            step="1"
            placeholder={t('placeholder.people')}
            value={people}
            onChange={(event) => setPeople(event.target.value)}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper')}</p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            onClick={() => {
              setBillAmount('100');
              setTipPreset('15');
              setCustomTip('');
              setPeople('2');
            }}
          >
            {t('example.split')}
          </Button>
          <Button
            type="button"
            className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            onClick={() => {
              setBillAmount('45');
              setTipPreset('18');
              setCustomTip('');
              setPeople('1');
            }}
          >
            {t('example.coffee')}
          </Button>
          <Button
            type="button"
            className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            onClick={() => {
              setBillAmount('280');
              setTipPreset('custom');
              setCustomTip('22');
              setPeople('4');
            }}
          >
            {t('example.group')}
          </Button>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('label.result')}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              className="flex items-center gap-2 px-3 py-2 text-xs"
              onClick={handleCopy}
              disabled={!billAmount}
            >
              {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
              {copied ? t('button.copied') : t('button.copy')}
            </Button>
            <Button
              type="button"
              className="flex items-center gap-2 px-3 py-2 text-xs bg-transparent text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              onClick={handleReset}
            >
              <RotateCcw size={16} />
              {t('button.reset')}
            </Button>
          </div>
        </div>
        <div className="grid gap-3 rounded-2xl bg-white/80 p-4 text-sm text-gray-700 shadow-inner dark:bg-gray-900/70 dark:text-gray-200">
          <div className="flex items-center justify-between">
            <span>{t('result.tipAmount')}</span>
            <span className="font-semibold">{formatAmount(tipAmount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t('result.totalAmount')}</span>
            <span className="font-semibold">{formatAmount(totalAmount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t('result.perPerson')}</span>
            <span className="font-semibold">{formatAmount(perPerson)}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('note')}</p>
      </section>
    </div>
  );
}
