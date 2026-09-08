'use client';

import React from 'react';
import { Copy, Link as LinkIcon, Loader2 } from 'lucide-react';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { useCreateShortUrl } from '@queries/useShortUrlQueries';
import { useShortUrlRewardedAd } from '@hooks/useShortUrlRewardedAd';
import type { ShortUrl, ShortUrlCreateRequest } from '@api/ShortUrl';
import { ShortUrlCreateRequestExpirePresetEnum } from '@api/ShortUrl';
import { cn } from '@utils/cn';
import { buildShortUrl } from '@libs/shared/agentDiscovery';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import logger from '@utils/logger';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';

type ExpirePresetLabelKey =
  | 'form.expirePreset.options.oneDay'
  | 'form.expirePreset.options.sevenDays'
  | 'form.expirePreset.options.thirtyDays'
  | 'form.expirePreset.options.oneYear'
  | 'form.expirePreset.options.never';

// 만료 프리셋 5종 — 백엔드 enum 과 1:1 매핑된다.
const EXPIRE_PRESET_OPTIONS: ReadonlyArray<{
  value: ShortUrlCreateRequestExpirePresetEnum;
  labelKey: ExpirePresetLabelKey;
}> = [
  {
    value: ShortUrlCreateRequestExpirePresetEnum.OneDay,
    labelKey: 'form.expirePreset.options.oneDay',
  },
  {
    value: ShortUrlCreateRequestExpirePresetEnum.SevenDays,
    labelKey: 'form.expirePreset.options.sevenDays',
  },
  {
    value: ShortUrlCreateRequestExpirePresetEnum.ThirtyDays,
    labelKey: 'form.expirePreset.options.thirtyDays',
  },
  {
    value: ShortUrlCreateRequestExpirePresetEnum.OneYear,
    labelKey: 'form.expirePreset.options.oneYear',
  },
  {
    value: ShortUrlCreateRequestExpirePresetEnum.Never,
    labelKey: 'form.expirePreset.options.never',
  },
];

const HTTP_URL_PATTERN = /^https?:\/\/.+/i;

type ShortenerFormProps = {
  lng: Language;
};

type PendingCreate = {
  payload: ShortUrlCreateRequest;
  key: string;
};

function getPayloadKey(payload: ShortUrlCreateRequest) {
  return `${payload.originalUrl}\n${payload.expirePreset ?? ''}`;
}

