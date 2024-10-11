import React from 'react';
import BlogCard from './BlogCard';
import { observer } from 'mobx-react';
import useStore from '@hooks/useStore';
import { cls } from '@utils/classNameUtils';
import { useTranslation } from 'next-i18next';
import BlogCardSkeleton from './BlogCardSkeleton';

const BlogSearchListClient = ({}) => {
  const { blogs, count, viewType, status, isLast } = useStore('blogSearchStore');
  const { t } = useTranslation('blog/index');

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

        {status === 'loading'
          ? [...new Array(3)].map((d, i) => <BlogCardSkeleton type={viewType} key={i} />)
          : null}
        {!isLast ? <BlogCardSkeleton type={viewType} /> : null}
      </div>
    </div>
  );
};

export default observer(BlogSearchListClient);
