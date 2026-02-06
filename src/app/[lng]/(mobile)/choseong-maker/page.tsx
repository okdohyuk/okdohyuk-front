'use client';

import React, { useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { toChoseong } from '@utils/choseongUtils';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language } from '~/app/i18n/settings';
import { Textarea } from '@components/basic/Textarea';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

export default function ChoseongMakerPage({ params }: LanguageParams) {
  const { lng } = React.use(params);
  const language = lng as Language;
  const { t } = useTranslation(language, 'choseong-maker');
  const [value, setValue] = useState('');

  return (
    <div className="space-y-4">
      <ServicePageHeader
        title={t('title')}
        description={t('openGraph.description')}
        badge="Text Utility"
      />
      <section className={`${SERVICE_PANEL_SOFT} flex flex-col space-y-4 p-4`}>
        <Textarea
          className="h-32 resize-none"
          placeholder={t('placeholder')}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Textarea className="h-32 resize-none" value={toChoseong(value)} readOnly />
      </section>
    </div>
  );
}
