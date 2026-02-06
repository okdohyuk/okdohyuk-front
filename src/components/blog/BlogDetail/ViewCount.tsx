'use client';

import React, { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { useCookies } from 'react-cookie';
import { v4 as uuidv4 } from 'uuid';
import { usePostBlogView } from '@queries/useBlogQueries';
import { useBlogDetail } from './BlogDetailProvider';

function ViewCount() {
  const { blog } = useBlogDetail();
  const [cookies, setCookie] = useCookies(['Authorization', 'SessionId']);
  const [viewCount, setViewCount] = useState(blog.viewCount || 0);

  const postViewMutation = usePostBlogView();

  useEffect(() => {
    // Ensure SessionId exists
    let sessionId = cookies.SessionId;
    if (!sessionId) {
      sessionId = uuidv4();
      setCookie('SessionId', sessionId, { path: '/' });
    }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blog.urlSlug, cookies.SessionId, setCookie]); // Mutation dependency omitted to run once per slug/session

  return (
    <span className="inline-flex items-center justify-center gap-1 align-middle leading-none text-zinc-300">
      <Eye className="h-4 w-4 shrink-0" aria-hidden />
      <span className="inline-flex items-center tabular-nums leading-none">{viewCount}</span>
    </span>
  );
}

export default ViewCount;
