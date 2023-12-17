import React, { useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import BlogCard from '@components/Complex/Card/BlogCard';
import useStore from '@hooks/useStore';
import useInfiniteScroll from '@hooks/useInfiniteScroll';
import { observer } from 'mobx-react';
import { MdAutorenew } from 'react-icons/md';
import Opengraph from '@components/Basic/Opengraph';
import MobileScreenWarpper from '@components/Complex/Layouts/MobileScreenWarpper';

function BlogPage() {
  const { t } = useTranslation('blog');
  const { blogs, getBlogsPage, status, isLastPage } = useStore('blogStore');
  const { setIsFetching, isFetching } = useInfiniteScroll();

  useEffect(() => {
    if (!isFetching) return;
    getBlogsPage(10);
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
      <Opengraph
        title={t('openGraph.title')}
        ogTitle={t('openGraph.ogTitle')}
        description={t('openGraph.description')}
      />
      <MobileScreenWarpper>
        <h1 className={'t-t-1 t-basic-1 mb-4'}>{t('title')}</h1>
        <div className={'flex flex-col w-full gap-2'}>
          {blogs?.map((blog) => (
            <BlogCard key={blog.urlSlug} blog={blog} />
          ))}
          {status === 'loading' ? (
            <div className={'flex justify-center'}>
              <MdAutorenew className={'text-black dark:text-white animate-spin'} size={24} />
            </div>
          ) : null}
        </div>
      </MobileScreenWarpper>
    </>
  );
}

export const getStaticProps = async ({ locale }: GetStaticPropsContext) => ({
  props: {
    ...(await serverSideTranslations(locale as string, ['common', 'blog'])),
  },
});

export default observer(BlogPage);
