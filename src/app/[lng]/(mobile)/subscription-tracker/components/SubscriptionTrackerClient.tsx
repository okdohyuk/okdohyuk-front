'use client';

import React, { useMemo, useState } from 'react';
import { Plus, Trash2, Copy, RefreshCcw } from 'lucide-react';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { Text } from '@components/basic/Text';
import { Language } from '~/app/i18n/settings';
import { useTranslation } from 'react-i18next';

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

type Cycle = 'monthly' | 'yearly' | 'weekly' | 'daily';

type SubscriptionItem = {
  id: string;
  name: string;
  amount: string;
  cycle: Cycle;
};

type SubscriptionTrackerClientProps = {
  lng: Language;
};

const getMonthlyAmount = (amount: number, cycle: Cycle) => {
  switch (cycle) {
    case 'yearly':
      return amount / 12;
    case 'weekly':
      return (amount * 52) / 12;
    case 'daily':
      return (amount * 365) / 12;
    case 'monthly':
    default:
      return amount;
  }
};

const parseAmount = (value: string) => {
  if (!value) return 0;
  const normalized = value.replace(/,/g, '').replace(/\s/g, '');
  const parsed = Number.parseFloat(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
};

function SubscriptionTrackerClient({ lng }: SubscriptionTrackerClientProps) {
  const { t } = useTranslation('subscription-tracker');
  const [currencySymbol, setCurrencySymbol] = useState(t('placeholders.currency'));
  const [items, setItems] = useState<SubscriptionItem[]>([
    { id: createId(), name: '', amount: '', cycle: 'monthly' },
  ]);
  const [copied, setCopied] = useState(false);

  const cycleOptions: { value: Cycle; label: string }[] = [
    { value: 'monthly', label: t('cycles.monthly') },
    { value: 'yearly', label: t('cycles.yearly') },
    { value: 'weekly', label: t('cycles.weekly') },
    { value: 'daily', label: t('cycles.daily') },
  ];

  const totals = useMemo(() => {
    const monthly = items.reduce((acc, item) => {
      const amount = parseAmount(item.amount);
      return acc + getMonthlyAmount(amount, item.cycle);
    }, 0);
    return {
      monthly,
      yearly: monthly * 12,
    };
  }, [items]);

  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat(lng, {
        maximumFractionDigits: 2,
      }),
    [lng],
  );

  const handleItemChange = (id: string, key: keyof SubscriptionItem, value: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)));
  };

  const handleAddItem = () => {
    setItems((prev) => [...prev, { id: createId(), name: '', amount: '', cycle: 'monthly' }]);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((item) => item.id !== id)));
  };

  const handleClear = () => {
    setItems([{ id: createId(), name: '', amount: '', cycle: 'monthly' }]);
  };

  const handleSample = () => {
    setItems([
      { id: createId(), name: t('samples.streaming'), amount: '13900', cycle: 'monthly' },
      { id: createId(), name: t('samples.music'), amount: '10900', cycle: 'monthly' },
      { id: createId(), name: t('samples.cloud'), amount: '129000', cycle: 'yearly' },
    ]);
  };

  const summaryText = `${t('summary.monthly')}: ${currencySymbol}${numberFormatter.format(
    totals.monthly,
  )} / ${t('summary.yearly')}: ${currencySymbol}${numberFormatter.format(totals.yearly)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      setCopied(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <Text variant="d2" color="basic-4">
              {t('labels.currency')}
            </Text>
            <Input
              value={currencySymbol}
              onChange={(event) => setCurrencySymbol(event.target.value)}
              placeholder={t('placeholders.currency')}
              className="max-w-[120px]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={handleSample} className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              {t('buttons.sample')}
            </Button>
            <Button type="button" onClick={handleClear} className="gap-2">
              <Trash2 className="h-4 w-4" />
              {t('buttons.clear')}
            </Button>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          <div className="grid gap-2 md:grid-cols-[2fr_1fr_1fr_auto]">
            <Text variant="d3" color="basic-4">
              {t('labels.name')}
            </Text>
            <Text variant="d3" color="basic-4">
              {t('labels.amount')}
            </Text>
            <Text variant="d3" color="basic-4">
              {t('labels.cycle')}
            </Text>
            <span />
          </div>
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="grid items-center gap-2 md:grid-cols-[2fr_1fr_1fr_auto]"
              >
                <Input
                  value={item.name}
                  onChange={(event) => handleItemChange(item.id, 'name', event.target.value)}
                  placeholder={t('placeholders.name')}
                />
                <Input
                  value={item.amount}
                  onChange={(event) => handleItemChange(item.id, 'amount', event.target.value)}
                  placeholder={t('placeholders.amount')}
                  inputMode="decimal"
                />
                <Select
                  value={item.cycle}
                  onValueChange={(value) => handleItemChange(item.id, 'cycle', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('labels.cycle')} />
                  </SelectTrigger>
                  <SelectContent>
                    {cycleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={() => handleRemoveItem(item.id)} className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  {t('buttons.remove')}
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" onClick={handleAddItem} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('buttons.add')}
          </Button>
          <Text variant="d3" color="basic-5">
            {t('tips')}
          </Text>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <Text variant="d3" color="basic-4">
            {t('summary.monthly')}
          </Text>
          <Text variant="t3" color="basic-1" className="mt-2">
            {currencySymbol}
            {numberFormatter.format(totals.monthly)}
          </Text>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <Text variant="d3" color="basic-4">
            {t('summary.yearly')}
          </Text>
          <Text variant="t3" color="basic-1" className="mt-2">
            {currencySymbol}
            {numberFormatter.format(totals.yearly)}
          </Text>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <Text variant="d2" color="basic-4">
          {t('summary.shareTitle')}
        </Text>
        <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <Text variant="d2" color="basic-2" className="break-all">
            {summaryText}
          </Text>
          <Button type="button" onClick={handleCopy} className="gap-2">
            <Copy className="h-4 w-4" />
            {copied ? t('messages.copied') : t('buttons.copy')}
          </Button>
        </div>
        <Text variant="d3" color="basic-5" className="mt-2">
          {t('summary.note')}
        </Text>
      </div>
    </section>
  );
}

export default SubscriptionTrackerClient;
