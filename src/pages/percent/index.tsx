import React from 'react';
import Head from 'next/head';

function PercentPage() {
  return (
    <div className={'w-full min-h-screen dark:bg-black'}>
      <Head>
        <title>percent calculator with okdohyuk</title>
      </Head>
      <div className="flex flex-col items-center gap-6 text-center px-4 py-12 lg:py-24">
        <h1
          className={
            'font-bold text-2xl max-w-md md:text-3xl lg:text-5xl lg:max-w-2xl dark:text-white'
          }
        >
          {'Percent Calculator'}
        </h1>
        <section className={'w-full md:max-w-[800px] flex flex-col space-y-10'}>
          <div
            className={'w-full flex flex-col space-y-4 rounded-xl bg-zinc-300 dark:bg-zinc-800 p-5'}
          >
            <div className={'flex'}>
              <h3 className={'dark:text-white'}>전체값의 몇 퍼센트는 얼마인가 계산</h3>
            </div>
            <div className={'w-full flex justify-between'}>
              <div className={'w-2/3 flex items-center space-x-1'}>
                <input
                  dir="rtl"
                  className={'w-1/3 h-[50px] rounded-2xl p-2'}
                  placeholder={'10,000'}
                />
                <span className={'dark:text-white'}>의</span>
                <input dir="rtl" className={'w-1/3 h-[50px] rounded-2xl p-2'} placeholder={'20'} />
                <span className={'dark:text-white'}>%</span>
              </div>
              <div className={'w-1/4 flex items-center space-x-1'}>
                <span className={'dark:text-white'}>=</span>
                <input
                  dir="rtl"
                  className={'w-full h-[50px] rounded-2xl p-2'}
                  placeholder={'2,000'}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default PercentPage;
