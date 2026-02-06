import React from 'react';
import AsideScreenWrapper from '@components/complex/Layout/AsideScreenWrapper';
import BlogSearchNav from '@components/blog/BlogSearchNav';
import { BLOG_GLASS_PANEL, BLOG_GLASS_PANEL_SOFT } from '@components/blog/interactiveStyles';
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
      <section className="mb-4 w-full">
        <header
          className={`${BLOG_GLASS_PANEL} relative overflow-hidden px-5 py-6 md:px-8 md:py-8`}
        >
          <div className="pointer-events-none absolute -left-16 top-0 h-36 w-36 rounded-full bg-point-2/30 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-8 h-24 w-24 rounded-full bg-violet-400/20 blur-3xl" />
          <p className="relative z-10 mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-point-1">
            {t('filter.index')} · {t('title')}
          </p>
          <h1 className="relative z-10 t-t-1 t-basic-1 mb-3">{t('title')}</h1>
          <p className="relative z-10 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
            {t('openGraph.defaultDescription')}
          </p>
        </header>
      </section>
      {drawer}
      <section className={`${BLOG_GLASS_PANEL_SOFT} mt-4 p-3 md:p-5`}>{children}</section>
    </AsideScreenWrapper>
  );
}
