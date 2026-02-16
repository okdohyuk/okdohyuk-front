import React from 'react';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import { H1, Text } from '@components/basic/Text';
import PhoneNumberFormatterClient from '~/app/[lng]/(mobile)/phone-number-formatter/components/PhoneNumberFormatterClient';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'phone-number-formatter' });

export default async function PhoneNumberFormatterPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;

  const { t } = await getTranslations(language, 'phone-number-formatter');

  return (
    <div className="space-y-4">
      <ServicePageHeader title={t('title')} description={t('description')} badge="Phone Helper" />
      <section className="space-y-2">
        <H1 className="sr-only">{t('title')}</H1>
        <Text className="text-sm text-zinc-600 dark:text-zinc-300">{t('description')}</Text>
      </section>
      <PhoneNumberFormatterClient lng={language} />
    </div>
  );
}
