import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticPropsContext } from 'next';
import Opengraph from 'components/legacy/basic/Opengraph';
import Image from 'next/legacy/image';
import logoIcon from '../../../public/logo.svg';

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
    <>
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
          className="
            font-black t-t-1"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-500 via-white-500 to-point-1">
            {t('domain')}
          </span>
        </h1>
        <h2 className="t-t-2 max-w-md dark:text-white">{t('title')}</h2>
        <p className="t-d-1 t-basic-3">{t('subTitle')}</p>
      </div>

      <div className="flex justify-center">
        <Image priority src={logoIcon} alt={'logo'} width={250} height={250} />
      </div>
    </>
  );
}

export const getStaticProps = async ({ locale }: GetStaticPropsContext) => ({
  props: {
    ...(await serverSideTranslations(locale ? locale : '', ['common', 'index'])),
  },
});

export default Home;
