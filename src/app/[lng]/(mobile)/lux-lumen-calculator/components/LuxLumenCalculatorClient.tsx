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

interface LuxLumenCalculatorClientProps {
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

export default function LuxLumenCalculatorClient({ lng }: LuxLumenCalculatorClientProps) {
  const { t } = useTranslation(lng, 'lux-lumen-calculator');
  const [area, setArea] = useState('12');
  const [targetLux, setTargetLux] = useState('300');
  const [lumens, setLumens] = useState('');

  const formatter = useMemo(() => {
    return new Intl.NumberFormat(localeMap[lng], {
      maximumFractionDigits: 1,
    });
  }, [lng]);

  const result = useMemo(() => {
    const areaValue = toNumber(area);
    const targetLuxValue = toNumber(targetLux);
    const lumensValue = toNumber(lumens);

    if (areaValue === null || targetLuxValue === null) {
      return null;
    }

    if (areaValue <= 0 || targetLuxValue <= 0) {
      return null;
    }

    const requiredLumens = areaValue * targetLuxValue;
    const achievedLux = lumensValue !== null && lumensValue > 0 ? lumensValue / areaValue : null;
    const coverageArea =
      lumensValue !== null && lumensValue > 0 ? lumensValue / targetLuxValue : null;

    return {
      requiredLumens,
      achievedLux,
      coverageArea,
    };
  }, [area, targetLux, lumens]);

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <label
              htmlFor="lux-area-input"
              className="text-sm font-semibold text-zinc-800 dark:text-zinc-100"
            >
              {t('input.area')}
            </label>
            <Input
              id="lux-area-input"
              type="text"
              inputMode="decimal"
              className="font-mono"
              placeholder={t('placeholder.area')}
              value={area}
              onChange={(event) => setArea(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="lux-target-input"
              className="text-sm font-semibold text-zinc-800 dark:text-zinc-100"
            >
              {t('input.targetLux')}
            </label>
            <Input
              id="lux-target-input"
              type="text"
              inputMode="decimal"
              className="font-mono"
              placeholder={t('placeholder.targetLux')}
              value={targetLux}
              onChange={(event) => setTargetLux(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="lux-lumens-input"
              className="text-sm font-semibold text-zinc-800 dark:text-zinc-100"
            >
              {t('input.lumens')}
            </label>
            <Input
              id="lux-lumens-input"
              type="text"
              inputMode="decimal"
              className="font-mono"
              placeholder={t('placeholder.lumens')}
              value={lumens}
              onChange={(event) => setLumens(event.target.value)}
            />
          </div>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('helper')}</p>
        <div className="grid gap-2 text-xs text-zinc-500 dark:text-zinc-400 sm:grid-cols-2">
          <span>• {t('tips.target')}</span>
          <span>• {t('tips.lumens')}</span>
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
                  {t('result.requiredLumens')}
                </p>
                <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatter.format(result.requiredLumens)}
                  <span className="ml-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    lm
                  </span>
                </p>
              </motion.div>
              <motion.div
                className="rounded-xl border border-zinc-200/70 bg-white/70 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/60"
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                  {t('result.achievedLux')}
                </p>
                <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {result.achievedLux !== null ? formatter.format(result.achievedLux) : '-'}
                  <span className="ml-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    lx
                  </span>
                </p>
              </motion.div>
              <motion.div
                className="rounded-xl border border-zinc-200/70 bg-white/70 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/60"
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                  {t('result.coverage')}
                </p>
                <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {result.coverageArea !== null ? formatter.format(result.coverageArea) : '-'}
                  <span className="ml-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    ㎡
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
