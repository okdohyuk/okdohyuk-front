'use client';

import React, { useEffect } from 'react';
import BlogCard from '~/components/blog/BlogCard';
import useStore from '@hooks/useStore';
import useInfiniteScroll from '@hooks/useInfiniteScroll';
import { observer } from 'mobx-react';
import { MdAutorenew } from 'react-icons/md';
import MobileScreenWrapper from '~/components/complex/Layout/MobileScreenWrapper';
import Cookies from 'js-cookie';
import { BlogSearch } from '~/spec/api/Blog';
import { useTranslation } from '~/app/i18n/client';

function BlogAdminPage() {
  const { t } = useTranslation('ko', 'blog/index');
  const { blogs, getBlogsPage, status, isLastPage } = useStore('blogStore');
  const { setIsFetching, isFetching } = useInfiniteScroll();
  const accessToken = Cookies.get('access_token');

  useEffect(() => {
    if (!isFetching) return;
    getBlogsPage(10, accessToken);
  }, [isFetching]);

  useEffect(() => {
    if (isLastPage) return;
    if (status === 'success') {
      setIsFetching(false);
    }
  }, [status, isLastPage]);

  useEffect(() => {
    if (status === 'idle') setIsFetching(true);
  }, []);

  return (
    <>
      <MobileScreenWrapper>
        <h1 className={'t-t-1 t-basic-1 mb-4'}>{t('title')}</h1>
        <div className={'flex flex-col w-full gap-2'}>
          {blogs?.map((blog) => (
            <BlogCard key={blog.urlSlug} blog={blog as BlogSearch} isAdmin type="board" />
          ))}
          {status === 'loading' ? (
            <div className={'flex justify-center'}>
              <MdAutorenew className={'text-black dark:text-white animate-spin'} size={24} />
            </div>
          ) : null}
        </div>
      </MobileScreenWrapper>
    </>
  );
}

export default observer(BlogAdminPage);
