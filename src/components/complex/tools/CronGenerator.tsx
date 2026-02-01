'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@components/basic/Input';
import cronstrue from 'cronstrue/i18n';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';

interface CronGeneratorProps {
  lng: Language;
}

const CronGenerator: React.FC<CronGeneratorProps> = ({ lng }) => {
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
      
      // Map app locales to cronstrue supported locales if necessary
      // cronstrue supports 'en', 'ko', 'zh_CN', 'ja' etc.
      let locale = 'en';
      if (lng === 'ko') locale = 'ko';
      else if (lng === 'zh') locale = 'zh_CN';
      else if (lng === 'ja') locale = 'ja';

      const desc = cronstrue.toString(trimmed, { locale });
      setHumanReadable(desc);
      setError(null);
    } catch (e) {
      setHumanReadable('');
      setError(t('invalid'));
    }
  }, [expression, t, lng]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="cron-input"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Cron Expression
        </label>
        <Input
          id="cron-input"
          className="font-mono text-lg"
          placeholder="* * * * *"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
        />
        {error && (
          <p className="text-sm text-red-500 font-medium animate-pulse">{error}</p>
        )}
      </div>

      <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          {t('label.result')}
        </h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {humanReadable || '-'}
        </p>
      </div>

      <div className="grid grid-cols-5 gap-2 text-center text-xs text-gray-500 dark:text-gray-400">
        <div className="p-2 border rounded bg-white dark:bg-gray-800">
          <div className="font-bold mb-1">{t('label.minute')}</div>
          0-59
        </div>
        <div className="p-2 border rounded bg-white dark:bg-gray-800">
          <div className="font-bold mb-1">{t('label.hour')}</div>
          0-23
        </div>
        <div className="p-2 border rounded bg-white dark:bg-gray-800">
          <div className="font-bold mb-1">{t('label.day')}</div>
          1-31
        </div>
        <div className="p-2 border rounded bg-white dark:bg-gray-800">
          <div className="font-bold mb-1">{t('label.month')}</div>
          1-12
        </div>
        <div className="p-2 border rounded bg-white dark:bg-gray-800">
          <div className="font-bold mb-1">{t('label.weekday')}</div>
          0-6
        </div>
      </div>
    </div>
  );
};

export default CronGenerator;
