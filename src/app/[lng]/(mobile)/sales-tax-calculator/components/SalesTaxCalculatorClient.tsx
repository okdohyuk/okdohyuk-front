'use client';

import React, { useMemo, useState } from 'react';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

interface SalesTaxCalculatorClientProps {
  lng: Language;
}

const parseNumber = (value: string) => {
  const normalized = value.replace(/,/g, '').trim();
  const numberValue = Number(normalized);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

export default function SalesTaxCalculatorClient({ lng }: SalesTaxCalculatorClientProps) {
  const { t } = useTranslation(lng, 'sales-tax-calculator');
  const [price, setPrice] = useState('');
  const [taxRate, setTaxRate] = useState('10');
  const [quantity, setQuantity] = useState('1');

  const { subtotal, taxAmount, total, totalPerItem } = useMemo(() => {
    const priceValue = parseNumber(price);
    const taxRateValue = parseNumber(taxRate);
    const quantityValue = Math.max(1, parseNumber(quantity));

    const calculatedSubtotal = priceValue * quantityValue;
    const calculatedTax = calculatedSubtotal * (taxRateValue / 100);
    const calculatedTotal = calculatedSubtotal + calculatedTax;

    return {
      subtotal: calculatedSubtotal,
      taxAmount: calculatedTax,
      total: calculatedTotal,
      totalPerItem: calculatedTotal / quantityValue,
    };
  }, [price, quantity, taxRate]);

  const handleReset = () => {
    setPrice('');
    setTaxRate('10');
    setQuantity('1');
  };

  return (
    <div className="w-full space-y-6">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <label htmlFor="price" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('inputs.price.label')}
          </label>
          <Input
            id="price"
            inputMode="decimal"
            placeholder={t('inputs.price.placeholder')}
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('inputs.price.helper')}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="taxRate"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('inputs.taxRate.label')}
            </label>
            <Input
              id="taxRate"
              inputMode="decimal"
              placeholder={t('inputs.taxRate.placeholder')}
              value={taxRate}
              onChange={(event) => setTaxRate(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="quantity"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t('inputs.quantity.label')}
            </label>
            <Input
              id="quantity"
              inputMode="numeric"
              placeholder={t('inputs.quantity.placeholder')}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleReset}
            className="bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
          >
            {t('actions.reset')}
          </Button>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {t('summary.title')}
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {t('summary.subtotal')}
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {subtotal.toLocaleString()} {t('summary.currency')}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {t('summary.tax')}
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {taxAmount.toLocaleString()} {t('summary.currency')}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {t('summary.total')}
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {total.toLocaleString()} {t('summary.currency')}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {t('summary.totalPerItem')}
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {totalPerItem.toLocaleString()} {t('summary.currency')}
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('summary.helper')}</p>
      </section>
    </div>
  );
}
