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
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import logger from '@utils/logger';

// 만료 프리셋 5종 — 백엔드 enum 과 1:1 매핑된다.
const EXPIRE_PRESET_OPTIONS: ReadonlyArray<{
  value: ShortUrlCreateRequestExpirePresetEnum;
  label: string;
}> = [
  { value: ShortUrlCreateRequestExpirePresetEnum.OneDay, label: '1일' },
  { value: ShortUrlCreateRequestExpirePresetEnum.SevenDays, label: '7일' },
  { value: ShortUrlCreateRequestExpirePresetEnum.ThirtyDays, label: '30일 (기본)' },
  { value: ShortUrlCreateRequestExpirePresetEnum.OneYear, label: '1년' },
  { value: ShortUrlCreateRequestExpirePresetEnum.Never, label: '무제한' },
];

const HTTP_URL_PATTERN = /^https?:\/\/.+/i;

function formatExpiresAt(expiresAt: string | null | undefined) {
  if (!expiresAt) return '무제한';
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return expiresAt;
  return date.toLocaleString();
}

export default function ShortenerForm() {
  const [originalUrl, setOriginalUrl] = React.useState('');
  const [expirePreset, setExpirePreset] = React.useState<ShortUrlCreateRequestExpirePresetEnum>(
    ShortUrlCreateRequestExpirePresetEnum.ThirtyDays,
  );
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const createMutation = useCreateShortUrl();
  const result: ShortUrl | undefined = createMutation.data;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCopied(false);
    const trimmed = originalUrl.trim();
    if (!trimmed) {
      setValidationError('단축할 URL 을 입력해 주세요.');
      return;
    }
    if (!HTTP_URL_PATTERN.test(trimmed)) {
      setValidationError('http:// 또는 https:// 로 시작하는 URL 만 입력할 수 있어요.');
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
    if (!result?.shortUrl) return;
    try {
      await navigator.clipboard.writeText(result.shortUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      logger.error('단축 URL 클립보드 복사 실패', e);
    }
  };

  const isSubmitting = createMutation.isPending;
  const apiErrorMessage = createMutation.isError
    ? '단축 URL 생성에 실패했어요. 잠시 후 다시 시도해 주세요.'
    : null;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label htmlFor="shortener-original-url" className="text-sm font-semibold text-fg-1">
            원본 URL
          </label>
          <Input
            id="shortener-original-url"
            type="url"
            inputMode="url"
            placeholder="https://example.com/very/long/path"
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
            <p className="text-xs text-fg-5">
              http:// 또는 https:// 로 시작하는 전체 URL 을 입력해 주세요.
            </p>
          )}
        </div>

        <div className="space-y-2">
          {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
          <label htmlFor="shortener-expire-preset" className="text-sm font-semibold text-fg-1">
            사용 기간
          </label>
          <Select
            value={expirePreset}
            onValueChange={(v) => setExpirePreset(v as ShortUrlCreateRequestExpirePresetEnum)}
            disabled={isSubmitting}
          >
            <SelectTrigger id="shortener-expire-preset" aria-label="단축 URL 만료 기간 선택">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXPIRE_PRESET_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
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
                생성 중…
              </span>
            ) : (
              '단축하기'
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
        <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')} aria-label="단축 URL 결과">
          <div className="flex items-center gap-2 text-sm font-semibold text-fg-1">
            <LinkIcon className="h-4 w-4" />
            단축 URL 생성 완료
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <a
              href={result.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 break-all rounded-md border border-basic-3 bg-basic-0 px-3 py-2 text-sm text-point-fg underline-offset-2 hover:underline"
            >
              {result.shortUrl}
            </a>
            <Button
              type="button"
              onClick={handleCopy}
              analyticsKey="shortener_copy"
              className="sm:min-w-[96px]"
            >
              <span className="inline-flex items-center gap-1">
                <Copy className="h-4 w-4" />
                {copied ? '복사됨' : '복사'}
              </span>
            </Button>
          </div>

          <dl className="grid grid-cols-1 gap-2 text-sm text-fg-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-fg-5">코드</dt>
              <dd className="font-mono text-fg-1">{result.code}</dd>
            </div>
            <div>
              <dt className="text-xs text-fg-5">클릭 수</dt>
              <dd className="text-fg-1">{result.hitCount}</dd>
            </div>
            <div>
              <dt className="text-xs text-fg-5">만료</dt>
              <dd className="text-fg-1">{formatExpiresAt(result.expiresAt)}</dd>
            </div>
          </dl>

          <p className="text-xs text-fg-5 break-all">원본: {result.originalUrl}</p>
        </section>
      ) : null}
    </div>
  );
}
