import React from 'react';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import ParkingFeeCalculator from '~/app/[lng]/(mobile)/parking-fee/components/ParkingFeeCalculator';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'parking-fee' });

export default async function ParkingFeePage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;

  const { t } = await getTranslations(language, 'parking-fee');

  const texts = {
    title: t('title'),
    description: t('description'),
    form: {
      entryTime: t('form.entryTime'),
      exitTime: t('form.exitTime'),
      baseMinutes: t('form.baseMinutes'),
      baseFee: t('form.baseFee'),
      unitMinutes: t('form.unitMinutes'),
      unitFee: t('form.unitFee'),
      dailyMax: t('form.dailyMax'),
    },
    helper: {
      overnight: t('helper.overnight'),
      feeRule: t('helper.feeRule'),
    },
    button: {
      copy: t('button.copy'),
      clear: t('button.clear'),
      setNow: t('button.setNow'),
    },
    result: {
      title: t('result.title'),
      duration: t('result.duration'),
      fee: t('result.fee'),
      unit: {
        minutes: t('result.unit.minutes'),
        won: t('result.unit.won'),
      },
      copied: t('result.copied'),
    },
    validation: {
      missingTime: t('validation.missingTime'),
      invalidNumber: t('validation.invalidNumber'),
      unitMinutes: t('validation.unitMinutes'),
    },
    examples: {
      title: t('examples.title'),
      items: t('examples.items', { returnObjects: true }) as string[],
    },
  };

  return <ParkingFeeCalculator lng={language} texts={texts} />;
}
