'use client';

import React from 'react';
import { observer } from 'mobx-react';
import useBlogSearchClient from '@hooks/blog/useBlogSearchClient';
import useStore from '@hooks/useStore';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { BlogCategory } from '~/spec/api/Blog';
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
    <div className="mt-4">
      <div className="t-d-1 t-basic-1">
        {t('resultCount')}
        {count}
      </div>
      <div
        className={cn(
          'w-full gap-2 mt-4',
          viewType === 'frame' ? 'grid grid-cols-2 lg:grid-cols-3' : 'flex flex-col',
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
    </div>
  );
};

export default observer(BlogSearchListClient);
