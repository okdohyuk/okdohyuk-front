import React from 'react';
import { GraduationCap } from 'lucide-react';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import ServiceInfoNotice from '@components/complex/Service/ServiceInfoNotice';
import { getTranslations } from '~/app/i18n';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language } from '~/app/i18n/settings';
import { getServiceCategoryBadge } from '@assets/datas/serviceCategories';
import SolveSubjectsClient from './SolveSubjectsClient';

export default async function SolvePage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;
  const { t } = await getTranslations(language, 'solve');
  const badge = getServiceCategoryBadge(language, '/solve');

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-2 pb-24 pt-3 sm:px-3 md:px-4">
      <ServicePageHeader title={t('title')} description={t('description')} badge={badge} />

      <ServiceInfoNotice icon={<GraduationCap className="h-5 w-5" />}>
        {t('intro')}
      </ServiceInfoNotice>

      <SolveSubjectsClient lng={language} />
    </div>
  );
}
