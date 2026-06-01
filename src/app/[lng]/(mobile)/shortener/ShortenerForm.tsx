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

export default function ShortenerForm({ lng }: ShortenerFormProps) {
  const { t } = useTranslation(lng, 'shortener');
  const [originalUrl, setOriginalUrl] = React.useState('');
  const [expirePreset, setExpirePreset] = React.useState<ShortUrlCreateRequestExpirePresetEnum>(
    ShortUrlCreateRequestExpirePresetEnum.ThirtyDays,
  );
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const createMutation = useCreateShortUrl();
  const result: ShortUrl | undefined = createMutation.data;
  // 표시·복사용 단축 URL 은 백엔드 shortUrl 대신 NEXT_PUBLIC_URL 기반으로 직접 구성한다.
  const displayShortUrl = result ? buildShortUrl(result.code) : '';

  const formatExpiresAt = (expiresAt: string | null | undefined) => {
    if (!expiresAt) return t('result.expiresNever');
    const date = new Date(expiresAt);
    if (Number.isNaN(date.getTime())) return expiresAt;
    return date.toLocaleString(lng);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
    createMutation.mutate(payload);
  };

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

  const isSubmitting = createMutation.isPending;
  const apiErrorMessage = createMutation.isError ? t('form.apiError') : null;

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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
            analyticsKey="shortener_submit"
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('form.submitting')}
              </span>
            ) : (
              t('form.submit')
            )}
          </Button>
        </div>

        {apiErrorMessage ? (
          <p className="text-sm text-red-500" role="alert">
            {apiErrorMessage}
          </p>
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
