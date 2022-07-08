import React, { useEffect, useState } from 'react';
import MyLinkCard from '@components/Card/MyLinkCard';
import Head from 'next/head';

const myLinks = [
  {
    title: '프로필',
    explanation: '수시로 업데이트되는 프로필입니다.',
    link: 'https://me.okdohyuk.dev/',
  },
  {
    title: '블로그',
    explanation: '생각과 기록을 정리하는 장소입니다.',
    link: 'https://blog.okdohyuk.dev/',
  },
  {
    title: '깃헙 블로그',
    explanation: '주로 기술적인 내용이 올라가는 블로그 입니다.',
    link: 'https://git.okdohyuk.dev/',
  },
  {
    title: '깃허브',
    explanation: '깃허브 주소입니다.',
    link: 'https://github.com/okdohyuk',
  },
  {
    title: '로켓펀치',
    explanation: '로켓펀치 프로필 입니다.(연결신청 해주세요)',
    link: 'https://www.rocketpunch.com/@okdohyuk',
  },
  {
    title: '링크드인',
    explanation: '일단 올려봅니다.',
    link: 'https://www.linkedin.com/in/okdohyuk/',
  },
  {
    title: '유튜브',
    explanation: '먼... 미래 영상이 올라갈지도...?',
    link: 'https://www.youtube.com/channel/UC0tBq5aqIGqgjjts3kUhLwA',
  },
  {
    title: '후원하기',
    explanation: '🙏',
    link: 'https://toss.me/guksu',
  },
];

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

export default function Home() {
  const [deferredPrompt, setDeferredPrompt] = useState<null | BeforeInstallPromptEvent>(null);

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
    <div className={'w-full min-h-screen dark:bg-black'}>
      <Head>
        <title>developer okdohyuk</title>
      </Head>
      {!!deferredPrompt ? (
        <button
          className={'absolute top-[16px] right-[16px] underline dark:text-white'}
          onClick={installApp}
        >
          Downloads
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
            okdohyuk
          </span>
        </h1>
        <h2
          className="font-bold text-2xl max-w-md
            md:text-3xl
            lg:text-5xl lg:max-w-2xl dark:text-white"
        >
          High-quality{' '}
          <span className="underline decoration-dashed decoration-yellow-500 decoration-3 underline-offset-2">
            web developer.
          </span>
        </h2>
        <p
          className="text opacity-90 max-w-sm
            lg:text-xl lg:max-w-2xl dark:text-white"
        >
          {`type - safe, does not tolerate even a one pixel, one who enjoys, and have a not don't give
            up`}
        </p>
      </div>
      <div className={'px-4 lg:max-w-screen-lg md:mx-auto pb-8'}>
        <h2 className={'text-xl md:text-3xl dark:text-white'}>my links</h2>
        <div className={'mt-4 grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3'}>
          {myLinks.map((item, idx) => (
            <MyLinkCard {...item} key={idx} />
          ))}
        </div>
      </div>
    </div>
  );
}
