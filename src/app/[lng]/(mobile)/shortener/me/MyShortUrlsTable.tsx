'use client';

import React from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@components/basic/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/basic/Table';
import { ShortUrlExpireUpdateRequestExpirePresetEnum } from '@api/ShortUrl';
import {
  useDeleteShortUrl,
  useMyShortUrls,
  useUpdateShortUrlExpiration,
} from '@queries/useShortUrlQueries';
import UserTokenUtil from '@utils/userTokenUtil';
import logger from '@utils/logger';
import { buildShortUrl } from '@libs/shared/agentDiscovery';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';

type MyShortUrlsTableProps = {
  lng: Language;
};

export default function MyShortUrlsTable({ lng }: MyShortUrlsTableProps) {
  const { t } = useTranslation(lng, 'shortener');

  const formatDateTime = (value: string | null | undefined) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString(lng);
  };
  // 클라이언트 사이드 토큰. SSR 단계에선 항상 null → enabled=false 로 idle 상태.
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  React.useEffect(() => {
    setAccessToken(UserTokenUtil.getAccessToken() || null);
  }, []);

  const { data, isLoading, isError } = useMyShortUrls(accessToken);
  const deleteMutation = useDeleteShortUrl();
  const extendMutation = useUpdateShortUrlExpiration();

  const isExpired = (value: string | null | undefined) => {
    if (!value) return false;
    const date = new Date(value);
    return !Number.isNaN(date.getTime()) && date.getTime() < Date.now();
  };

  const presetOptions = [
    {
      value: ShortUrlExpireUpdateRequestExpirePresetEnum.OneDay,
      label: t('form.expirePreset.options.oneDay'),
    },
    {
      value: ShortUrlExpireUpdateRequestExpirePresetEnum.SevenDays,
      label: t('form.expirePreset.options.sevenDays'),
    },
    {
      value: ShortUrlExpireUpdateRequestExpirePresetEnum.ThirtyDays,
      label: t('form.expirePreset.options.thirtyDays'),
    },
    {
      value: ShortUrlExpireUpdateRequestExpirePresetEnum.OneYear,
      label: t('form.expirePreset.options.oneYear'),
    },
    {
      value: ShortUrlExpireUpdateRequestExpirePresetEnum.Never,
      label: t('form.expirePreset.options.never'),
    },
  ];

  const handleExtend = (code: string, preset: string) => {
    extendMutation.mutate(
      {
        code,
        request: { expirePreset: preset as ShortUrlExpireUpdateRequestExpirePresetEnum },
      },
      {
        onError: (err) => {
          logger.error('단축 URL 만료 연장 실패', code, err);
          // eslint-disable-next-line no-alert
          window.alert(t('me.extendError'));
        },
      },
    );
  };

  const handleDelete = (code: string) => {
    // eslint-disable-next-line no-alert
    const confirmed = window.confirm(t('me.deleteConfirm', { code }));
    if (!confirmed) return;
    deleteMutation.mutate(code, {
      onError: (err) => {
        logger.error('단축 URL 삭제 실패', code, err);
        // eslint-disable-next-line no-alert
        window.alert(t('me.deleteError'));
      },
    });
  };

  if (isLoading || accessToken === null) {
    return (
      <div className="flex justify-center py-8 text-fg-4">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-md border border-basic-3 bg-basic-0 p-4 text-sm text-red-500">
        {t('me.error')}
      </p>
    );
  }

  const items = data ?? [];

  if (items.length === 0) {
    return (
      <p className="rounded-md border border-basic-3 bg-basic-0 p-4 text-sm text-fg-4">
        {t('me.empty')}
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('me.table.shortUrl')}</TableHead>
          <TableHead>{t('me.table.original')}</TableHead>
          <TableHead className="w-[80px] text-right">{t('me.table.hitCount')}</TableHead>
          <TableHead className="w-[160px]">{t('me.table.createdAt')}</TableHead>
          <TableHead className="w-[160px]">{t('me.table.expiresAt')}</TableHead>
          <TableHead className="w-[190px]">{t('me.table.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const isDeleting = deleteMutation.isPending && deleteMutation.variables === item.code;
          const isExtending =
            extendMutation.isPending && extendMutation.variables?.code === item.code;
          const expired = isExpired(item.expiresAt);
          // 백엔드 shortUrl 대신 NEXT_PUBLIC_URL 기반 절대 URL 로 표시한다.
          const displayShortUrl = buildShortUrl(item.code);
          return (
            <TableRow key={item.code}>
              <TableCell className="font-mono text-xs">
                <a
                  href={displayShortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-point-fg underline-offset-2 hover:underline break-all"
                >
                  {displayShortUrl}
                </a>
              </TableCell>
              <TableCell className="break-all text-xs text-fg-3">{item.originalUrl}</TableCell>
              <TableCell className="text-right tabular-nums">{item.hitCount}</TableCell>
              <TableCell className="text-xs text-fg-4">{formatDateTime(item.createdAt)}</TableCell>
              <TableCell className="text-xs text-fg-4">
                {expired ? (
                  <span className="font-semibold text-red-500">
                    {t('me.expired')} · {formatDateTime(item.expiresAt)}
                  </span>
                ) : (
                  (item.expiresAt && formatDateTime(item.expiresAt)) || t('result.expiresNever')
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <Select
                    key={item.expiresAt ?? 'never'}
                    onValueChange={(preset) => handleExtend(item.code, preset)}
                    disabled={isExtending}
                  >
                    <SelectTrigger
                      className="h-[28px] w-[92px] bg-basic-0/90 px-2 text-xs font-semibold"
                      aria-label={`${t('me.extendButton')} ${item.code}`}
                    >
                      {isExtending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <SelectValue placeholder={t('me.extendButton')} />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {presetOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    onClick={() => handleDelete(item.code)}
                    disabled={isDeleting}
                    analyticsKey="shortener_delete"
                    className="min-h-[28px] bg-red-500 px-2 text-xs hover:bg-red-600"
                    aria-label={`${t('me.deleteButton')} ${item.code}`}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
