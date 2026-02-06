'use client';

import React from 'react';
import { observer } from 'mobx-react';
import useBlogSearchClient from '@hooks/blog/useBlogSearchClient';
import useStore from '@hooks/useStore';
import { cn } from '@utils/cn';
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

  return (
    <section className="mt-2">
      <div
        className={cn(BLOG_GLASS_PANEL_SOFT, 'mb-4 flex items-center justify-between px-4 py-3')}
      >
        <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          {t('resultCount')}
          <span className="ml-1 text-base font-black text-point-1">{count ?? 0}</span>
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
