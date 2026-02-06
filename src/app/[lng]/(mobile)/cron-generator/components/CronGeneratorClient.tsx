'use client';

import React, { useEffect, useMemo, useState } from 'react';
import cronstrue from 'cronstrue/i18n';
import { CircleHelp } from 'lucide-react';
import { Text } from '@components/basic/Text';
import ServiceInfoNotice from '@components/complex/Service/ServiceInfoNotice';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import CronExpressionInput from './CronExpressionInput';
import CronFieldBuilder, { CronFieldMode } from './CronFieldBuilder';
import CronGuideGrid from './CronGuideGrid';
import CronResultCard from './CronResultCard';

type CronGeneratorClientProps = {
  lng: Language;
};

type CronFieldKey = 'minute' | 'hour' | 'day' | 'month' | 'weekday';

type CronFieldState = {
  enabled: boolean;
  mode: CronFieldMode;
  value: number;
};

type CronBuilderState = Record<CronFieldKey, CronFieldState>;

type CronFieldConstraint = {
  min: number;
  max: number;
};

const FIELD_CONSTRAINTS: Record<CronFieldKey, CronFieldConstraint> = {
  minute: { min: 0, max: 59 },
  hour: { min: 0, max: 23 },
  day: { min: 1, max: 31 },
  month: { min: 1, max: 12 },
  weekday: { min: 0, max: 6 },
};

const INITIAL_BUILDER_STATE: CronBuilderState = {
  minute: { enabled: false, mode: 'any', value: 0 },
  hour: { enabled: false, mode: 'any', value: 0 },
  day: { enabled: false, mode: 'any', value: 1 },
  month: { enabled: false, mode: 'any', value: 1 },
  weekday: { enabled: false, mode: 'any', value: 0 },
};

