'use client';

import React, { useEffect, useState } from 'react';
import { blogReplyApi } from '@api';
import { BlogReplyReport } from '@api/BlogReply';
import UserTokenUtil from '@utils/userTokenUtil';
import Link from 'next/link';

// Add constant for labels
const REASON_LABELS: Record<string, string> = {
  SPAM: '스팸 / 부적절한 홍보',
  INAPPROPRIATE: '부적절한 콘텐츠',
  HARASSMENT: '욕설 / 비하 발언',
  OTHER: '기타',
};

function AdminReplyReportPage() {
  const [reports, setReports] = useState<BlogReplyReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const token = UserTokenUtil.getAccessToken(); // Already includes 'Bearer '

      if (!token) {
        alert('No token found');
        return;
      }

      // Use getAdminBlogReplyReport from blogReplyApi
      const response = await blogReplyApi.getAdminBlogReplyReport(token);
      setReports(response.data);
    } catch (error) {
      console.error('Failed to fetch reports', error);
      alert('신고 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDismissReport = async (reportId: string) => {
    if (!window.confirm('신고를 반려(삭제)하시겠습니까?')) return;
    try {
      const token = UserTokenUtil.getAccessToken();
      if (!token) return;

      await blogReplyApi.deleteBlogReplyReport(reportId, token);
      alert('반려되었습니다.');
      fetchReports();
    } catch (error) {
      console.error('Dismiss failed', error);
      alert('반려 실패');
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!window.confirm('해당 댓글을 정말 삭제하시겠습니까?')) return;
    try {
      const token = UserTokenUtil.getAccessToken();
      if (!token) return;

      await blogReplyApi.deleteBlogReply(replyId, token); // Use deleteBlogReply (admin check internal or same method)
      alert('삭제되었습니다.');
      fetchReports(); // Refresh list
    } catch (error) {
      console.error('Delete failed', error);
      alert('삭제 실패');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">댓글 신고 관리</h1>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                신고자
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                사유
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                댓글 내용
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                상세내용
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                작성일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {reports.map((report) => (
              <tr key={report.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {report.reporter?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    {REASON_LABELS[report.reason] || report.reason}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate">
                  {/* @ts-ignore if fields are optional in generated code but we expect them */}
                  {report.replyContent || 'Content not available'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-xs truncate">
                  {report.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(report.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {report.blogUrlSlug && (
                    <Link
                      href={`/blog/${report.blogUrlSlug}`}
                      target="_blank"
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      이동
                    </Link>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleDismissReport(report.id)}
                      className="text-gray-500 hover:text-gray-800"
                    >
                      반려
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteReply(report.replyId)}
                      className="text-red-600 hover:text-red-900"
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reports.length === 0 && (
          <div className="p-8 text-center text-gray-500">신고된 댓글이 없습니다.</div>
        )}
      </div>
    </div>
  );
}

export default AdminReplyReportPage;
