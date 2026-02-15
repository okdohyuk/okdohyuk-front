'use client';

import React, { useMemo, useState } from 'react';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import { analyzePasswordStrength } from '../utils/passwordStrength';

interface PasswordStrengthCheckerClientProps {
  lng: Language;
}

const strengthColors = [
  'bg-red-400',
  'bg-orange-400',
  'bg-yellow-400',
  'bg-lime-400',
  'bg-emerald-400',
  'bg-emerald-500',
];

export default function PasswordStrengthCheckerClient({ lng }: PasswordStrengthCheckerClientProps) {
  const { t } = useTranslation(lng, 'password-strength-checker');
  const [value, setValue] = useState('');
  const [visible, setVisible] = useState(false);

  const analysis = useMemo(() => analyzePasswordStrength(value), [value]);
  const strengthLabel = t(`strength.${analysis.labelKey}`);
  const meterWidth = `${(analysis.score / 5) * 100}%`;

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <label
          htmlFor="password-input"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {t('label.input')}
        </label>
        <div className="flex items-center gap-2">
          <Input
            id="password-input"
            type={visible ? 'text' : 'password'}
            value={value}
            placeholder={t('placeholder')}
            onChange={(event) => setValue(event.target.value)}
          />
          <Button
            type="button"
            className="min-w-[64px] px-2 py-2 text-xs"
            onClick={() => setVisible((prev) => !prev)}
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
            <span className="ml-1">{visible ? t('label.hide') : t('label.show')}</span>
          </Button>
        </div>
        <div className="flex items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{t('helper')}</span>
          <Button
            type="button"
            className="px-2 py-1 text-xs"
            onClick={() => setValue('')}
            disabled={!value}
          >
            {t('button.clear')}
          </Button>
        </div>
      </div>

      <div className={cn(SERVICE_PANEL, SERVICE_CARD_INTERACTIVE, 'space-y-4 p-4')}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-point-1" size={18} />
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {t('strength.label')}
            </Text>
          </div>
          <Text className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {value ? strengthLabel : t('strength.empty')}
          </Text>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              strengthColors[analysis.score],
            )}
            style={{ width: value ? meterWidth : '0%' }}
          />
        </div>
        {analysis.warnings.length > 0 && (
          <div className="space-y-1 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
            {analysis.warnings.map((warning) => (
              <div key={warning}>• {t(warning)}</div>
            ))}
          </div>
        )}
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <Text className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {t('criteria.title')}
        </Text>
        <div className="grid gap-2 md:grid-cols-2">
          {analysis.checks.map((check) => (
            <div
              key={check.key}
              className={cn(
                'flex items-center justify-between rounded-xl border px-3 py-2 text-xs',
                check.passed
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200'
                  : 'border-gray-200 bg-white text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400',
              )}
            >
              <span>{t(`criteria.${check.key}`)}</span>
              <span>{check.passed ? t('criteria.pass') : t('criteria.fail')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-2 p-4')}>
        <Text className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {t('tips.title')}
        </Text>
        <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
          <li>• {t('tips.item1')}</li>
          <li>• {t('tips.item2')}</li>
          <li>• {t('tips.item3')}</li>
        </ul>
      </div>
    </div>
  );
}
