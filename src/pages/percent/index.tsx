import React from 'react';
import Head from 'next/head';
import { inject, observer } from 'mobx-react';
import { PercentStoreState } from '@stores/PercentStore';
import PercentCalculatorCard from '@components/Card/PercentCalculatorCard';
import { toJS } from 'mobx';

type PercentPage = {
  percentStore: PercentStoreState;
};

const PercentPage = inject('percentStore')(
  observer(({ percentStore }: PercentPage) => {
    const {
      percentageOfTotal,
      partOfTotal,
      findPercentage,
      percentageUpDown,
      findPercentageValue,
    } = toJS(percentStore);
    const { valueChange } = percentStore;

    return (
      <div className={'w-full min-h-screen dark:bg-black'}>
        <Head>
          <title>percent calculator with okdohyuk</title>
          <meta name="description" content="퍼센트 계산기를 이용해보세요 with okdohyuk" />

          <meta property="og:url" content="https://okdohyuk.dev/percent" />
          <meta property="og:type" content="website" />
          <meta property="og:title" content="퍼센트 계산기 with okdohyuk" />
          <meta property="og:description" content="퍼센트 계산기를 이용해보세요 with okdohyuk" />
          {/*<meta
            property="og:image"
            content="https://s.pstatic.net/static/www/mobile/edit/2016/0705/mobile_212852414260.png"
          />*/}

          <meta name="twitter:card" content="summary_large_image" />
          <meta property="twitter:domain" content="okdohyuk.dev" />
          <meta property="twitter:url" content="https://okdohyuk.dev/percent" />
          <meta name="twitter:title" content="퍼센트 계산기 with okdohyuk" />
          <meta name="twitter:description" content="퍼센트 계산기를 이용해보세요 with okdohyuk" />
          {/*<meta
            name="twitter:image"
            content="https://s.pstatic.net/static/www/mobile/edit/2016/0705/mobile_212852414260.png"
          />*/}
        </Head>
        <div className="flex flex-col items-center gap-6 text-center px-4 py-12 lg:py-24">
          <h1
            className={
              'font-bold text-2xl max-w-md md:text-3xl lg:text-5xl lg:max-w-2xl dark:text-white'
            }
          >
            {'Percent Calculator'}
          </h1>
          <section className={'w-full md:max-w-[600px] lg:max-w-[800px] flex flex-col space-y-10'}>
            <PercentCalculatorCard
              title={'전체값의 몇 퍼센트는 얼마인가 계산'}
              calculator={percentageOfTotal}
              placeholder={['10,000', '20', '2,000']}
              calculatorName={'percentageOfTotal'}
              text={['의', '%', '=']}
              valueChange={valueChange}
            />
            <PercentCalculatorCard
              title={'전체값에서 일부값은 몇 퍼센트인지 계산'}
              calculator={partOfTotal}
              calculatorName={'partOfTotal'}
              placeholder={['10,000', '2,000', '20']}
              text={['에서', '는', '=', '%']}
              valueChange={valueChange}
            />
            <PercentCalculatorCard
              title={'어떤 값이 다른 값으로 변동되면, 퍼센트의 변동값 계산'}
              calculator={findPercentage}
              calculatorName={'findPercentage'}
              placeholder={['80,000', '50,000', '-37.5']}
              text={['에서', '가 되면?', '=', '%']}
              valueChange={valueChange}
            />
            <PercentCalculatorCard
              title={'퍼센트의 증가 감소 계산'}
              calculator={percentageUpDown}
              calculatorName={'percentageUpDown'}
              placeholder={['10', '200', '2,000']}
              text={['에서', '%', '=']}
              valueChange={valueChange}
            />
            <PercentCalculatorCard
              title={'어떤 값이 다른 값으로 변동되면, 퍼센트의 변동값 계산'}
              calculator={findPercentageValue}
              calculatorName={'findPercentageValue'}
              placeholder={['10', '200', '2,000']}
              text={['%가', '라면?', '=']}
              valueChange={valueChange}
            />
          </section>
        </div>
      </div>
    );
  }),
);

export default PercentPage;
