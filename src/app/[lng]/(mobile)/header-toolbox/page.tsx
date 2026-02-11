import React from 'react';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import HeaderToolboxClient from '~/app/[lng]/(mobile)/header-toolbox/components/HeaderToolboxClient';
import { H1, Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { SERVICE_PANEL } from '@components/complex/Service/interactiveStyles';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'header-toolbox' });

export default async function HeaderToolboxPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;

  const { t } = await getTranslations(language, 'header-toolbox');

  return (
    <div className="space-y-4">
      <section className={cn(SERVICE_PANEL, 'relative overflow-hidden px-5 py-6 md:px-7 md:py-7')}>
        <div className="pointer-events-none absolute -left-10 top-4 h-24 w-24 rounded-full bg-point-2/30 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-6 h-20 w-20 rounded-full bg-violet-400/20 blur-3xl" />
        <Text className="relative z-10 text-xs font-semibold uppercase tracking-[0.14em] text-point-1">
          {t('badge')}
        </Text>
        <H1 className="relative z-10 mt-2 text-zinc-900 dark:text-zinc-50">{t('title')}</H1>
        <Text className="relative z-10 mt-3 block max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          {t('description')}
        </Text>
      </section>
      <HeaderToolboxClient lng={language} />
    </div>
  );
}
