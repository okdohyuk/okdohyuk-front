'use client';

import React from 'react';
import BlogCard from './BlogCard';
import { observer } from 'mobx-react';
import useStore from '@hooks/useStore';
import { cls } from '@utils/classNameUtils';
import BlogCardSkeleton from './BlogCardSkeleton';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';

const BlogSearchListClient = ({ lng }: { lng: Language }) => {
  const { blogs, count, viewType, status } = useStore('blogSearchStore');
  const { t } = useTranslation(lng, 'blog/index');

  return (
    <div className="mt-4">
      <div className="t-d-1 t-basic-1">
        {t('resultCount')}
        {count}
      </div>
      <div
        className={cls(
          'w-full gap-2 mt-4',
          viewType === 'frame' ? 'grid grid-cols-2 lg:grid-cols-3' : 'flex flex-col',
        )}
      >
        {blogs?.map((blog) => (
          <BlogCard key={blog.urlSlug} blog={blog} type={viewType} />
        ))}

        {blogs === null
          ? [...new Array(4)].map((d, i) => <BlogCardSkeleton type={viewType} key={i} />)
          : null}
        {status === 'loading' ? <BlogCardSkeleton type={viewType} /> : null}
      </div>
    </div>
  );
};

export default observer(BlogSearchListClient);
