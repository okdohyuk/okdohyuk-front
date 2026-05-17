import React from 'react';
import Link from '@components/basic/Link';
import { ListChecks, Sparkles } from 'lucide-react';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import ServiceInfoNotice from '@components/complex/Service/ServiceInfoNotice';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { getTranslations } from '~/app/i18n';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language } from '~/app/i18n/settings';
import { getServiceCategoryBadge } from '@assets/datas/serviceCategories';
import ShortenerForm from './ShortenerForm';

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'shortener' });

export default async function ShortenerPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;
  const { t } = await getTranslations(language, 'shortener');
  const badge = getServiceCategoryBadge(language, '/shortener');

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-2 pb-24 pt-3 sm:px-3 md:px-4">
      <ServicePageHeader title={t('title')} description={t('description')} badge={badge} />

      <ServiceInfoNotice icon={<Sparkles className="h-5 w-5" />}>{t('intro')}</ServiceInfoNotice>

      <ShortenerForm lng={language} />

      <div className="flex justify-end">
        <Link
          href={`/${language}/shortener/me`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-fg-4 hover:text-point-fg"
        >
          <ListChecks className="h-4 w-4" />
          {t('me.title')}
        </Link>
      </div>
    </div>
  );
}
