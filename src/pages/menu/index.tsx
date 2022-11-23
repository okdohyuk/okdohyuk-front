import React from 'react';
import CommonLayout from '@components/Complex/Layouts/CommonLayout';
import { useTranslation } from 'next-i18next';
import { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

function MenuPage() {
  const { t } = useTranslation('menu');
  return (
    <CommonLayout
      title={t('openGraph.title')}
      ogTitle={t('openGraph.ogTitle')}
      description={t('openGraph.description')}
    >
      {''}
    </CommonLayout>
  );
}

export default MenuPage;

export const getStaticProps = async ({ locale }: GetStaticPropsContext) => ({
  props: {
    ...(await serverSideTranslations(locale as string, ['common', 'menu'])),
  },
});
