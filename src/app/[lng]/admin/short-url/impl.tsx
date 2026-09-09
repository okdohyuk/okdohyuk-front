'use client';

import React, { useState } from 'react';
import { Button } from '@components/basic/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/basic/Table';
import ServiceInfoNotice from '@components/complex/Service/ServiceInfoNotice';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import {
  useCreateShortUrlBannedDomain,
  useDeleteShortUrlBannedDomain,
  useShortUrlBannedDomains,
} from '@queries/useShortUrlQueries';
import { cn } from '@utils/cn';
import { getErrorMessage } from '@utils/errorHandler';
import { Plus, RefreshCcw, ShieldBan, Trash2 } from 'lucide-react';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';

type ShortUrlAdminPageImplProps = {
  lng: Language;
};

const normalizeDomainInput = (value: string): string => value.trim().toLowerCase();

const formatDateTime = (value?: string | null): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};

function ShortUrlAdminPageImpl({ lng }: ShortUrlAdminPageImplProps) {
  const { t } = useTranslation(lng, 'common');
  const [domain, setDomain] = useState('');
  const [validationError, setValidationError] = useState('');

  const { data: bannedDomains, isLoading, isError, refetch } = useShortUrlBannedDomains();
  const { mutate: createBannedDomain, isPending: isCreating } = useCreateShortUrlBannedDomain();
  const { mutate: deleteBannedDomain, isPending: isDeleting } = useDeleteShortUrlBannedDomain();

  const totalDomains = bannedDomains?.length ?? 0;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = normalizeDomainInput(domain);
    if (!normalized) {
      setValidationError('차단할 도메인을 입력해 주세요.');
      return;
    }

    setValidationError('');
    createBannedDomain(
      { domain: normalized },
      {
        onSuccess: () => setDomain(''),
        onError: (error) => {
          // eslint-disable-next-line no-alert
          alert(getErrorMessage(error, t));
        },
      },
    );
  };

  const handleDelete = (id: number, targetDomain: string) => {
    if (isDeleting) return;
    // eslint-disable-next-line no-alert, no-restricted-globals
    if (!confirm(`'${targetDomain}' 차단을 해제하시겠습니까?`)) return;
    deleteBannedDomain(id, {
      onError: (error) => {
        // eslint-disable-next-line no-alert
        alert(getErrorMessage(error, t));
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-2 pb-24 pt-3 sm:px-3 md:px-4">
      <ServicePageHeader
        title="단축 URL 관리"
        description="차단 도메인을 등록하면 해당 도메인과 하위 도메인의 단축 URL 생성 및 기존 링크 이동이 차단됩니다."
        badge="Admin Console"
      />

      <ServiceInfoNotice icon={<ShieldBan className="h-5 w-5" />}>
        URL 전체가 아니라 도메인만 입력합니다. 예를 들어 example.com 을 등록하면 example.com 과
        sub.example.com 이 함께 차단됩니다.
      </ServiceInfoNotice>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-point-fg" />
          <h2 className="text-base font-bold text-fg-1">차단 도메인 추가</h2>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-wrap items-start gap-2">
          <div className="min-w-56 max-w-sm flex-1">
            <label htmlFor="short-url-banned-domain">
              <span className="sr-only">차단할 도메인</span>
              <input
                id="short-url-banned-domain"
                className="flex min-h-[32px] h-10 w-full resize-none items-center rounded-lg border border-basic-3 bg-basic-0/90 p-1 text-fg-1 outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-point-1"
                inputMode="url"
                autoCapitalize="none"
                autoComplete="off"
                placeholder="example.com"
                value={domain}
                onChange={(event) => {
                  setDomain(event.target.value);
                  if (validationError) setValidationError('');
                }}
                disabled={isCreating}
                aria-invalid={Boolean(validationError)}
                aria-describedby={validationError ? 'short-url-banned-domain-error' : undefined}
              />
            </label>
            {validationError ? (
              <p
                id="short-url-banned-domain-error"
                className="mt-1 text-xs font-semibold text-red-500"
              >
                {validationError}
              </p>
            ) : null}
          </div>
          <Button
            type="submit"
            className="h-10 gap-1 px-4 text-sm"
            disabled={isCreating || domain.trim().length === 0}
          >
            <ShieldBan className="h-4 w-4" />
            {isCreating ? '등록 중...' : '차단 등록'}
          </Button>
        </form>
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldBan className="h-4 w-4 text-point-fg" />
            <h2 className="text-base font-bold text-fg-1">차단 도메인 목록</h2>
            <span className="rounded-full bg-basic-3 px-2 py-0.5 text-[11px] font-bold text-fg-4">
              {totalDomains}
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
            차단 도메인 목록을 불러오는 중입니다...
          </div>
        ) : null}

        {!isLoading && isError ? (
          <div className="rounded-xl border border-dashed border-red-300 bg-red-50 px-4 py-10 text-center text-sm font-semibold text-red-700 dark:border-red-500/50 dark:bg-red-500/10 dark:text-red-100">
            차단 도메인 목록을 불러오지 못했습니다.
          </div>
        ) : null}

        {!isLoading && !isError && totalDomains === 0 ? (
          <div className="rounded-xl border border-dashed border-basic-3 bg-basic-0/70 px-4 py-10 text-center text-sm font-semibold text-fg-4">
            등록된 차단 도메인이 없습니다.
          </div>
        ) : null}

        {!isLoading && !isError && totalDomains > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bannedDomains?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="whitespace-nowrap font-mono text-sm font-semibold text-fg-1">
                    {item.domain}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-fg-5">
                    {formatDateTime(item.createdAt)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Button
                      type="button"
                      onClick={() => handleDelete(item.id, item.domain)}
                      disabled={isDeleting}
                      className="h-8 gap-1 bg-red-500 px-3 text-xs hover:bg-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      삭제
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
      </section>
    </div>
  );
}

export default ShortUrlAdminPageImpl;
