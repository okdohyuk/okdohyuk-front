import React from 'react';
import PercentCalculatorCard from '@components/Card/PercentCalculatorCard';
import Opengraph from '@components/opengraph';
import { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

const PercentPage = () => {
  const { t } = useTranslation('percent');

  return (
    <div className={'w-full min-h-screen dark:bg-black pb-[70px] lg:pb-auto'}>
      <Opengraph
        title={t('openGraph.title')}
        ogTitle={t('openGraph.ogTitle')}
        description={t('openGraph.description')}
      />
      <div className="flex flex-col items-center gap-6 text-center px-4 py-12 lg:py-24">
        <h1
          className={
            'font-bold text-2xl max-w-md md:text-3xl lg:text-5xl lg:max-w-2xl dark:text-white'
          }
        >
          {t('title')}
        </h1>
        <section className={'w-full md:max-w-[600px] lg:max-w-[800px] flex flex-col space-y-10'}>
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
      </div>
    </div>
  );
};

export const getStaticProps = async ({ locale }: GetStaticPropsContext) => ({
  props: {
    ...(await serverSideTranslations(locale ? locale : '', ['common', 'percent'])),
  },
});

export default PercentPage;
