import React from 'react';
import AsideScreenWrapper from '@components/complex/Layout/AsideScreenWrapper';
import BlogSearchNav from '@components/blog/BlogSearchNav';
import { useTranslation as getServerTranslation } from '~/app/i18n';
import { ChildrenProps, LanguageParams } from '~/app/[lng]/layout';

type BlogSearchProps = {
  drawer: React.ReactNode;
} & ChildrenProps &
  LanguageParams;

export default async function BlogSearchLayout({ params, children, drawer }: BlogSearchProps) {
  const { lng } = await params;

  const { t } = await getServerTranslation(lng, 'blog/index');

  return (
    <AsideScreenWrapper left={<BlogSearchNav lng={lng} hasMargin />}>
      <h1 className="t-t-1 t-basic-1 mb-4">{t('title')}</h1>
      {drawer}
      {children}
    </AsideScreenWrapper>
  );
}
