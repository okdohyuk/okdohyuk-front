'use client';

import React from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@components/basic/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/basic/Table';
import { useDeleteShortUrl, useMyShortUrls } from '@queries/useShortUrlQueries';
import UserTokenUtil from '@utils/userTokenUtil';
import logger from '@utils/logger';
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
          <TableHead className="w-[80px]">{t('me.table.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const isDeleting = deleteMutation.isPending && deleteMutation.variables === item.code;
          return (
            <TableRow key={item.code}>
              <TableCell className="font-mono text-xs">
                <a
                  href={item.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-point-fg underline-offset-2 hover:underline break-all"
                >
                  {item.shortUrl}
                </a>
              </TableCell>
              <TableCell className="break-all text-xs text-fg-3">{item.originalUrl}</TableCell>
              <TableCell className="text-right tabular-nums">{item.hitCount}</TableCell>
              <TableCell className="text-xs text-fg-4">{formatDateTime(item.createdAt)}</TableCell>
              <TableCell className="text-xs text-fg-4">
                {item.expiresAt ? formatDateTime(item.expiresAt) : t('result.expiresNever')}
              </TableCell>
              <TableCell>
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
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
