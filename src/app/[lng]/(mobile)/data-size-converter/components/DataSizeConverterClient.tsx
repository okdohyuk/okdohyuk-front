'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { cn } from '@utils/cn';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import GoogleAd from '@components/google/GoogleAd';

const localeMap: Record<Language, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  zh: 'zh-CN',
};

const units = [
  { key: 'byte', power: 0 },
  { key: 'kilobyte', power: 1 },
  { key: 'megabyte', power: 2 },
  { key: 'gigabyte', power: 3 },
  { key: 'terabyte', power: 4 },
  { key: 'petabyte', power: 5 },
  { key: 'exabyte', power: 6 },
  { key: 'zettabyte', power: 7 },
  { key: 'yottabyte', power: 8 },
] as const;

type UnitKey = (typeof units)[number]['key'];

type StandardKey = 'decimal' | 'binary';

interface DataSizeConverterClientProps {
  lng: Language;
}

export default function DataSizeConverterClient({ lng }: DataSizeConverterClientProps) {
  const { t } = useTranslation(lng, 'data-size-converter');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState<UnitKey>('megabyte');
  const [standard, setStandard] = useState<StandardKey>('binary');

  const numberFormatter = useMemo(() => {
    return new Intl.NumberFormat(localeMap[lng], {
      maximumFractionDigits: 4,
    });
  }, [lng]);

  const results = useMemo(() => {
    if (!value.trim()) {
      return null;
    }

    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) {
      return null;
    }

    const base = standard === 'binary' ? 1024 : 1000;
    const unitPower = units.find((entry) => entry.key === unit)?.power ?? 0;
    const bytes = numericValue * base ** unitPower;

    return units.map((entry) => {
      const converted = bytes / base ** entry.power;
      return {
        key: entry.key,
        value: converted,
      };
    });
  }, [standard, unit, value]);

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <label htmlFor="data-size-input" className="text-sm font-semibold text-fg-2">
          {t('label.input')}
        </label>
        <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
          <Input
            id="data-size-input"
            type="text"
            inputMode="decimal"
            className="font-mono"
            placeholder={t('placeholder')}
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <Select value={unit} onValueChange={(nextValue) => setUnit(nextValue as UnitKey)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {units.map((entry) => (
                <SelectItem key={entry.key} value={entry.key}>
                  {t(`units.${entry.key}`)} ({t(`unitShort.${entry.key}`)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={standard}
            onValueChange={(nextValue) => setStandard(nextValue as StandardKey)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="decimal">{t('standard.decimal')}</SelectItem>
              <SelectItem value="binary">{t('standard.binary')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-fg-5">{t('helper')}</p>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="text-sm font-semibold text-fg-1">{t('result.title')}</div>
        {results ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {results.map((entry) => (
              <li
                key={entry.key}
                className="rounded-xl border border-basic-3 bg-basic-0/70 p-4 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase text-fg-5">
                  {t(`units.${entry.key}`)} ({t(`unitShort.${entry.key}`)})
                </p>
                <p className="mt-2 text-lg font-semibold text-fg-1">
                  {numberFormatter.format(entry.value)}{' '}
                  <span className="text-xs font-medium text-fg-5">
                    {t(`unitShort.${entry.key}`)}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-fg-5">{t('result.empty')}</p>
        )}
        {results && <GoogleAd slotId="9185479703" className="w-full mt-4" />}
      </div>
    </div>
  );
}
