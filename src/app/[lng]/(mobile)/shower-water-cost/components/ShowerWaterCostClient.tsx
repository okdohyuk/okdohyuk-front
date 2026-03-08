'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import { cn } from '@utils/cn';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

const localeMap: Record<Language, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
  zh: 'zh-CN',
};

interface ShowerWaterCostClientProps {
  lng: Language;
}

const toNumber = (value: string) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const resultVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function ShowerWaterCostClient({ lng }: ShowerWaterCostClientProps) {
  const { t } = useTranslation(lng, 'shower-water-cost');
  const [flowRate, setFlowRate] = useState('9');
  const [duration, setDuration] = useState('10');
  const [price, setPrice] = useState('1200');

  const formatter = useMemo(() => {
    return new Intl.NumberFormat(localeMap[lng], {
      maximumFractionDigits: 2,
    });
  }, [lng]);

  const result = useMemo(() => {
    const flowValue = toNumber(flowRate);
    const durationValue = toNumber(duration);
    const priceValue = toNumber(price);

    if (flowValue === null || durationValue === null || priceValue === null) {
      return null;
    }

    if (flowValue <= 0 || durationValue <= 0 || priceValue < 0) {
      return null;
    }

    const liters = flowValue * durationValue;
    const cubicMeters = liters / 1000;
    const cost = cubicMeters * priceValue;

    return {
      liters,
      cubicMeters,
      cost,
    };
  }, [flowRate, duration, price]);

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <label
              htmlFor="shower-flow-input"
              className="text-sm font-semibold text-zinc-800 dark:text-zinc-100"
            >
              {t('input.flowRate')}
            </label>
            <Input
              id="shower-flow-input"
              type="text"
              inputMode="decimal"
              className="font-mono"
              placeholder={t('placeholder.flowRate')}
              value={flowRate}
              onChange={(event) => setFlowRate(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="shower-duration-input"
              className="text-sm font-semibold text-zinc-800 dark:text-zinc-100"
            >
              {t('input.duration')}
            </label>
            <Input
              id="shower-duration-input"
              type="text"
              inputMode="decimal"
              className="font-mono"
              placeholder={t('placeholder.duration')}
              value={duration}
              onChange={(event) => setDuration(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="shower-price-input"
              className="text-sm font-semibold text-zinc-800 dark:text-zinc-100"
            >
              {t('input.price')}
            </label>
            <Input
              id="shower-price-input"
              type="text"
              inputMode="decimal"
              className="font-mono"
              placeholder={t('placeholder.price')}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </div>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('helper')}</p>
        <div className="grid gap-2 text-xs text-zinc-500 dark:text-zinc-400 sm:grid-cols-2">
          <span>• {t('tips.flow')}</span>
          <span>• {t('tips.price')}</span>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {t('result.title')}
        </div>
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="result"
              className="grid gap-3 sm:grid-cols-3"
              variants={resultVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <motion.div
                className="rounded-xl border border-zinc-200/70 bg-white/70 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/60"
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                  {t('result.liters')}
                </p>
                <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatter.format(result.liters)}
                  <span className="ml-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    L
                  </span>
                </p>
              </motion.div>
              <motion.div
                className="rounded-xl border border-zinc-200/70 bg-white/70 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/60"
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                  {t('result.cubicMeters')}
                </p>
                <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatter.format(result.cubicMeters)}
                  <span className="ml-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    m³
                  </span>
                </p>
              </motion.div>
              <motion.div
                className="rounded-xl border border-zinc-200/70 bg-white/70 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/60"
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                  {t('result.cost')}
                </p>
                <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatter.format(result.cost)}
                  <span className="ml-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {t('unit.currency')}
                  </span>
                </p>
              </motion.div>
            </motion.div>
          ) : (
            <motion.p
              key="empty"
              className="text-sm text-zinc-500 dark:text-zinc-400"
              variants={resultVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
            >
              {t('result.none')}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
