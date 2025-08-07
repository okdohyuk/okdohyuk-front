'use client';

import React, { useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { toChoseong } from '@utils/choseongUtils';
import { LanguageParams } from '~/app/[lng]/layout';

export default function ChoseongMakerPage({ params }: LanguageParams) {
  const { lng } = React.use(params);
  const { t } = useTranslation(lng, 'choseong-maker');
  const [value, setValue] = useState('');

  return (
    <>
      <h1 className="t-t-1 t-basic-1 mb-4">{t('title')}</h1>
      <section className="flex flex-col space-y-4">
        <textarea
          className="input-text resize-none h-32"
          placeholder={t('placeholder')}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <textarea className="input-text resize-none h-32" value={toChoseong(value)} readOnly />
      </section>
    </>
  );
}
