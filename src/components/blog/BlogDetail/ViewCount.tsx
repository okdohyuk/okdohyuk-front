'use client';

import React, { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { useCookies } from 'react-cookie';
import { v4 as uuidv4 } from 'uuid';
import { blogApi } from '@api';
import { useBlogDetail } from './BlogDetailProvider';

function ViewCount() {
  const { blog } = useBlogDetail();
  const [cookies, setCookie] = useCookies(['Authorization', 'SessionId']);
  const [viewCount, setViewCount] = useState(blog.viewCount || 0);

  useEffect(() => {
    // Ensure SessionId exists
    let sessionId = cookies.SessionId;
    if (!sessionId) {
      sessionId = uuidv4();
      setCookie('SessionId', sessionId, { path: '/' });
    }

    const fetchView = async () => {
      try {
        const { data } = await blogApi.postBlogView(
          blog.urlSlug,
          cookies.Authorization ?? (undefined as unknown as string),
          sessionId,
        );
        setViewCount(data.viewCount);
      } catch (error) {
        console.error('Failed to update view count', error);
      }
    };

    fetchView();
  }, [blog.urlSlug, cookies.Authorization, cookies.SessionId, setCookie]);

  return (
    <div className="flex items-center gap-1">
      <Eye size={16} />
      <span>{viewCount}</span>
    </div>
  );
}

export default ViewCount;
