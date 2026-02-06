'use client';

import React, { use, useCallback, useEffect, useState } from 'react';
import { blogReplyApi } from '@api';
import { BlogReplyReport } from '@api/BlogReply';
import Link from '@components/basic/Link';
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
            <ListChecks className="h-4 w-4 text-point-1" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">신고 목록</h2>
            <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[11px] font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
              {reports.length}
            </span>
          </div>
          <button
            type="button"
            onClick={fetchReports}
            disabled={loading}
            className={cn(
              SERVICE_CARD_INTERACTIVE,
              'inline-flex h-9 items-center gap-1 rounded-lg border border-zinc-200 bg-white/85 px-3 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-200 dark:hover:bg-zinc-700',
            )}
          >
            <RefreshCcw className={cn('h-3.5 w-3.5', loading ? 'animate-spin' : '')} />
            새로고침
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300/90 bg-white/70 px-4 py-10 text-sm font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300">
            <RefreshCcw className="h-4 w-4 animate-spin" />
            신고 목록을 불러오는 중입니다...
          </div>
        ) : null}

        {!loading && reports.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300/90 bg-white/70 px-4 py-10 text-center dark:border-zinc-700 dark:bg-zinc-900/60">
            <MessageSquareWarning className="mx-auto mb-2 h-6 w-6 text-point-1" />
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              신고된 댓글이 없습니다.
            </p>
          </div>
        ) : null}

        {!loading && reports.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-zinc-200/80 bg-white/80 dark:border-zinc-700 dark:bg-zinc-900/70">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-100/90 dark:bg-zinc-800/80">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-300">
                    신고자
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-300">
                    사유
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-300">
                    댓글 내용
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-300">
                    상세내용
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-300">
                    작성일
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-300">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/90 dark:divide-zinc-700/80">
                {reports.map((report) => (
                  <tr key={report.id} className="align-top">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-zinc-800 dark:text-zinc-100">
                      {report.reporter?.name ?? '-'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700 dark:border-red-500/50 dark:bg-red-500/20 dark:text-red-100">
                        {REASON_LABELS[report.reason] || report.reason}
                      </span>
                    </td>
                    <td className="max-w-xs px-4 py-3 text-zinc-600 dark:text-zinc-300">
                      {report.replyContent || 'Content not available'}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-zinc-600 dark:text-zinc-300">
                      {report.description || '-'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {formatDate(report.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
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
                          className="inline-flex h-8 items-center rounded-lg border border-zinc-200 bg-white/90 px-2.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800/85 dark:text-zinc-200 dark:hover:bg-zinc-700"
                        >
                          반려
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteReply(report.replyId)}
                          className="inline-flex h-8 items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 dark:border-red-500/50 dark:bg-red-500/20 dark:text-red-100 dark:hover:bg-red-500/30"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default AdminReplyReportPage;
