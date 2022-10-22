import React, { useEffect, useState } from 'react';
import Opengraph from '@components/opengraph';
import { useTranslation } from 'next-i18next';
import { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import BlogCard from '@components/Card/BlogCard';
import useStore from '@hooks/useStore';
import BlogStore from '@stores/BlogStore';
import useInfiniteScroll from '@hooks/useInfiniteScroll';
import { observer } from 'mobx-react';

function BlogPage() {
  const { t } = useTranslation('blog');
  const { blogs, getBlogsPage, status, isLastPage } = useStore<BlogStore>('blogStore');
  const { setIsFetching, isFetching } = useInfiniteScroll();
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isFetching) return;
    getBlogsPage(page, 10);
  }, [isFetching, page]);

  useEffect(() => {
    if (isLastPage) return;
    if (status === 'success') {
      setIsFetching(false);
      setPage((page) => page + 1);
    }
  }, [status, isLastPage]);

  useEffect(() => {
    setIsFetching(true);
  }, []);

  return (
    <div className={'w-full min-h-screen dark:bg-black pb-[70px] lg:pb-auto'}>
      <Opengraph
        title={t('openGraph.title')}
        ogTitle={t('openGraph.ogTitle')}
        description={t('openGraph.description')}
      />
      <div className="flex flex-col items-center gap-6 text-center px-4 py-12 lg:py-24">
        <h1
          className={
            'font-bold text-2xl max-w-md md:text-3xl lg:text-5xl lg:max-w-2xl dark:text-white'
          }
        >
          {t('title')}
        </h1>
        <div className={'flex flex-col w-full gap-2 xl:max-w-6xl'}>
          {blogs?.map((blog) => (
            <BlogCard key={blog.urlSlug} blog={blog} />
          ))}
        </div>
      </div>
    </div>
  );
}

export const getStaticProps = async ({ locale }: GetStaticPropsContext) => ({
  props: {
    ...(await serverSideTranslations(locale as string, ['common', 'blog'])),
  },
});

export default observer(BlogPage);
