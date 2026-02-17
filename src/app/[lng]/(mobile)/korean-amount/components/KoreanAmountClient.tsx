'use client';

import React, { useMemo, useState } from 'react';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { Textarea } from '@components/basic/Textarea';
import { H1, Text } from '@components/basic/Text';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import { convertKoreanAmount } from '~/app/[lng]/(mobile)/korean-amount/utils/convertKoreanAmount';

interface KoreanAmountClientProps {
  lng: Language;
}

const exampleValues = ['12000', '305040100', '9900000000'];

export default function KoreanAmountClient({ lng }: KoreanAmountClientProps) {
  const { t } = useTranslation(lng, 'korean-amount');
  const [rawValue, setRawValue] = useState('');
  const [includeCurrency, setIncludeCurrency] = useState(true);
  const [copied, setCopied] = useState(false);

  const formattedValue = useMemo(() => {
    if (!rawValue) return '';
    const normalized = rawValue.replace(/[^0-9]/g, '');
    if (!normalized) return '';
    return normalized.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }, [rawValue]);

  const result = useMemo(() => {
    const converted = convertKoreanAmount(rawValue);
    if (!converted) return '';
    return includeCurrency ? `${converted}${t('unit.currency')}` : converted;
  }, [rawValue, includeCurrency, t]);

  const helperText = useMemo(() => {
    if (!rawValue) return t('helper.empty');
    if (!rawValue.replace(/[^0-9]/g, '')) return t('helper.invalid');
    return t('helper.valid');
  }, [rawValue, t]);

  const onCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      setCopied(false);
    }
  };

  const onClear = () => {
    setRawValue('');
    setCopied(false);
  };

  return (
    <div className="w-full space-y-6">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <label
            htmlFor="amount-input"
            className="text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            {t('label.amount')}
          </label>
          <Input
            id="amount-input"
            inputMode="numeric"
            placeholder={t('placeholder')}
            value={formattedValue}
            onChange={(event) => setRawValue(event.target.value)}
            className="text-lg font-semibold"
          />
          <Text variant="c1" color="basic-5">
            {helperText}
          </Text>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label
            htmlFor="currency-toggle"
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
          >
            <input
              id="currency-toggle"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-point-1 focus:ring-point-1"
              checked={includeCurrency}
              onChange={(event) => setIncludeCurrency(event.target.checked)}
            />
            {t('option.currency')}
          </label>
          <div className="flex gap-2">
            {exampleValues.map((value) => (
              <Button
                key={value}
                type="button"
                className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100"
                onClick={() => setRawValue(value)}
              >
                {value}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex items-center justify-between gap-4">
          <H1 className="text-2xl text-zinc-900 dark:text-zinc-50">{t('result.title')}</H1>
          <div className="flex gap-2">
            <Button type="button" className="px-3 py-1 text-sm" onClick={onCopy} disabled={!result}>
              {copied ? t('button.copied') : t('button.copy')}
            </Button>
            <Button
              type="button"
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100"
              onClick={onClear}
            >
              {t('button.clear')}
            </Button>
          </div>
        </div>
        <Textarea
          rows={3}
          readOnly
          value={result || t('result.placeholder')}
          className="text-base font-semibold"
        />
        <Text variant="d3" color="basic-4" className="leading-relaxed">
          {t('result.tip')}
        </Text>
      </section>
    </div>
  );
}
