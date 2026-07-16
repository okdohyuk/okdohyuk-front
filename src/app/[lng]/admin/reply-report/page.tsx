'use client';

import React, { use, useCallback, useEffect, useState } from 'react';
import { blogReplyApi } from '@api';
import { BlogReplyReport } from '@api/BlogReply';
import Link from '@components/basic/Link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/basic/Table';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import ServiceInfoNotice from '@components/complex/Service/ServiceInfoNotice';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import { cn } from '@utils/cn';
import UserTokenUtil from '@utils/userTokenUtil';
import {
  ExternalLink,
  ListChecks,
  MessageSquareWarning,
  RefreshCcw,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { LanguageParams } from '~/app/[lng]/layout';

const REASON_LABELS: Record<string, string> = {
  SPAM: '스팸 / 부적절한 홍보',
  INAPPROPRIATE: '부적절한 콘텐츠',
  HARASSMENT: '욕설 / 비하 발언',
  OTHER: '기타',
};

function AdminReplyReportPage({ params }: LanguageParams) {
  const { lng } = use(params);
  const [reports, setReports] = useState<BlogReplyReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const token = UserTokenUtil.getAccessToken();

      if (!token) {
        // eslint-disable-next-line no-alert
        alert('No token found');
        setReports([]);
        return;
      }

      const response = await blogReplyApi.getAdminBlogReplyReport(token);
      setReports(response.data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch reports', error);
      // eslint-disable-next-line no-alert
      alert('신고 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleDismissReport = useCallback(
    async (reportId: string) => {
      // eslint-disable-next-line no-alert
      if (!window.confirm('신고를 반려(삭제)하시겠습니까?')) return;
      try {
        const token = UserTokenUtil.getAccessToken();
        if (!token) return;

        await blogReplyApi.deleteBlogReplyReport(reportId, token);
        // eslint-disable-next-line no-alert
        alert('반려되었습니다.');
        fetchReports();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Dismiss failed', error);
        // eslint-disable-next-line no-alert
        alert('반려 실패');
      }
    },
    [fetchReports],
  );

  const handleDeleteReply = useCallback(
    async (replyId: string) => {
      // eslint-disable-next-line no-alert
      if (!window.confirm('해당 댓글을 정말 삭제하시겠습니까?')) return;
      try {
        const token = UserTokenUtil.getAccessToken();
        if (!token) return;

        await blogReplyApi.deleteBlogReply(replyId, token);
        // eslint-disable-next-line no-alert
        alert('삭제되었습니다.');
        fetchReports();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Delete failed', error);
        // eslint-disable-next-line no-alert
        alert('삭제 실패');
      }
    },
    [fetchReports],
  );

  const formatDate = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '-';
    return parsed.toLocaleDateString();
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-2 pb-24 pt-3 sm:px-3 md:px-4">
      <ServicePageHeader
        title="댓글 신고 관리"
        description="신고 사유와 댓글 내용을 검토한 뒤 반려 또는 삭제 조치를 실행할 수 있습니다."
        badge="Admin Console"
      />

      <ServiceInfoNotice icon={<ShieldAlert className="h-5 w-5" />}>
        신고 내역을 빠르게 확인하고 부적절한 댓글을 즉시 정리하세요.
      </ServiceInfoNotice>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-point-fg" />
            <h2 className="text-base font-bold text-fg-1">신고 목록</h2>
            <span className="rounded-full bg-basic-3 px-2 py-0.5 text-[11px] font-bold text-fg-4">
              {reports.length}
            </span>
          </div>
          <button
            type="button"
            onClick={fetchReports}
            disabled={loading}
            className={cn(
              SERVICE_CARD_INTERACTIVE,
              'inline-flex h-9 items-center gap-1 rounded-lg border border-basic-3 bg-basic-0/85 px-3 text-xs font-semibold text-fg-3 transition-colors hover:bg-basic-2 disabled:cursor-not-allowed disabled:opacity-60',
            )}
          >
            <RefreshCcw className={cn('h-3.5 w-3.5', loading ? 'animate-spin' : '')} />
            새로고침
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-basic-3 bg-basic-0/70 px-4 py-10 text-sm font-semibold text-fg-4">
            <RefreshCcw className="h-4 w-4 animate-spin" />
            신고 목록을 불러오는 중입니다...
          </div>
        ) : null}

        {!loading && reports.length === 0 ? (
          <div className="rounded-xl border border-dashed border-basic-3 bg-basic-0/70 px-4 py-10 text-center">
            <MessageSquareWarning className="mx-auto mb-2 h-6 w-6 text-point-fg" />
            <p className="text-sm font-semibold text-fg-3">신고된 댓글이 없습니다.</p>
          </div>
        ) : null}

        {!loading && reports.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3">신고자</TableHead>
                <TableHead className="px-4 py-3">사유</TableHead>
                <TableHead className="whitespace-normal px-4 py-3">댓글 내용</TableHead>
                <TableHead className="whitespace-normal px-4 py-3">상세내용</TableHead>
                <TableHead className="px-4 py-3">작성일</TableHead>
                <TableHead className="px-4 py-3">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id} className="align-top">
                  <TableCell className="whitespace-nowrap px-4 py-3 font-medium text-fg-2">
                    {report.reporter?.name ?? '-'}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3">
                    <span className="inline-flex rounded-full border border-danger-3 bg-danger-4 px-2 py-0.5 text-[11px] font-semibold text-danger-1 dark:border-danger-2/50 dark:bg-danger-2/20 dark:text-danger-4">
                      {REASON_LABELS[report.reason] || report.reason}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs px-4 py-3 text-fg-4">
                    {report.replyContent || 'Content not available'}
                  </TableCell>
                  <TableCell className="max-w-xs px-4 py-3 text-fg-4">
                    {report.description || '-'}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3 text-fg-5">
                    {formatDate(report.createdAt)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {report.blogUrlSlug ? (
                        <Link
                          href={`/${lng}/blog/${report.blogUrlSlug}`}
                          hasTargetBlank
                          className="inline-flex h-8 items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-500/50 dark:bg-indigo-500/20 dark:text-indigo-100 dark:hover:bg-indigo-500/30"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          이동
                        </Link>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => handleDismissReport(report.id)}
                        className="inline-flex h-8 items-center rounded-lg border border-basic-3 bg-basic-0/90 px-2.5 text-xs font-semibold text-fg-3 transition-colors hover:bg-basic-2"
                      >
                        반려
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteReply(report.replyId)}
                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-danger-3 bg-danger-4 px-2.5 text-xs font-semibold text-danger-1 transition-colors hover:bg-danger-4 dark:border-danger-2/50 dark:bg-danger-2/20 dark:text-danger-4 dark:hover:bg-danger-2/30"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        삭제
                      </button>
                    </div>
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

export default AdminReplyReportPage;
