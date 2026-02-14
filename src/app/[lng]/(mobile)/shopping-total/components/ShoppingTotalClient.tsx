'use client';

import React, { useMemo, useState } from 'react';
import { Clipboard, ClipboardCheck, Plus, Trash2 } from 'lucide-react';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import { Text } from '@components/basic/Text';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface ShoppingTotalClientProps {
  lng: Language;
}

type Item = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

const createItem = (): Item => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  name: '',
  price: 0,
  quantity: 1,
});

const toNumber = (value: string) => {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export default function ShoppingTotalClient({ lng }: ShoppingTotalClientProps) {
  const { t } = useTranslation(lng, 'shopping-total');
  const [items, setItems] = useState<Item[]>([createItem()]);
  const [discountRate, setDiscountRate] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [copied, setCopied] = useState(false);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = subtotal * (discountRate / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (taxRate / 100);
    const total = taxableAmount + taxAmount;
    const activeItems = items.filter((item) => item.name || item.price > 0);
    const itemCount = activeItems.length;
    const quantityTotal = activeItems.reduce((sum, item) => sum + item.quantity, 0);
    const averagePrice = quantityTotal ? subtotal / quantityTotal : 0;

    return {
      subtotal,
      discountAmount,
      taxAmount,
      total,
      itemCount,
      quantityTotal,
      averagePrice,
    };
  }, [items, discountRate, taxRate]);

  const formatNumber = (value: number) =>
    value.toLocaleString(undefined, { maximumFractionDigits: 2 });

  const handleItemChange = (id: string, field: keyof Item, value: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (field === 'name') return { ...item, name: value };
        if (field === 'price') {
          return { ...item, price: Math.max(0, toNumber(value)) };
        }
        if (field === 'quantity') {
          return { ...item, quantity: Math.max(0, Math.floor(toNumber(value))) };
        }
        return item;
      }),
    );
  };

  const createItemFieldId = (itemId: string, field: string) => `shopping-total-${itemId}-${field}`;

  const createAdjustmentId = (field: string) => `shopping-total-${field}`;

  const handleAddItem = () => setItems((prev) => [...prev, createItem()]);

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClear = () => {
    setItems([createItem()]);
    setDiscountRate(0);
    setTaxRate(0);
    setCopied(false);
  };

  const handleSample = () => {
    setItems([
      { id: 'sample-1', name: t('sample.items.0.name'), price: 3500, quantity: 2 },
      { id: 'sample-2', name: t('sample.items.1.name'), price: 8900, quantity: 1 },
      { id: 'sample-3', name: t('sample.items.2.name'), price: 1200, quantity: 3 },
    ]);
    setDiscountRate(10);
    setTaxRate(3);
    setCopied(false);
  };

  const handleCopy = async () => {
    const summaryLines = [
      `${t('labels.subtotal')}: ${formatNumber(totals.subtotal)}${t('unit.currency')}`,
      `${t('labels.discount')}: -${formatNumber(totals.discountAmount)}${t(
        'unit.currency',
      )} (${discountRate}${t('unit.percent')})`,
      `${t('labels.tax')}: +${formatNumber(totals.taxAmount)}${t('unit.currency')} (${taxRate}${t(
        'unit.percent',
      )})`,
      `${t('labels.total')}: ${formatNumber(totals.total)}${t('unit.currency')}`,
      `${t('labels.itemCount')}: ${totals.itemCount}`,
      `${t('labels.quantityTotal')}: ${totals.quantityTotal}`,
    ];

    try {
      await navigator.clipboard.writeText(summaryLines.join('\n'));
      setCopied(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy summary:', error);
    }
  };

  return (
    <div className="space-y-6">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <Text asChild variant="d1" className="font-semibold text-gray-900 dark:text-gray-100">
              <p>{t('labels.items')}</p>
            </Text>
            <Text asChild variant="c1" color="basic-5">
              <p>{t('messages.itemsHint')}</p>
            </Text>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={handleSample} className="px-3 py-2 text-xs">
              {t('buttons.sample')}
            </Button>
            <Button type="button" onClick={handleClear} className="px-3 py-2 text-xs">
              {t('buttons.clear')}
            </Button>
            <Button type="button" onClick={handleAddItem} className="px-3 py-2 text-xs">
              <Plus size={14} className="mr-1" />
              {t('buttons.addItem')}
            </Button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            {t('messages.emptyItems')}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => {
              const itemNameId = createItemFieldId(item.id, 'name');
              const priceId = createItemFieldId(item.id, 'price');
              const quantityId = createItemFieldId(item.id, 'quantity');

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-12 items-center gap-2 rounded-2xl border border-gray-100 bg-white/80 p-3 shadow-sm dark:border-gray-800 dark:bg-zinc-900/70"
                >
                  <div className="col-span-12 text-xs font-medium text-gray-400">
                    {t('labels.item')} {index + 1}
                  </div>
                  <div className="col-span-12 sm:col-span-5">
                    <label htmlFor={itemNameId} className="text-xs font-medium text-gray-500">
                      {t('labels.itemName')}
                    </label>
                    <Input
                      id={itemNameId}
                      value={item.name}
                      placeholder={t('placeholders.itemName')}
                      onChange={(event) => handleItemChange(item.id, 'name', event.target.value)}
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor={priceId} className="text-xs font-medium text-gray-500">
                      {t('labels.price')}
                    </label>
                    <Input
                      id={priceId}
                      type="number"
                      min={0}
                      step={100}
                      value={item.price || ''}
                      placeholder={t('placeholders.price')}
                      onChange={(event) => handleItemChange(item.id, 'price', event.target.value)}
                    />
                    <Text asChild variant="c2" color="basic-6">
                      <p>{t('helpers.price')}</p>
                    </Text>
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor={quantityId} className="text-xs font-medium text-gray-500">
                      {t('labels.quantity')}
                    </label>
                    <Input
                      id={quantityId}
                      type="number"
                      min={0}
                      step={1}
                      value={item.quantity}
                      placeholder={t('placeholders.quantity')}
                      onChange={(event) =>
                        handleItemChange(item.id, 'quantity', event.target.value)
                      }
                    />
                    <Text asChild variant="c2" color="basic-6">
                      <p>{t('helpers.quantity')}</p>
                    </Text>
                  </div>
                  <div className="col-span-12 sm:col-span-1 flex sm:justify-end">
                    <Button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="h-9 w-9 rounded-full bg-zinc-900 text-xs text-white hover:bg-zinc-700"
                      aria-label={t('buttons.remove')}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <Text asChild variant="d1" className="font-semibold text-gray-900 dark:text-gray-100">
          <p>{t('labels.adjustments')}</p>
        </Text>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor={createAdjustmentId('discount')}
              className="text-xs font-medium text-gray-500"
            >
              {t('labels.discount')}
            </label>
            <Input
              id={createAdjustmentId('discount')}
              type="number"
              min={0}
              max={100}
              step={1}
              value={discountRate}
              placeholder={t('placeholders.discount')}
              onChange={(event) =>
                setDiscountRate(Math.min(100, Math.max(0, toNumber(event.target.value))))
              }
            />
            <Text asChild variant="c2" color="basic-6">
              <p>{t('helpers.discount')}</p>
            </Text>
          </div>
          <div className="space-y-2">
            <label
              htmlFor={createAdjustmentId('tax')}
              className="text-xs font-medium text-gray-500"
            >
              {t('labels.tax')}
            </label>
            <Input
              id={createAdjustmentId('tax')}
              type="number"
              min={0}
              max={100}
              step={1}
              value={taxRate}
              placeholder={t('placeholders.tax')}
              onChange={(event) =>
                setTaxRate(Math.min(100, Math.max(0, toNumber(event.target.value))))
              }
            />
            <Text asChild variant="c2" color="basic-6">
              <p>{t('helpers.tax')}</p>
            </Text>
          </div>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Text asChild variant="d1" className="font-semibold text-gray-900 dark:text-gray-100">
            <p>{t('labels.summary')}</p>
          </Text>
          <Button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 text-xs"
          >
            {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copied ? t('buttons.copied') : t('buttons.copySummary')}
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white/80 p-4 dark:border-gray-800 dark:bg-zinc-900/70">
            <Text asChild variant="c1" color="basic-5">
              <p>{t('labels.subtotal')}</p>
            </Text>
            <Text asChild variant="d1" className="font-semibold text-gray-900 dark:text-gray-100">
              <p>
                {formatNumber(totals.subtotal)}
                {t('unit.currency')}
              </p>
            </Text>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white/80 p-4 dark:border-gray-800 dark:bg-zinc-900/70">
            <Text asChild variant="c1" color="basic-5">
              <p>{t('labels.total')}</p>
            </Text>
            <Text asChild variant="d1" className="font-semibold text-gray-900 dark:text-gray-100">
              <p>
                {formatNumber(totals.total)}
                {t('unit.currency')}
              </p>
            </Text>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white/80 p-4 dark:border-gray-800 dark:bg-zinc-900/70">
            <Text asChild variant="c1" color="basic-5">
              <p>{t('labels.itemCount')}</p>
            </Text>
            <Text asChild variant="d2" className="font-semibold text-gray-900 dark:text-gray-100">
              <p>{totals.itemCount}</p>
            </Text>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white/80 p-4 dark:border-gray-800 dark:bg-zinc-900/70">
            <Text asChild variant="c1" color="basic-5">
              <p>{t('labels.quantityTotal')}</p>
            </Text>
            <Text asChild variant="d2" className="font-semibold text-gray-900 dark:text-gray-100">
              <p>{totals.quantityTotal}</p>
            </Text>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white/80 p-4 dark:border-gray-800 dark:bg-zinc-900/70">
            <Text asChild variant="c1" color="basic-5">
              <p>{t('labels.averagePrice')}</p>
            </Text>
            <Text asChild variant="d2" className="font-semibold text-gray-900 dark:text-gray-100">
              <p>
                {formatNumber(totals.averagePrice)}
                {t('unit.currency')}
              </p>
            </Text>
          </div>
        </div>
      </section>
    </div>
  );
}
