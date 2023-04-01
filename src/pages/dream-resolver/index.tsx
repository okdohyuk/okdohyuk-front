import { GetStaticPropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React from 'react';
import Opengraph from '@components/Basic/Opengraph';

function DreamResolver() {
  const { t } = useTranslation('dream-resolver');

  return (
    <>
      <Opengraph
        title={t('openGraph.title')}
        ogTitle={t('openGraph.ogTitle')}
        description={t('openGraph.description')}
        image={'/dream-resolver.jpg'}
      />
      Hello World
    </>
  );
}

export default DreamResolver;

export const getStaticProps = async ({ locale }: GetStaticPropsContext) => ({
  props: {
    ...(await serverSideTranslations(locale as string, ['common', 'dream-resolver'])),
  },
});
