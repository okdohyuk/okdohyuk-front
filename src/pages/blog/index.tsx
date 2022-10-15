import React from 'react';
import Opengraph from '@components/opengraph';
import { useTranslation } from 'next-i18next';
import { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

function BlogPage() {
  const { t } = useTranslation('blog');

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
      </div>
    </div>
  );
}

export const getStaticProps = async ({ locale }: GetStaticPropsContext) => ({
  props: {
    ...(await serverSideTranslations(locale ? locale : '', ['common', 'blog'])),
  },
});

export default BlogPage;
