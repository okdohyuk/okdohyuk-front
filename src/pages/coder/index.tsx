import React from 'react';
import { useTranslation } from 'next-i18next';
import { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { observer } from 'mobx-react';
import Opengraph from '@components/Basic/Opengraph';

function CoderPage() {
  const { t } = useTranslation('coder');
  //   const { blogs, getBlogsPage, status, isLastPage } = useStore<BlogStore>('blogStore');

  return (
    <>
      <Opengraph
        title={t('openGraph.title')}
        ogTitle={t('openGraph.ogTitle')}
        description={t('openGraph.description')}
      />
    </>
  );
}

export const getStaticProps = async ({ locale }: GetStaticPropsContext) => ({
  props: {
    ...(await serverSideTranslations(locale as string, ['common', 'coder'])),
  },
});

export default observer(CoderPage);
