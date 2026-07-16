'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiKeyApi } from '@api';
import { ApiKey, ApiKeyIssueResponse } from '@api/ApiKey';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import ServiceInfoNotice from '@components/complex/Service/ServiceInfoNotice';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/basic/Table';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import { cn } from '@utils/cn';
import UserTokenUtil from '@utils/userTokenUtil';
import { getErrorMessage } from '@utils/errorHandler';
import { Check, Copy, KeyRound, Plus, RefreshCcw, ShieldAlert, Trash2 } from 'lucide-react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';

// useQuery / invalidateQueries 사이에서 키를 공유해 캐시 무효화 일관성을 보장한다.
const API_KEY_QUERY_KEY = ['admin', 'api-key'] as const;

type ApiKeyManagePageImplProps = {
  lng: Language;
};

const formatDateTime = (value?: string | null): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};

function ApiKeyManagePageImpl({ lng }: ApiKeyManagePageImplProps) {
  const { t } = useTranslation(lng, 'common');
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [issued, setIssued] = useState<ApiKeyIssueResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    data: apiKeys,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: API_KEY_QUERY_KEY,
    queryFn: async () => {
      const token = await UserTokenUtil.getAccessToken();
      const res = await apiKeyApi.getApiKey(`Bearer ${token}`);
      return res.data;
    },
  });

  const { mutate: issueKey, isPending: isIssuing } = useMutation({
    mutationFn: async (keyName: string) => {
      const token = await UserTokenUtil.getAccessToken();
      const res = await apiKeyApi.postApiKey(`Bearer ${token}`, { name: keyName });
      return res.data;
    },
    onSuccess: (data) => {
      // 평문 key 는 이 응답에서만 1회 노출되므로 모달로 즉시 보여준다.
      setIssued(data);
      setCopied(false);
      setName('');
    },
    onError: (error) => {
      // eslint-disable-next-line no-alert
      alert(getErrorMessage(error, t));
    },
  });

  const { mutate: revokeKey, isPending: isRevoking } = useMutation({
    mutationFn: async (id: string) => {
      const token = await UserTokenUtil.getAccessToken();
      await apiKeyApi.deleteApiKeyId(id, `Bearer ${token}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: API_KEY_QUERY_KEY });
    },
    onError: (error) => {
      // eslint-disable-next-line no-alert
      alert(getErrorMessage(error, t));
    },
  });

  const handleIssue = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || isIssuing) return;
    issueKey(trimmed);
  };

  const handleRevoke = (key: ApiKey) => {
    if (!key.isActive || isRevoking) return;
    // eslint-disable-next-line no-alert, no-restricted-globals
    if (!confirm(`'${key.name}' 키를 폐기하시겠습니까? 폐기 후에는 되돌릴 수 없습니다.`)) return;
    revokeKey(key.id);
  };

  const handleCopy = async () => {
    if (!issued) return;
    try {
      await navigator.clipboard.writeText(issued.key);
      setCopied(true);
    } catch {
      // eslint-disable-next-line no-alert
      alert('클립보드 복사에 실패했습니다. 수동으로 복사해 주세요.');
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (open) return;
    // 모달을 닫는 시점에 목록을 갱신해 방금 발급한 키가 반영되도록 한다.
    setIssued(null);
    setCopied(false);
    queryClient.invalidateQueries({ queryKey: API_KEY_QUERY_KEY });
  };

  const totalKeys = apiKeys?.length ?? 0;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-2 pb-24 pt-3 sm:px-3 md:px-4">
      <ServicePageHeader
        title="API Key"
        description="블로그 임시저장/이미지 업로드 전용 API Key 를 발급하고 폐기합니다."
        badge="Admin Console"
      />

      <ServiceInfoNotice icon={<ShieldAlert className="h-5 w-5" />}>
        API Key 는 블로그 임시저장(비공개) 업로드와 이미지 업로드에만 사용됩니다. 실제 게시(공개
        전환)나 키 관리는 불가능하며, 발급된 평문 키는 발급 직후 1회만 확인할 수 있습니다.
      </ServiceInfoNotice>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-point-fg" />
          <h2 className="text-base font-bold text-fg-1">새 API Key 발급</h2>
        </div>
        <form onSubmit={handleIssue} className="flex flex-wrap items-center gap-2">
          <Input
            id="api-key-name"
            className="h-10 max-w-xs flex-1 bg-basic-0/90"
            placeholder="키 이름 (예: 블로그 업로드 CLI)"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={isIssuing}
          />
          <Button
            type="submit"
            className="h-10 gap-1 px-4 text-sm"
            disabled={isIssuing || name.trim().length === 0}
          >
            <KeyRound className="h-4 w-4" />
            {isIssuing ? '발급 중...' : '발급'}
          </Button>
        </form>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-point-fg" />
            <h2 className="text-base font-bold text-fg-1">발급된 키 목록</h2>
            <span className="rounded-full bg-basic-3 px-2 py-0.5 text-[11px] font-bold text-fg-4">
              {totalKeys}
            </span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading}
            className={cn(
              SERVICE_CARD_INTERACTIVE,
              'inline-flex h-9 items-center gap-1 rounded-lg border border-basic-3 bg-basic-0/85 px-3 text-xs font-semibold text-fg-3 transition-colors hover:bg-basic-2 disabled:cursor-not-allowed disabled:opacity-60',
            )}
          >
            <RefreshCcw className={cn('h-3.5 w-3.5', isLoading ? 'animate-spin' : '')} />
            새로고침
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-basic-3 bg-basic-0/70 px-4 py-10 text-sm font-semibold text-fg-4">
            <RefreshCcw className="h-4 w-4 animate-spin" />
            API Key 목록을 불러오는 중입니다...
          </div>
        ) : null}

        {!isLoading && totalKeys === 0 ? (
          <div className="rounded-xl border border-dashed border-basic-3 bg-basic-0/70 px-4 py-10 text-center text-sm font-semibold text-fg-4">
            발급된 API Key 가 없습니다.
          </div>
        ) : null}

        {!isLoading && totalKeys > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key Prefix</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys?.map((key) => (
                <TableRow key={key.id} className="align-middle">
                  <TableCell className="whitespace-nowrap font-semibold text-fg-1">
                    {key.name}
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-xs text-fg-4">
                    {key.keyPrefix}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span
                      className={cn(
                        'inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                        key.isActive
                          ? 'border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-500/50 dark:bg-emerald-500/20 dark:text-emerald-100'
                          : 'border-basic-3 bg-basic-2 text-fg-5',
                      )}
                    >
                      {key.isActive ? '활성' : '폐기됨'}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-fg-5">
                    {formatDateTime(key.lastUsedAt)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-fg-5">
                    {formatDateTime(key.expiresAt)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-fg-5">
                    {formatDateTime(key.createdAt)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Button
                      type="button"
                      onClick={() => handleRevoke(key)}
                      disabled={!key.isActive || isRevoking}
                      className="h-8 gap-1 bg-red-500 px-3 text-xs hover:bg-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      폐기
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
      </section>

      <Dialog open={Boolean(issued)} onOpenChange={handleDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key 발급 완료</DialogTitle>
            <DialogDescription>
              이 키는 지금만 확인 가능합니다. 안전한 곳에 보관하세요. 창을 닫으면 평문 키를 다시 볼
              수 없습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-fg-5">{issued?.name}</p>
            <div className="flex items-center gap-2 rounded-xl border border-basic-3 bg-basic-2/60 px-3 py-2">
              <code className="min-w-0 flex-1 break-all font-mono text-sm text-fg-1">
                {issued?.key}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className={cn(
                  SERVICE_CARD_INTERACTIVE,
                  'inline-flex h-8 shrink-0 items-center gap-1 rounded-lg border border-basic-3 bg-basic-0/85 px-3 text-xs font-semibold text-fg-3 transition-colors hover:bg-basic-2',
                )}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? '복사됨' : '복사'}
              </button>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              className="h-9 px-4 text-sm"
              onClick={() => handleDialogOpenChange(false)}
            >
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ApiKeyManagePageImpl;
