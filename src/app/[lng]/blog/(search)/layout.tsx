import React from 'react';
import AsideScreenWrapper from '@components/complex/Layout/AsideScreenWrapper';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import BlogSearchNav from '@components/blog/BlogSearchNav';
import { useTranslation as getServerTranslation } from '~/app/i18n';
import { ChildrenProps } from '~/app/[lng]/layout';
import { Language } from '~/app/i18n/settings';

type BlogSearchProps = {
  drawer: React.ReactNode;
  params: Promise<{ lng: string }>;
} & ChildrenProps;

/*
 * Blog index: same header as every tool (mono path signature + ⌘K, title, description)
 * sitting on the page canvas. The search toolbar and the cards follow directly — the cards
 * are the only surfaces, so there is no panel around the list.
 */
export default async function BlogSearchLayout({ params, children, drawer }: BlogSearchProps) {
  const { lng } = await params;
  const language = lng as Language;

  const { t } = await getServerTranslation(language, 'blog/index');

  return (
    <AsideScreenWrapper left={<BlogSearchNav lng={language} hasMargin />}>
      <ServicePageHeader
        title={t('title')}
        description={t('openGraph.defaultDescription')}
        className="mb-6"
      />
      {drawer}
      <section className="pb-12">{children}</section>
    </AsideScreenWrapper>
  );
}
