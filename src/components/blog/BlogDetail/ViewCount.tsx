'use client';

import React, { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { usePostBlogView } from '@queries/useBlogQueries';
import { useSession } from '@hooks/useSession';
import { useBlogDetail } from './BlogDetailProvider';

function ViewCount() {
  const { blog } = useBlogDetail();
  // 백엔드 발급 세션을 사용 — 클라이언트가 UUID를 직접 만들지 않는다.
  const { sessionId } = useSession();
  const [viewCount, setViewCount] = useState(blog.viewCount || 0);

  const postViewMutation = usePostBlogView();

  useEffect(() => {
    if (!sessionId) return;

    const incrementView = async () => {
      try {
        const { data } = await postViewMutation.mutateAsync({ urlSlug: blog.urlSlug, sessionId });
        setViewCount(data.viewCount);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to update view count', error);
      }
    };

    incrementView();
  }, [blog.urlSlug, sessionId]); // 슬러그/세션 변경 시 1회 카운트

  return (
    <span className="inline-flex items-center gap-1">
      <Eye className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
      <span className="font-mono tabular-nums">{viewCount.toLocaleString('en-US')}</span>
    </span>
  );
}

export default ViewCount;
