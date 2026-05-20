'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import GoogleAd from '@components/google/GoogleAd';
import { useToolTracking } from '@hooks/analytics/useToolTracking';
import {
  calculateKPassRefund,
  KPassRegion,
  KPassTier,
  KPASS_CAP_NATIONAL,
  KPASS_MIN_USES,
} from '../utils/refund';

const TIER_OPTIONS: KPassTier[] = ['general', 'youth', 'lowIncome'];
const REGION_OPTIONS: KPassRegion[] = ['national', 'gyeonggi', 'incheon'];
const FAQ_KEYS = ['refundTiming', 'youthAge', 'over60', 'eligibleTransport', 'altMileage'] as const;

const numberOrZero = (value: string) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatKRW = (value: number) => Math.max(0, Math.round(value)).toLocaleString('ko-KR');

type KPassClientProps = {
  lng: Language;
};

export default function KPassClient({ lng }: KPassClientProps) {
  const { t } = useTranslation(lng, 'k-pass');
  const { trackInputStarted, trackUse } = useToolTracking('k-pass', 'calculator');
  const [monthlyFare, setMonthlyFare] = useState('');
  const [monthlyUses, setMonthlyUses] = useState('');
  const [tier, setTier] = useState<KPassTier>('general');
  const [region, setRegion] = useState<KPassRegion>('national');
  const lastTrackedKeyRef = useRef<string | null>(null);

  const result = useMemo(
    () =>
      calculateKPassRefund({
        monthlyFare: numberOrZero(monthlyFare),
        monthlyUses: numberOrZero(monthlyUses),
        tier,
        region,
      }),
    [monthlyFare, monthlyUses, tier, region],
  );

  useEffect(() => {
    if (monthlyFare && monthlyUses && result.monthlyRefund > 0) {
      const key = `${monthlyFare}|${monthlyUses}|${tier}|${region}`;
      if (lastTrackedKeyRef.current !== key) {
        lastTrackedKeyRef.current = key;
        trackUse({
          action_type: 'calculate',
          success: true,
          monthly_refund: result.monthlyRefund,
          tier,
          region,
        });
      }
    }
  }, [monthlyFare, monthlyUses, tier, region, result.monthlyRefund, trackUse]);

  const reset = () => {
    setMonthlyFare('');
    setMonthlyUses('');
    setTier('general');
    setRegion('national');
  };

  const hasInput = monthlyFare !== '' && monthlyUses !== '';
  const showBelow15Notice = hasInput && !result.eligible;
  const showCapNotice = hasInput && result.capped;

  const toggleButtonClass = (active: boolean) =>
    active
      ? 'px-3 py-2 text-sm font-semibold ring-2 ring-fg-2 bg-basic-2 text-fg-1'
      : 'px-3 py-2 text-sm font-semibold bg-basic-2 text-fg-5';

  return (
    <div className="space-y-4">
      {/* 입력 폼 */}
      <section className={`${SERVICE_PANEL_SOFT} space-y-4 p-4`}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <span className="text-sm font-semibold text-fg-3">{t('form.fare')}</span>
            <Input
              type="number"
              min={0}
              step="1000"
              inputMode="numeric"
              placeholder={t('form.farePlaceholder')}
              value={monthlyFare}
              onChange={(event) => {
                trackInputStarted();
                setMonthlyFare(event.target.value);
              }}
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm font-semibold text-fg-3">{t('form.uses')}</span>
            <Input
              type="number"
              min={0}
              max={200}
              step="1"
              inputMode="numeric"
              placeholder={t('form.usesPlaceholder')}
              value={monthlyUses}
              onChange={(event) => {
                trackInputStarted();
                setMonthlyUses(event.target.value);
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-semibold text-fg-3">{t('form.tier')}</span>
          <div className="flex flex-wrap gap-2">
            {TIER_OPTIONS.map((option) => (
              <Button
                key={option}
                type="button"
                onClick={() => setTier(option)}
                className={toggleButtonClass(tier === option)}
              >
                {t(`tier.${option}`)}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-semibold text-fg-3">{t('form.region')}</span>
          <div className="flex flex-wrap gap-2">
            {REGION_OPTIONS.map((option) => (
              <Button
                key={option}
                type="button"
                onClick={() => setRegion(option)}
                className={toggleButtonClass(region === option)}
              >
                {t(`region.${option}`)}
              </Button>
            ))}
          </div>
          <p className="text-xs text-fg-5">{t('form.regionHint')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={reset} className="px-4 bg-basic-2 text-fg-3">
            {t('reset')}
          </Button>
        </div>
      </section>

      {/* 조건 미충족 안내 */}
      {showBelow15Notice && (
        <section className={`${SERVICE_PANEL_SOFT} p-4 text-sm text-fg-3`}>
          {t('notice.below15', { min: KPASS_MIN_USES })}
        </section>
      )}

      {/* 결과 */}
      <section className={`${SERVICE_PANEL_SOFT} space-y-3 p-4`}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-fg-3">{t('result.farePerRide')}</p>
            <p className="text-lg font-semibold text-fg-2">
              {t('currency', { value: formatKRW(result.farePerRide) })}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-fg-3">{t('result.perRide')}</p>
            <p className="text-lg font-semibold text-fg-2">
              {t('currency', { value: formatKRW(result.refundPerRide) })}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-fg-3">{t('result.monthly')}</p>
            <p className="text-2xl font-bold text-fg-1">
              {t('currency', { value: formatKRW(result.monthlyRefund) })}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-fg-3">{t('result.annual')}</p>
            <p className="text-2xl font-bold text-fg-1">
              {t('currency', { value: formatKRW(result.annualSaving) })}
            </p>
          </div>
        </div>

        {tier !== 'general' && hasInput && result.eligible && (
          <div className="border-t border-basic-3 pt-3 text-sm text-fg-3">
            {t('result.vsGeneral')}:{' '}
            <span className="font-semibold text-fg-1">
              +{t('currency', { value: formatKRW(result.vsGeneral) })}
            </span>
          </div>
        )}

        {showCapNotice && (
          <p className="text-xs text-fg-5">
            {t('notice.capped', { cap: KPASS_CAP_NATIONAL, effective: result.effectiveUses })}
          </p>
        )}
      </section>

      {hasInput && <GoogleAd slotId="7911066601" className="w-full mt-4" />}

      {/* 제도 요약 (SEO 본문) */}
      <section className={`${SERVICE_PANEL_SOFT} space-y-2 p-4`}>
        <h2 className="text-base font-bold text-fg-1">{t('about.title')}</h2>
        <p className="text-sm leading-6 text-fg-3 whitespace-pre-line">{t('about.body')}</p>
      </section>

      {/* 비교 표 */}
      <section className={`${SERVICE_PANEL_SOFT} space-y-3 p-4`}>
        <h2 className="text-base font-bold text-fg-1">{t('compare.title')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-fg-3">
                <th className="py-2 pr-3 font-semibold">{t('compare.col.item')}</th>
                <th className="py-2 pr-3 font-semibold">{t('compare.col.kpass')}</th>
                <th className="py-2 pr-3 font-semibold">{t('compare.col.alt')}</th>
                <th className="py-2 pr-3 font-semibold">{t('compare.col.climate')}</th>
              </tr>
            </thead>
            <tbody className="text-fg-2">
              {(['basis', 'minUses', 'maxBenefit', 'region', 'youthRate'] as const).map((row) => (
                <tr key={row} className="border-t border-basic-3">
                  <td className="py-2 pr-3 font-medium">{t(`compare.row.${row}.item`)}</td>
                  <td className="py-2 pr-3">{t(`compare.row.${row}.kpass`)}</td>
                  <td className="py-2 pr-3">{t(`compare.row.${row}.alt`)}</td>
                  <td className="py-2 pr-3">{t(`compare.row.${row}.climate`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className={`${SERVICE_PANEL_SOFT} space-y-2 p-4`}>
        <h2 className="text-base font-bold text-fg-1">{t('faq.title')}</h2>
        <div className="space-y-2">
          {FAQ_KEYS.map((key) => (
            <details key={key} className="group rounded-md bg-basic-2 p-3">
              <summary className="cursor-pointer text-sm font-semibold text-fg-2">
                {t(`faq.${key}.q`)}
              </summary>
              <p className="mt-2 text-sm leading-6 text-fg-3 whitespace-pre-line">
                {t(`faq.${key}.a`)}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
