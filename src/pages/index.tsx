import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import MyLinkCard from '@components/Complex/Card/MyLinkCard';
import Opengraph from '@components/Basic/Opengraph';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticPropsContext } from 'next';
import CommonLayout from '@components/Complex/Layouts/CommonLayout';

type MyLinks = {
  title: string;
  explanation: string;
  link: string;
};

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

function Home() {
  const [deferredPrompt, setDeferredPrompt] = useState<null | BeforeInstallPromptEvent>(null);
  const { t } = useTranslation('index');

  const mylinks = t('myLinks.array', { returnObjects: true }) as MyLinks[];

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const installApp = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    });
  };

  return (
    <CommonLayout>
      <Opengraph
        isMainPage
        title={t('openGraph.title')}
        ogTitle={t('openGraph.ogTitle')}
        description={t('openGraph.description')}
      />
      {!!deferredPrompt ? (
        <button
          className={'absolute top-[16px] right-[16px] underline dark:text-white'}
          onClick={installApp}
        >
          {t('downloads')}
        </button>
      ) : null}
      <div className="flex flex-col items-center gap-6 text-center px-4 py-12 lg:py-24">
        <h1
          className="inline-block
            font-black text-4xl
            md:text-6xl
            lg:text-7xl"
        >
          <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-white-500 to-lime-500">
            {t('nickname')}
          </span>
        </h1>
        <h2
          className="font-bold text-2xl max-w-md
            md:text-3xl
            lg:text-5xl lg:max-w-2xl dark:text-white"
        >
          {t('title.primary')}
          <span className="underline decoration-dashed decoration-yellow-500 decoration-3 underline-offset-2">
            {t('title.secondary')}
          </span>
        </h2>
        <p
          className="text opacity-90 max-w-sm
            lg:text-xl lg:max-w-2xl dark:text-white"
        >
          {t('subTitle')}
        </p>
      </div>
      <div className={'px-4 lg:max-w-screen-lg md:mx-auto pb-8'}>
        <h2 className={'text-xl md:text-3xl dark:text-white'}>
          {t('myLinks.title', { returnObjects: true })}
        </h2>
        <div className={'mt-4 grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3'}>
          {mylinks.map((item: MyLinks, idx) => (
            <MyLinkCard {...item} key={idx} />
          ))}
        </div>
      </div>
    </CommonLayout>
  );
}

export const getStaticProps = async ({ locale }: GetStaticPropsContext) => ({
  props: {
    ...(await serverSideTranslations(locale ? locale : '', ['common', 'index'])),
  },
});

export default Home;
