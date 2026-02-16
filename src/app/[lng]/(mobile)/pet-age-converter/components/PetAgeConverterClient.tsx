'use client';

import React, { useMemo, useState } from 'react';
import { Input } from '@components/basic/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

const MAX_AGES = {
  dog: 30,
  cat: 25,
} as const;

type PetType = keyof typeof MAX_AGES;

type ValidationState = {
  isValid: boolean;
  message?: string;
};

function calculateHumanAge(petType: PetType, petAge: number) {
  if (petAge <= 0) return 0;

  if (petType === 'dog') {
    if (petAge <= 1) return petAge * 15;
    if (petAge <= 2) return 15 + (petAge - 1) * 9;
    return 24 + (petAge - 2) * 5;
  }

  if (petAge <= 1) return petAge * 15;
  if (petAge <= 2) return 15 + (petAge - 1) * 9;
  return 24 + (petAge - 2) * 4;
}

function getStageKey(petType: PetType, petAge: number) {
  if (petType === 'dog') {
    if (petAge < 1) return 'puppy';
    if (petAge < 3) return 'youngAdult';
    if (petAge < 7) return 'adult';
    return 'senior';
  }

  if (petAge < 1) return 'kitten';
  if (petAge < 7) return 'adult';
  if (petAge < 11) return 'mature';
  if (petAge < 15) return 'senior';
  return 'geriatric';
}

interface PetAgeConverterClientProps {
  lng: Language;
}

export default function PetAgeConverterClient({ lng }: PetAgeConverterClientProps) {
  const { t } = useTranslation(lng, 'pet-age-converter');
  const [petType, setPetType] = useState<PetType>('dog');
  const [ageInput, setAgeInput] = useState('');

  const parsedAge = useMemo(() => {
    if (!ageInput.trim()) return null;
    const value = Number.parseFloat(ageInput);
    return Number.isFinite(value) ? value : null;
  }, [ageInput]);

  const validation = useMemo<ValidationState>(() => {
    if (!ageInput.trim()) {
      return { isValid: false, message: t('empty') };
    }

    if (parsedAge === null || parsedAge < 0) {
      return { isValid: false, message: t('error.invalid') };
    }

    if (parsedAge > MAX_AGES[petType]) {
      return {
        isValid: false,
        message: t('error.max', { max: MAX_AGES[petType] }),
      };
    }

    return { isValid: true };
  }, [ageInput, parsedAge, petType, t]);

  const result = useMemo(() => {
    if (!validation.isValid || parsedAge === null) return null;

    const humanAge = calculateHumanAge(petType, parsedAge);
    const stageKey = getStageKey(petType, parsedAge);

    return {
      humanAge,
      stageLabel: t(`stages.${stageKey}`),
    };
  }, [parsedAge, petType, t, validation.isValid]);

  return (
    <div className="w-full space-y-6">
      <div className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4')}>
        <div className="space-y-2">
          <label
            htmlFor="pet-age-type"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.petType')}
          </label>
          <Select value={petType} onValueChange={(value) => setPetType(value as PetType)}>
            <SelectTrigger id="pet-age-type" aria-label={t('label.petType')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dog">{t('petType.dog')}</SelectItem>
              <SelectItem value="cat">{t('petType.cat')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="pet-age-input"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {t('label.age')}
          </label>
          <Input
            id="pet-age-input"
            type="text"
            inputMode="decimal"
            placeholder={t('placeholder.age')}
            value={ageInput}
            onChange={(event) => setAgeInput(event.target.value)}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('helper')}</p>
        </div>

        {validation.message ? (
          <p className="text-xs font-medium text-red-500 dark:text-red-400">{validation.message}</p>
        ) : null}
      </div>

      <div className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'space-y-3 p-4')}>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {t('result.title')}
        </h3>
        {result ? (
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-gray-900 dark:text-white">
                {result.humanAge.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t('result.yearUnit')}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t('result.stage', { stage: result.stageLabel })}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('result.empty')}</p>
        )}
      </div>
    </div>
  );
}
