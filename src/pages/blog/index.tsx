import React from 'react';
import { useTranslation } from 'next-i18next';
import { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import BlogCard from '@components/blog/BlogCard';
import { observer } from 'mobx-react';
import { MdAutorenew } from 'react-icons/md';
import Opengraph from '@components/basic/Opengraph';
import useBlogSearch from '@hooks/blog/useBlogSearch';
import AsideScreenWrapper from '@components/complex/Layout/AsideScreenWrapper';

function BlogPage() {
  const { t } = useTranslation('blog/index');
  const { blogs, status } = useBlogSearch();

  return (
    <>
      <Opengraph
        title={t('openGraph.title')}
        ogTitle={t('openGraph.ogTitle')}
        description={t('openGraph.description')}
        isAds
      />
      <AsideScreenWrapper right={<div className="w-56 h-[700px] bg-basic-3 mt-8 mr-4 ml-4"></div>}>
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
      </AsideScreenWrapper>
    </>
  );
}

export const getStaticProps = async ({ locale }: GetStaticPropsContext) => ({
  props: {
    ...(await serverSideTranslations(locale as string, ['common', 'blog/index'])),
  },
});

export default observer(BlogPage);
