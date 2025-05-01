import React from 'react';
import AsideScreenWrapper from '@components/complex/Layout/AsideScreenWrapper';
import BlogSearchNav from '@components/blog/BlogSearchNav';
import { useTranslation } from '~/app/i18n';
import { ChildrenProps, LanguageParams } from '~/app/[lng]/layout';

type BlogSearchProps = {
  drawer: React.ReactNode;
} & ChildrenProps &
  LanguageParams;

export default async function BlogSearchLayout(props: BlogSearchProps) {
  const params = await props.params;

  const { lng } = params;

  const { children, drawer } = props;

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
