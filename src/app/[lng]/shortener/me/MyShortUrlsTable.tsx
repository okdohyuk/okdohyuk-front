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

function formatDateTime(value: string | null | undefined) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function MyShortUrlsTable() {
  // 클라이언트 사이드 토큰. SSR 단계에선 항상 null → enabled=false 로 idle 상태.
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  React.useEffect(() => {
    setAccessToken(UserTokenUtil.getAccessToken() || null);
  }, []);

  const { data, isLoading, isError } = useMyShortUrls(accessToken);
  const deleteMutation = useDeleteShortUrl();

  const handleDelete = (code: string) => {
    // eslint-disable-next-line no-alert
    const confirmed = window.confirm(`정말로 ${code} 단축 URL 을 삭제할까요?`);
    if (!confirmed) return;
    deleteMutation.mutate(code, {
      onError: (err) => {
        logger.error('단축 URL 삭제 실패', code, err);
        // eslint-disable-next-line no-alert
        window.alert('단축 URL 삭제에 실패했어요. 잠시 후 다시 시도해 주세요.');
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
        목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
      </p>
    );
  }

  const items = data ?? [];

  if (items.length === 0) {
    return (
      <p className="rounded-md border border-basic-3 bg-basic-0 p-4 text-sm text-fg-4">
        아직 만든 단축 URL 이 없어요.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>단축 URL</TableHead>
          <TableHead>원본</TableHead>
          <TableHead className="w-[80px] text-right">클릭 수</TableHead>
          <TableHead className="w-[160px]">생성일</TableHead>
          <TableHead className="w-[160px]">만료일</TableHead>
          <TableHead className="w-[80px]">관리</TableHead>
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
                {item.expiresAt ? formatDateTime(item.expiresAt) : '무제한'}
              </TableCell>
              <TableCell>
                <Button
                  type="button"
                  onClick={() => handleDelete(item.code)}
                  disabled={isDeleting}
                  analyticsKey="shortener_delete"
                  className="min-h-[28px] bg-red-500 px-2 text-xs hover:bg-red-600"
                  aria-label={`${item.code} 삭제`}
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
