import React from 'react';
import AsideScreenWrapper from '@components/complex/Layout/AsideScreenWrapper';
import BlogSearchNav from '@components/blog/BlogSearchNav';
import { useTranslation as getServerTranslation } from '~/app/i18n';
import { ChildrenProps } from '~/app/[lng]/layout';
import { Language } from '~/app/i18n/settings';

type BlogSearchProps = {
  drawer: React.ReactNode;
  params: Promise<{ lng: string }>;
} & ChildrenProps;

export default async function BlogSearchLayout({ params, children, drawer }: BlogSearchProps) {
  const { lng } = await params;
  const language = lng as Language;

  const { t } = await getServerTranslation(language, 'blog/index');

  return (
    <AsideScreenWrapper left={<BlogSearchNav lng={language} hasMargin />}>
      <h1 className="t-t-1 t-basic-1 mb-4">{t('title')}</h1>
      {drawer}
      {children}
    </AsideScreenWrapper>
  );
}
