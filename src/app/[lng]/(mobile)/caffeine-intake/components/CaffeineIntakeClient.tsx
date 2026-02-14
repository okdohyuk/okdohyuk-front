'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Text } from '@components/basic/Text';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { cn } from '@utils/cn';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

const RECOMMENDED_LIMIT = 400;
const CAUTION_LIMIT = 200;

const DRINKS = [
  { key: 'espresso', mg: 75 },
  { key: 'americano', mg: 150 },
  { key: 'latte', mg: 95 },
  { key: 'coldBrew', mg: 200 },
  { key: 'blackTea', mg: 47 },
  { key: 'greenTea', mg: 30 },
  { key: 'energyDrink', mg: 80 },
  { key: 'cola', mg: 34 },
];

type CaffeineIntakeClientProps = {
  lng: Language;
};

const sanitizeNumber = (value: string) => value.replace(/[^0-9]/g, '');

const toNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export default function CaffeineIntakeClient({ lng }: CaffeineIntakeClientProps) {
  const { t } = useTranslation(lng, 'caffeine-intake');
  const [counts, setCounts] = useState<Record<string, string>>({});
  const [customMg, setCustomMg] = useState('');
  const [customCount, setCustomCount] = useState('');

  const total = useMemo(() => {
    const baseTotal = DRINKS.reduce((acc, drink) => {
      const count = toNumber(counts[drink.key] ?? '');
      return acc + drink.mg * count;
    }, 0);

    const customTotal = toNumber(customMg) * toNumber(customCount);
    return baseTotal + customTotal;
  }, [counts, customMg, customCount]);

  const americanoEquivalent = useMemo(() => {
    if (!total) return 0;
    return Math.round((total / 150) * 10) / 10;
  }, [total]);

  const status = useMemo(() => {
    if (total >= RECOMMENDED_LIMIT) return 'over';
    if (total >= CAUTION_LIMIT) return 'caution';
    return 'safe';
  }, [total]);

  const statusClasses = {
    over: 'border-red-200 bg-red-50 text-red-700 dark:border-red-700/50 dark:bg-red-900/30 dark:text-red-200',
    caution:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-700/40 dark:bg-amber-900/30 dark:text-amber-200',
    safe: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700/40 dark:bg-emerald-900/30 dark:text-emerald-200',
  } as const;

  const handleCountChange = (key: string, value: string) => {
    setCounts((prev) => ({
      ...prev,
      [key]: sanitizeNumber(value),
    }));
  };

  const handleReset = () => {
    setCounts({});
    setCustomMg('');
    setCustomCount('');
  };

  const handleExample = () => {
    setCounts({ espresso: '1', americano: '1', greenTea: '1' });
    setCustomMg('');
    setCustomCount('');
  };

  const handleCopy = async () => {
    const summary = t('result.copyText', {
      total: total.toLocaleString(),
      cups: americanoEquivalent,
    });
    await navigator.clipboard.writeText(summary);
  };

  const totalLabel = total.toLocaleString();

  return (
    <div className="space-y-4">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-1">
          <Text variant="d2" color="basic-4">
            {t('input.title')}
          </Text>
          <Text variant="c1" color="basic-5">
            {t('input.subtitle')}
          </Text>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {DRINKS.map((drink) => (
            <div key={drink.key} className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <Text variant="d2">{t(`drinks.${drink.key}.label`)}</Text>
                <Text variant="c1" color="basic-5">
                  {t('input.caffeinePerCup', { mg: drink.mg })}
                </Text>
              </div>
              <div className="flex w-24 items-center gap-2">
                <Input
                  inputMode="numeric"
                  placeholder="0"
                  value={counts[drink.key] ?? ''}
                  onChange={(e) => handleCountChange(drink.key, e.target.value)}
                  className="text-right"
                  aria-label={t('input.countAria', { name: t(`drinks.${drink.key}.label`) })}
                />
                <Text variant="c1" color="basic-5">
                  {t('input.cupUnit')}
                </Text>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-3 rounded-2xl border border-dashed border-zinc-200 p-3 dark:border-zinc-700">
          <div className="space-y-1">
            <Text variant="d2">{t('custom.title')}</Text>
            <Text variant="c1" color="basic-5">
              {t('custom.subtitle')}
            </Text>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex flex-1 items-center gap-2">
              <Input
                inputMode="numeric"
                placeholder={t('custom.mgPlaceholder')}
                value={customMg}
                onChange={(e) => setCustomMg(sanitizeNumber(e.target.value))}
                className="text-right"
                aria-label={t('custom.mgAria')}
              />
              <Text variant="c1" color="basic-5">
                mg
              </Text>
            </div>
            <div className="flex flex-1 items-center gap-2">
              <Input
                inputMode="numeric"
                placeholder={t('custom.countPlaceholder')}
                value={customCount}
                onChange={(e) => setCustomCount(sanitizeNumber(e.target.value))}
                className="text-right"
                aria-label={t('custom.countAria')}
              />
              <Text variant="c1" color="basic-5">
                {t('input.cupUnit')}
              </Text>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={handleExample} className="px-3 text-sm">
            {t('actions.example')}
          </Button>
          <Button
            type="button"
            onClick={handleReset}
            className="bg-zinc-200 px-3 text-sm text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-600"
          >
            {t('actions.reset')}
          </Button>
        </div>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <Text variant="d2">{t('result.title')}</Text>
          <Text variant="c1" color="basic-5">
            {t('result.description')}
          </Text>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <Text variant="t3">{t('result.total', { total: totalLabel })}</Text>
            <Text variant="c1" color="basic-5">
              {t('result.equivalent', { cups: americanoEquivalent })}
            </Text>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={handleCopy}
              disabled={total === 0}
              className="px-3 text-sm"
            >
              {t('actions.copy')}
            </Button>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 p-3 dark:border-zinc-700">
            <Text variant="d2">{t('limits.adult.title')}</Text>
            <Text variant="c1" color="basic-5">
              {t('limits.adult.value', { mg: RECOMMENDED_LIMIT })}
            </Text>
          </div>
          <div className="rounded-2xl border border-zinc-200 p-3 dark:border-zinc-700">
            <Text variant="d2">{t('limits.caution.title')}</Text>
            <Text variant="c1" color="basic-5">
              {t('limits.caution.value', { mg: CAUTION_LIMIT })}
            </Text>
          </div>
        </div>
        <div className={cn('rounded-2xl border p-3', statusClasses[status])}>
          <Text variant="d2">{t(`status.${status}.title`)}</Text>
          <Text variant="c1">{t(`status.${status}.description`)}</Text>
        </div>
      </section>
    </div>
  );
}
