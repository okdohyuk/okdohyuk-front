import React from 'react';
import AsideScreenWrapper from '@components/complex/Layout/AsideScreenWrapper';
import BlogSearchNav from '@components/blog/BlogSearchNav';
import { Language } from '~/app/i18n/settings';
import { useTranslation } from '~/app/i18n';

export default async function BlogsLayout({
  children,
  params: { lng },
  drawer,
}: {
  children: React.ReactNode;
  params: { lng: Language };
  drawer: React.ReactNode;
}) {
  const { t } = await useTranslation(lng, 'blog/index');

  return (
    <>
      <AsideScreenWrapper left={<BlogSearchNav lng={lng} hasMargin />}>
        <h1 className={'t-t-1 t-basic-1 mb-4'}>{t('title')}</h1>
        {drawer}
        {children}
      </AsideScreenWrapper>
    </>
  );
}
