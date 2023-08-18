import React from 'react';
import PercentCalculatorCard from '@components/Complex/Card/PercentCalculatorCard';
import { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Opengraph from '@components/Basic/Opengraph';
import MobileScreenWarpper from '@components/Complex/Layouts/MobileScreenWarpper';

const PercentPage = () => {
  const { t } = useTranslation('percent');

  return (
    <>
      <Opengraph
        title={t('openGraph.title')}
        ogTitle={t('openGraph.ogTitle')}
        description={t('openGraph.description')}
      />
      <MobileScreenWarpper>
        <h1 className={'t-t-1 t-basic-1 mb-4'}>{t('title')}</h1>
        <section className={'w-full space-y-4'}>
          <PercentCalculatorCard
            title={t('percentageOfTotal.title')}
            placeholder={t('percentageOfTotal.placeholder', { returnObjects: true })}
            calculatorName={'percentageOfTotal'}
            text={t('percentageOfTotal.text', { returnObjects: true })}
          />
          <PercentCalculatorCard
            title={t('partOfTotal.title')}
            calculatorName={'partOfTotal'}
            placeholder={t('partOfTotal.placeholder', { returnObjects: true })}
            text={t('partOfTotal.text', { returnObjects: true })}
          />
          <PercentCalculatorCard
            title={t('findPercentage.title')}
            calculatorName={'findPercentage'}
            placeholder={t('findPercentage.placeholder', { returnObjects: true })}
            text={t('findPercentage.text', { returnObjects: true })}
          />
          <PercentCalculatorCard
            title={t('percentageUpDown.title')}
            calculatorName={'percentageUpDown'}
            placeholder={t('percentageUpDown.placeholder', { returnObjects: true })}
            text={t('percentageUpDown.text', { returnObjects: true })}
          />
          <PercentCalculatorCard
            title={t('findPercentageValue.title')}
            calculatorName={'findPercentageValue'}
            placeholder={t('findPercentageValue.placeholder', { returnObjects: true })}
            text={t('findPercentageValue.text', { returnObjects: true })}
          />
        </section>
      </MobileScreenWarpper>
    </>
  );
};

export const getStaticProps = async ({ locale }: GetStaticPropsContext) => ({
  props: {
    ...(await serverSideTranslations(locale ? locale : '', ['common', 'percent'])),
  },
});

export default PercentPage;