export default function ShortenerForm({ lng }: ShortenerFormProps) {
  const { t } = useTranslation(lng, 'shortener');
  const [originalUrl, setOriginalUrl] = React.useState('');
  const [expirePreset, setExpirePreset] = React.useState<ShortUrlCreateRequestExpirePresetEnum>(
    ShortUrlCreateRequestExpirePresetEnum.ThirtyDays,
  );
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [pendingCreate, setPendingCreate] = React.useState<PendingCreate | null>(null);
  const [earnedPayloadKey, setEarnedPayloadKey] = React.useState<string | null>(null);
  const rewardRequestKeyRef = React.useRef<string | null>(null);
  const submittedRewardKeyRef = React.useRef<string | null>(null);
  const createMutation = useCreateShortUrl();
  const rewardedAd = useShortUrlRewardedAd();
  const result: ShortUrl | undefined = createMutation.data;
  // 표시·복사용 단축 URL 은 백엔드 shortUrl 대신 NEXT_PUBLIC_URL 기반으로 직접 구성한다.
  const displayShortUrl = result ? buildShortUrl(result.code) : '';
  const isSubmitting = createMutation.isPending;
  const isRewardFlowActive =
    rewardedAd.enabled &&
    Boolean(pendingCreate) &&
    (rewardedAd.status === 'loading' ||
      rewardedAd.status === 'ready' ||
      rewardedAd.status === 'showing');
  const isFormDisabled = isSubmitting || isRewardFlowActive;
  const currentPayloadKey = getPayloadKey({
    originalUrl: originalUrl.trim(),
    expirePreset,
  });
  const shouldRequestRewardForCurrentPayload =
    rewardedAd.enabled && earnedPayloadKey !== currentPayloadKey;

  const formatExpiresAt = (expiresAt: string | null | undefined) => {
    if (!expiresAt) return t('result.expiresNever');
    const date = new Date(expiresAt);
    if (Number.isNaN(date.getTime())) return expiresAt;
    return date.toLocaleString(lng);
  };

  const createShortUrl = React.useCallback(
    (payload: ShortUrlCreateRequest, rewardedPayloadKey?: string) => {
      if (!rewardedPayloadKey) {
        createMutation.mutate(payload);
        return;
      }

      createMutation.mutate(payload, {
        onSuccess: () => {
          setEarnedPayloadKey((current) => (current === rewardedPayloadKey ? null : current));
          rewardRequestKeyRef.current = null;
          submittedRewardKeyRef.current = null;
          rewardedAd.reset();
        },
      });
    },
    [createMutation, rewardedAd],
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || isRewardFlowActive || pendingCreate) return;

    setCopied(false);
    const trimmed = originalUrl.trim();
    if (!trimmed) {
      setValidationError(t('form.originalUrl.errorRequired'));
      return;
    }
    if (!HTTP_URL_PATTERN.test(trimmed)) {
      setValidationError(t('form.originalUrl.errorInvalid'));
      return;
    }

    setValidationError(null);
    const payload: ShortUrlCreateRequest = {
      originalUrl: trimmed,
      expirePreset,
    };
    const payloadKey = getPayloadKey(payload);

    if (rewardedAd.enabled && earnedPayloadKey !== payloadKey) {
      if (rewardRequestKeyRef.current === payloadKey) return;
      rewardRequestKeyRef.current = payloadKey;
      setPendingCreate({ payload, key: payloadKey });
      submittedRewardKeyRef.current = null;
      rewardedAd.reset();
      rewardedAd.prepare();
      return;
    }

    createShortUrl(payload, rewardedAd.enabled ? payloadKey : undefined);
  };

  const handleCancelReward = () => {
    setPendingCreate(null);
    rewardRequestKeyRef.current = null;
    submittedRewardKeyRef.current = null;
    rewardedAd.reset();
  };

  React.useEffect(() => {
    if (!pendingCreate || rewardedAd.status !== 'granted') return;
    if (submittedRewardKeyRef.current === pendingCreate.key) return;

    submittedRewardKeyRef.current = pendingCreate.key;
    setEarnedPayloadKey(pendingCreate.key);
    createShortUrl(pendingCreate.payload, pendingCreate.key);
    setPendingCreate(null);
  }, [createShortUrl, pendingCreate, rewardedAd.status]);

  React.useEffect(() => {
    if (!pendingCreate) return;
    if (rewardedAd.status !== 'cancelled' && rewardedAd.status !== 'unavailable') return;
    setPendingCreate(null);
    rewardRequestKeyRef.current = null;
    submittedRewardKeyRef.current = null;
  }, [pendingCreate, rewardedAd.status]);

  const handleCopy = async () => {
    if (!displayShortUrl) return;
    try {
      await navigator.clipboard.writeText(displayShortUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      logger.error('단축 URL 클립보드 복사 실패', e);
    }
  };

  const apiErrorMessage = createMutation.isError ? t('form.apiError') : null;
  const shouldShowRewardPanel =
    rewardedAd.enabled &&
    (Boolean(pendingCreate) ||
      rewardedAd.status === 'cancelled' ||
      rewardedAd.status === 'unavailable');
  const canCancelReward =
    Boolean(pendingCreate) && (rewardedAd.status === 'loading' || rewardedAd.status === 'ready');

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <label htmlFor="shortener-original-url" className="text-sm font-semibold text-fg-1">
            {t('form.originalUrl.label')}
          </label>
          <Input
            id="shortener-original-url"
            type="url"
            inputMode="url"
            placeholder={t('form.originalUrl.placeholder')}
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            disabled={isFormDisabled}
            aria-invalid={!!validationError}
          />
          {validationError ? (
            <p className="text-xs text-red-500" role="alert">
              {validationError}
            </p>
          ) : (
            <p className="text-xs text-fg-5">{t('form.originalUrl.helper')}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="shortener-expire-preset" className="text-sm font-semibold text-fg-1">
            {t('form.expirePreset.label')}
          </label>
          <Select
            value={expirePreset}
            onValueChange={(v) => setExpirePreset(v as ShortUrlCreateRequestExpirePresetEnum)}
            disabled={isFormDisabled}
          >
            <SelectTrigger
              id="shortener-expire-preset"
              aria-label={t('form.expirePreset.ariaLabel')}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXPIRE_PRESET_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {String(t(option.labelKey))}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isFormDisabled}
            analyticsKey="shortener_submit"
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('form.submitting')}
              </span>
            ) : (
              t(shouldRequestRewardForCurrentPayload ? 'form.rewardedAd.submit' : 'form.submit')
            )}
          </Button>
        </div>

        {apiErrorMessage ? (
          <p className="text-sm text-red-500" role="alert">
            {apiErrorMessage}
          </p>
        ) : null}

        {shouldShowRewardPanel ? (
          <section
            className="rounded-md border border-basic-3 bg-basic-0 p-3 text-sm text-fg-3"
            role="status"
            aria-live="polite"
          >
            <p>{t(`form.rewardedAd.status.${rewardedAd.status}`)}</p>
            <p className="mt-1 text-xs text-fg-5">{t('form.rewardedAd.helper')}</p>
            {rewardedAd.status === 'ready' ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={rewardedAd.show}
                  analyticsKey="shortener_rewarded_ad_show"
                >
                  {t('form.rewardedAd.watch')}
                </Button>
              </div>
            ) : null}
            {rewardedAd.status === 'loading' ? (
              <div className="mt-3 inline-flex items-center gap-2 text-xs text-fg-5">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('form.rewardedAd.loading')}
              </div>
            ) : null}
            {canCancelReward ? (
              <Button
                type="button"
                className="mt-3 border border-basic-3 bg-basic-1 text-fg-2 hover:bg-basic-2"
                onClick={handleCancelReward}
                analyticsKey="shortener_rewarded_ad_cancel"
              >
                {t('form.rewardedAd.cancel')}
              </Button>
            ) : null}
          </section>
        ) : null}
      </form>

      {result ? (
        <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')} aria-label={t('result.title')}>
          <div className="flex items-center gap-2 text-sm font-semibold text-fg-1">
            <LinkIcon className="h-4 w-4" />
            {t('result.title')}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <a
              href={displayShortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 break-all rounded-md border border-basic-3 bg-basic-0 px-3 py-2 text-sm text-point-fg underline-offset-2 hover:underline"
            >
              {displayShortUrl}
            </a>
            <Button
              type="button"
              onClick={handleCopy}
              analyticsKey="shortener_copy"
              className="sm:min-w-[96px]"
            >
              <span className="inline-flex items-center gap-1">
                <Copy className="h-4 w-4" />
                {copied ? t('result.copied') : t('result.copy')}
              </span>
            </Button>
          </div>

          <dl className="grid grid-cols-1 gap-2 text-sm text-fg-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-fg-5">{t('result.code')}</dt>
              <dd className="font-mono text-fg-1">{result.code}</dd>
            </div>
            <div>
              <dt className="text-xs text-fg-5">{t('result.hitCount')}</dt>
              <dd className="text-fg-1">{result.hitCount}</dd>
            </div>
            <div>
              <dt className="text-xs text-fg-5">{t('result.expires')}</dt>
              <dd className="text-fg-1">{formatExpiresAt(result.expiresAt)}</dd>
            </div>
          </dl>

          <p className="text-xs text-fg-5 break-all">
            {t('result.original')}: {result.originalUrl}
          </p>
        </section>
      ) : null}
    </div>
  );
}
