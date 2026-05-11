'use client';

import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react';
import useBlogSearchClient from '@hooks/blog/useBlogSearchClient';
import useStore from '@hooks/useStore';
import { cn } from '@utils/cn';
import { sendGAEvent } from '@libs/client/gtag';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { BlogCategory } from '~/spec/api/Blog';
import { BLOG_GLASS_PANEL_SOFT } from './interactiveStyles';
import BlogCard from './BlogCard';
import BlogCardSkeleton from './BlogCardSkeleton';

type BlogSearchListClientProps = {
  lng: Language;
  category: BlogCategory[];
  tags: string[];
};

const BlogSearchListClient = function BlogSearchListClient({
  lng,
  category,
  tags,
}: BlogSearchListClientProps) {
  useBlogSearchClient(category, tags);
  const { blogs, count, viewType, status } = useStore('blogSearchStore');
  const { t } = useTranslation(lng, 'blog/index');

  // blog_load_more: status가 success로 전환되고, 이전보다 항목이 늘어난 경우 추가 로드로 간주
  const prevLengthRef = useRef<number>(0);
  const pageIndexRef = useRef<number>(0);
  const prevStatusRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const length = blogs?.length ?? 0;
    if (status === 'success' && prevStatusRef.current === 'loading') {
      if (length > prevLengthRef.current && prevLengthRef.current > 0) {
        pageIndexRef.current += 1;
        sendGAEvent('blog_load_more', String(pageIndexRef.current), {
          page_index: pageIndexRef.current,
          total_loaded: length,
        });
      }
      prevLengthRef.current = length;
    }
    // 검색 조건 변경으로 리셋된 경우(길이가 줄거나 0이 됨) 페이지 인덱스 초기화
    if (length < prevLengthRef.current) {
      pageIndexRef.current = 0;
      prevLengthRef.current = length;
    }
    prevStatusRef.current = status;
  }, [blogs, status]);

  return (
    <section className="mt-2">
      <div
        className={cn(BLOG_GLASS_PANEL_SOFT, 'mb-4 flex items-center justify-between px-4 py-3')}
      >
        <div className="text-sm font-semibold text-fg-3">
          {t('resultCount')}
          <span className="ml-1 text-base font-black text-point-fg">{count ?? 0}</span>
        </div>
      </div>
      <div
        className={cn(
          'mt-4 w-full gap-4',
          viewType === 'frame' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'flex flex-col',
        )}
      >
        {blogs?.map((blog) => (
          <BlogCard key={blog.urlSlug} blog={blog} type={viewType} />
        ))}

        {blogs === null
          ? Array.from({ length: 4 }, (_, index) => (
              <BlogCardSkeleton type={viewType} key={`skeleton-${index}`} />
            ))
          : null}
        {status === 'loading' ? <BlogCardSkeleton type={viewType} /> : null}
      </div>
    </section>
  );
};

export default observer(BlogSearchListClient);