const CRONSTRUE_LOCALE: Record<Language, string> = {
  ko: 'ko',
  en: 'en',
  ja: 'ja',
  zh: 'zh_CN',
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const buildToken = (fieldState: CronFieldState, fieldKey: CronFieldKey) => {
  if (!fieldState.enabled) {
    return '*';
  }

  const { min, max } = FIELD_CONSTRAINTS[fieldKey];
  const safeValue = clamp(fieldState.value, min, max);

  if (fieldState.mode === 'any') {
    return '*';
  }

  if (fieldState.mode === 'every') {
    return `*/${Math.max(1, safeValue)}`;
  }

  return String(safeValue);
};

function CronGeneratorClient({ lng }: CronGeneratorClientProps) {
  const { t } = useTranslation(lng, 'cron-generator');
  const [builderState, setBuilderState] = useState<CronBuilderState>(INITIAL_BUILDER_STATE);
  const [humanReadable, setHumanReadable] = useState('');
  const [error, setError] = useState<string | null>(null);

  const expression = useMemo(() => {
    return [
      buildToken(builderState.minute, 'minute'),
      buildToken(builderState.hour, 'hour'),
      buildToken(builderState.day, 'day'),
      buildToken(builderState.month, 'month'),
      buildToken(builderState.weekday, 'weekday'),
    ].join(' ');
  }, [builderState]);

  const updateFieldMode = (fieldKey: CronFieldKey, mode: CronFieldMode) => {
    setBuilderState((prev) => ({
      ...prev,
      [fieldKey]: {
        ...prev[fieldKey],
        mode,
      },
    }));
  };

  const updateFieldEnabled = (fieldKey: CronFieldKey, enabled: boolean) => {
    setBuilderState((prev) => ({
      ...prev,
      [fieldKey]: {
        ...prev[fieldKey],
        enabled,
      },
    }));
  };

  const updateFieldValue = (fieldKey: CronFieldKey, value: number) => {
    const { min, max } = FIELD_CONSTRAINTS[fieldKey];

    setBuilderState((prev) => ({
      ...prev,
      [fieldKey]: {
        ...prev[fieldKey],
        value: clamp(value, min, max),
      },
    }));
  };

  useEffect(() => {
    try {
      const desc = cronstrue.toString(expression, { locale: CRONSTRUE_LOCALE[lng] });
      setHumanReadable(desc);
      setError(null);
    } catch {
      setHumanReadable('');
      setError(t('invalid'));
    }
  }, [expression, lng, t]);

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1">
        <Text variant="d2" className="font-semibold text-gray-800 dark:text-gray-100">
          {t('builder.title')}
        </Text>
      </div>
      <ServiceInfoNotice icon={<CircleHelp className="h-5 w-5" />}>
        {t('builder.description')}
      </ServiceInfoNotice>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <CronFieldBuilder
          idPrefix="cron-minute"
          label={t('label.minute')}
          enabledLabel={t('builder.enabled')}
          modeLabel={t('builder.mode')}
          valueLabel={t('builder.value')}
          anyLabel={t('builder.any')}
          everyLabel={t('builder.every')}
          atLabel={t('builder.at')}
          enabled={builderState.minute.enabled}
          mode={builderState.minute.mode}
          value={builderState.minute.value}
          min={FIELD_CONSTRAINTS.minute.min}
          max={FIELD_CONSTRAINTS.minute.max}
          onEnabledChange={(enabled) => updateFieldEnabled('minute', enabled)}
          onModeChange={(mode) => updateFieldMode('minute', mode)}
          onValueChange={(value) => updateFieldValue('minute', value)}
        />

        <CronFieldBuilder
          idPrefix="cron-hour"
          label={t('label.hour')}
          enabledLabel={t('builder.enabled')}
          modeLabel={t('builder.mode')}
          valueLabel={t('builder.value')}
          anyLabel={t('builder.any')}
          everyLabel={t('builder.every')}
          atLabel={t('builder.at')}
          enabled={builderState.hour.enabled}
          mode={builderState.hour.mode}
          value={builderState.hour.value}
          min={FIELD_CONSTRAINTS.hour.min}
          max={FIELD_CONSTRAINTS.hour.max}
          onEnabledChange={(enabled) => updateFieldEnabled('hour', enabled)}
          onModeChange={(mode) => updateFieldMode('hour', mode)}
          onValueChange={(value) => updateFieldValue('hour', value)}
        />

        <CronFieldBuilder
          idPrefix="cron-day"
          label={t('label.day')}
          enabledLabel={t('builder.enabled')}
          modeLabel={t('builder.mode')}
          valueLabel={t('builder.value')}
          anyLabel={t('builder.any')}
          everyLabel={t('builder.every')}
          atLabel={t('builder.at')}
          enabled={builderState.day.enabled}
          mode={builderState.day.mode}
          value={builderState.day.value}
          min={FIELD_CONSTRAINTS.day.min}
          max={FIELD_CONSTRAINTS.day.max}
          onEnabledChange={(enabled) => updateFieldEnabled('day', enabled)}
          onModeChange={(mode) => updateFieldMode('day', mode)}
          onValueChange={(value) => updateFieldValue('day', value)}
        />

        <CronFieldBuilder
          idPrefix="cron-month"
          label={t('label.month')}
          enabledLabel={t('builder.enabled')}
          modeLabel={t('builder.mode')}
          valueLabel={t('builder.value')}
          anyLabel={t('builder.any')}
          everyLabel={t('builder.every')}
          atLabel={t('builder.at')}
          enabled={builderState.month.enabled}
          mode={builderState.month.mode}
          value={builderState.month.value}
          min={FIELD_CONSTRAINTS.month.min}
          max={FIELD_CONSTRAINTS.month.max}
          onEnabledChange={(enabled) => updateFieldEnabled('month', enabled)}
          onModeChange={(mode) => updateFieldMode('month', mode)}
          onValueChange={(value) => updateFieldValue('month', value)}
        />

        <CronFieldBuilder
          idPrefix="cron-weekday"
          label={t('label.weekday')}
          enabledLabel={t('builder.enabled')}
          modeLabel={t('builder.mode')}
          valueLabel={t('builder.value')}
          anyLabel={t('builder.any')}
          everyLabel={t('builder.every')}
          atLabel={t('builder.at')}
          enabled={builderState.weekday.enabled}
          mode={builderState.weekday.mode}
          value={builderState.weekday.value}
          min={FIELD_CONSTRAINTS.weekday.min}
          max={FIELD_CONSTRAINTS.weekday.max}
          onEnabledChange={(enabled) => updateFieldEnabled('weekday', enabled)}
          onModeChange={(mode) => updateFieldMode('weekday', mode)}
          onValueChange={(value) => updateFieldValue('weekday', value)}
        />
      </div>

      <CronExpressionInput label={t('label.expression')} expression={expression} />
      {error && <p className="animate-pulse text-sm font-medium text-red-500">{error}</p>}

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
