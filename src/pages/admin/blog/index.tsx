import React, { useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import BlogCard from '~/components/blog/BlogCard';
import useStore from '@hooks/useStore';
import useInfiniteScroll from '@hooks/useInfiniteScroll';
import { observer } from 'mobx-react';
import { MdAutorenew } from 'react-icons/md';
import Opengraph from '~/components/basic/Opengraph';
import MobileScreenWrapper from '~/components/complex/Layout/MobileScreenWrapper';
import Cookies from 'js-cookie';
import { BlogSearch } from '~/spec/api/Blog';

function BlogAdminPage() {
  const { t } = useTranslation('blog/index');
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
      <Opengraph
        title={t('openGraph.defaultTitle')}
        ogTitle={t('openGraph.defaultTitle')}
        description={t('openGraph.description')}
      />
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

export const getStaticProps = async ({ locale }: GetStaticPropsContext) => ({
  props: {
    ...(await serverSideTranslations(locale as string, ['common', 'blog/index'])),
  },
});

export default observer(BlogAdminPage);
