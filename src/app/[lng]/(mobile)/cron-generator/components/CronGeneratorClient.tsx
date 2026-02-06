'use client';

import React, { useEffect, useState } from 'react';
import cronstrue from 'cronstrue/i18n';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import CronExpressionInput from './CronExpressionInput';
import CronGuideGrid from './CronGuideGrid';
import CronResultCard from './CronResultCard';

type CronGeneratorClientProps = {
  lng: Language;
};

function CronGeneratorClient({ lng }: CronGeneratorClientProps) {
  const { t } = useTranslation(lng, 'cron-generator');
  const [expression, setExpression] = useState('* * * * *');
  const [humanReadable, setHumanReadable] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const trimmed = expression.trim();
      if (!trimmed) {
        setHumanReadable('');
        setError(null);
        return;
      }

      let locale = 'en';
      if (lng === 'ko') locale = 'ko';
      else if (lng === 'zh') locale = 'zh_CN';
      else if (lng === 'ja') locale = 'ja';

      const desc = cronstrue.toString(trimmed, { locale });
      setHumanReadable(desc);
      setError(null);
    } catch (err) {
      setHumanReadable('');
      setError(t('invalid'));
    }
  }, [expression, lng, t]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <CronExpressionInput
        label={t('label.expression')}
        placeholder={t('placeholder')}
        expression={expression}
        error={error}
        onChange={setExpression}
      />
      <CronResultCard title={t('label.result')} result={humanReadable || '-'} />
      <CronGuideGrid
        minuteLabel={t('label.minute')}
        hourLabel={t('label.hour')}
        dayLabel={t('label.day')}
        monthLabel={t('label.month')}
        weekdayLabel={t('label.weekday')}
      />
    </div>
  );
}

export default CronGeneratorClient;
