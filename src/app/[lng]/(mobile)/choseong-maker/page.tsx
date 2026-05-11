'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { toChoseong } from '@utils/choseongUtils';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language } from '~/app/i18n/settings';
import { getServiceCategoryBadge } from '@assets/datas/serviceCategories';
import { Textarea } from '@components/basic/Textarea';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import { useToolTracking } from '@hooks/analytics/useToolTracking';

export default function ChoseongMakerPage({ params }: LanguageParams) {
  const { lng } = React.use(params);
  const language = lng as Language;
  const { t } = useTranslation(language, 'choseong-maker');
  const badge = getServiceCategoryBadge(language, '/choseong-maker');
  const { trackInputStarted, trackUse } = useToolTracking('choseong-maker', 'converter');
  const hasResultRef = useRef(false);
  const [value, setValue] = useState('');
  const choseongResult = toChoseong(value);

  useEffect(() => {
    const has = Boolean(choseongResult);
    if (has && !hasResultRef.current) {
      trackUse({ action_type: 'convert', success: true });
    }
    hasResultRef.current = has;
  }, [choseongResult, trackUse]);

  return (
    <div className="space-y-4">
      <ServicePageHeader
        title={t('title')}
        description={t('openGraph.description')}
        badge={badge}
      />
      <section className={`${SERVICE_PANEL_SOFT} flex flex-col space-y-4 p-4`}>
        <Textarea
          className="h-32 resize-none"
          placeholder={t('placeholder')}
          value={value}
          onChange={(e) => {
            trackInputStarted();
            setValue(e.target.value);
          }}
        />
        <Textarea className="h-32 resize-none" value={choseongResult} readOnly />
      </section>
    </div>
  );
}
