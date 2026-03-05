'use client';

import React, { useMemo, useState } from 'react';
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

interface AirPurifierCoverageClientProps {
  lng: Language;
}

const toNumber = (value: string) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

export default function AirPurifierCoverageClient({ lng }: AirPurifierCoverageClientProps) {
  const { t } = useTranslation(lng, 'air-purifier-coverage');
  const [area, setArea] = useState('');
  const [height, setHeight] = useState('');
  const [ach, setAch] = useState('5');
  const [cadr, setCadr] = useState('');

  const formatter = useMemo(() => {
    return new Intl.NumberFormat(localeMap[lng], {
      maximumFractionDigits: 1,
    });
  }, [lng]);

  const result = useMemo(() => {
    const areaValue = toNumber(area);
    const heightValue = toNumber(height);
    const achValue = toNumber(ach);
    const cadrValue = toNumber(cadr);

    const volume = areaValue !== null && heightValue !== null ? areaValue * heightValue : null;

    const requiredCadr = volume !== null && achValue !== null ? volume * achValue : null;

    const maxArea =
      cadrValue !== null && heightValue !== null && achValue !== null && heightValue > 0
        ? cadrValue / (heightValue * achValue)
        : null;

    return { volume, requiredCadr, maxArea };
  }, [area, height, ach, cadr]);

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="air-area-input"
              className="text-sm font-semibold text-zinc-800 dark:text-zinc-100"
            >
              {t('input.area')}
            </label>
            <Input
              id="air-area-input"
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
              htmlFor="air-height-input"
              className="text-sm font-semibold text-zinc-800 dark:text-zinc-100"
            >
              {t('input.height')}
            </label>
            <Input
              id="air-height-input"
              type="text"
              inputMode="decimal"
              className="font-mono"
              placeholder={t('placeholder.height')}
              value={height}
              onChange={(event) => setHeight(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="air-ach-input"
              className="text-sm font-semibold text-zinc-800 dark:text-zinc-100"
            >
              {t('input.ach')}
            </label>
            <Input
              id="air-ach-input"
              type="text"
              inputMode="decimal"
              className="font-mono"
              placeholder={t('placeholder.ach')}
              value={ach}
              onChange={(event) => setAch(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="air-cadr-input"
              className="text-sm font-semibold text-zinc-800 dark:text-zinc-100"
            >
              {t('input.cadr')}
            </label>
            <Input
              id="air-cadr-input"
              type="text"
              inputMode="decimal"
              className="font-mono"
              placeholder={t('placeholder.cadr')}
              value={cadr}
              onChange={(event) => setCadr(event.target.value)}
            />
          </div>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('helper')}</p>
        <div className="grid gap-2 text-xs text-zinc-500 dark:text-zinc-400 sm:grid-cols-2">
          <span>• {t('tips.ach')}</span>
          <span>• {t('tips.cadr')}</span>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {t('result.title')}
        </div>
        {result.volume !== null || result.requiredCadr !== null || result.maxArea !== null ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-200/70 bg-white/70 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/60">
              <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                {t('result.volume')}
              </p>
              <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {result.volume !== null ? formatter.format(result.volume) : '-'}
                <span className="ml-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  m³
                </span>
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200/70 bg-white/70 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/60">
              <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                {t('result.requiredCadr')}
              </p>
              <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {result.requiredCadr !== null ? formatter.format(result.requiredCadr) : '-'}
                <span className="ml-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  m³/h
                </span>
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200/70 bg-white/70 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/60">
              <p className="text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                {t('result.maxArea')}
              </p>
              <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {result.maxArea !== null ? formatter.format(result.maxArea) : '-'}
                <span className="ml-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  ㎡
                </span>
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t('result.none')}</p>
        )}
      </div>
    </div>
  );
}
