'use client';

import React, { useState } from 'react';
import { useTranslation } from '~/app/i18n/client';
import { toChoseong } from '@utils/choseongUtils';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language } from '~/app/i18n/settings';
import { H1 } from '@components/basic/Text';
import { Textarea } from '@components/basic/Textarea';

export default function ChoseongMakerPage({ params }: LanguageParams) {
  const { lng } = React.use(params);
  const language = lng as Language;
  const { t } = useTranslation(language, 'choseong-maker');
  const [value, setValue] = useState('');

  return (
    <>
      <H1 className="mb-4 t-basic-1">{t('title')}</H1>
      <section className="flex flex-col space-y-4">
        <Textarea
          className="h-32 resize-none"
          placeholder={t('placeholder')}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <Textarea className="h-32 resize-none" value={toChoseong(value)} readOnly />
      </section>
    </>
  );
}
