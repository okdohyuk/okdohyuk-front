import React from 'react';
import { useTranslation } from 'next-i18next';
import { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Opengraph from '@components/Basic/Opengraph';
import Link from '~/components/Basic/Link';
import {
  MdCalculate,
  MdViewList,
  MdTagFaces,
  MdOutlinePersonalVideo,
  MdPayment,
} from 'react-icons/md';
import { AiFillGithub, AiFillLinkedin, AiFillYoutube } from 'react-icons/ai';
import { useRouter } from 'next/router';

type MenuItem = {
  title: string;
  titlen: string;
  icon: React.ReactNode;
  link: string;
};

type Menus = {
  [key: string]: MenuItem[];
};

const menus: Menus = {
  service: [
    {
      title: '퍼센트계산기',
      titlen: 'Percent Calculator',
      icon: <MdCalculate />,
      link: '/percent',
    },
    {
      title: '할일',
      titlen: 'Todo',
      icon: <MdViewList />,
      link: '/todo',
    },
  ],
  out: [
    {
      title: '프로필',
      titlen: 'Profile',
      icon: <MdTagFaces />,
      link: 'https://okdohyuk.notion.site/',
    },
    {
      title: '블로그',
      titlen: 'Blog',
      icon: <MdOutlinePersonalVideo />,
      link: 'https://blog.okdohyuk.dev/',
    },
    {
      title: '깃허브',
      titlen: 'Github',
      icon: <AiFillGithub />,
      link: 'https://github.com/okdohyuk',
    },
    {
      title: '링크드인',
      titlen: 'Linkedin',
      icon: <AiFillLinkedin />,
      link: 'https://www.linkedin.com/in/okdohyuk/',
    },
    {
      title: '유튜브',
      titlen: 'Youtube',
      icon: <AiFillYoutube />,
      link: 'https://www.youtube.com/@okdohyuk',
    },
    {
      title: '후원하기',
      titlen: 'Donate',
      icon: <MdPayment />,
      link: 'https://toss.me/guksu',
    },
  ],
};

function MenuPage() {
  const { t } = useTranslation('menu');
  const { locale } = useRouter();

  const renderMenuList = (menuList: MenuItem[]) => {
    return menuList.map((menu) => (
      <li key={menu.title} className="list-none">
        <Link href={menu.link}>
          <button className="flex items-center gap-2 w-full bg-transparent hover:bg-zinc-400 active:bg-zinc-500 dark:hover:bg-zinc-700 dark:active:bg-zinc-600 outline-none transition ease-in duration-[40ms] rounded-md p-3 text-left text-lg md:text-xl lg:text-1xl dark:text-white">
            {menu.icon}
            {locale === 'ko' ? menu.title : menu.titlen}
          </button>
        </Link>
      </li>
    ));
  };

  const renderMenuGroup = (menus: Menus) => {
    return Object.entries(menus).map(([key, menuList]) => {
      return (
        <div key={key} className="mb-6">
          <h2 className="text-xl md:text-1xl lg:text-2xl dark:text-white">{t(key)}</h2>
          <ul className="space-y-2">{renderMenuList(menuList)}</ul>
        </div>
      );
    });
  };

  return (
    <>
      <Opengraph
        title={t('openGraph.title')}
        ogTitle={t('openGraph.ogTitle')}
        description={t('openGraph.description')}
      />
      <div className="bg-zinc-300 dark:bg-zinc-800 shadow-md w-full md:w-2/3 lg:w-1/2 xl:max-w-7xl h-screen mx-auto px-2 pt-safe">
        <h1 className="text-2xl md:text-3xl lg:text-4xl mb-10 dark:text-white">{t('title')}</h1>
        {renderMenuGroup(menus)}
      </div>
    </>
  );
}

export default MenuPage;

export const getStaticProps = async ({ locale }: GetStaticPropsContext) => ({
  props: {
    ...(await serverSideTranslations(locale as string, ['common', 'menu'])),
  },
});
