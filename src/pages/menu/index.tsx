import React from 'react';
import { useTranslation } from 'next-i18next';
import { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Opengraph from '@components/Basic/Opengraph';
import Link from '~/components/Basic/Link';

const menus = {
  service: [
    {
      title: '퍼센트계산기',
      icon: '',
      link: '/percent',
    },
    {
      title: '할일',
      icon: '',
      link: '/todo',
    },
  ],
  out: [
    {
      title: '프로필',
      icon: '',
      link: 'https://okdohyuk.notion.site/',
    },
    {
      title: '블로그',
      icon: '',
      link: 'https://blog.okdohyuk.dev/',
    },
    {
      title: '깃허브',
      icon: '',
      link: 'https://github.com/okdohyuk',
    },
    {
      title: '로켓펀치',
      icon: '',
      link: 'https://www.rocketpunch.com/@okdohyuk',
    },
    {
      title: '링크드인',
      icon: '',
      link: 'https://www.linkedin.com/in/okdohyuk/',
    },
    {
      title: '유튜브',
      icon: '',
      link: 'https://www.youtube.com/@okdohyuk',
    },
    { title: '후원하기', explanation: '🙏', link: 'https://toss.me/guksu' },
  ],
};

function MenuPage() {
  const { t } = useTranslation('menu');

  const renderMenuList = (menuList) => {
    return menuList.map((menu) => (
      <li key={menu.title} className="list-none">
        <Link href={menu.link}>
          <button className="w-full bg-transparent hover:bg-zinc-400 active:bg-zinc-500 dark:hover:bg-zinc-700 dark:active:bg-zinc-600 outline-none transition ease-in duration-[40ms] rounded-md p-3 text-left text-lg md:text-xl lg:text-1xl dark:text-white">
            {menu.title}
          </button>
        </Link>
      </li>
    ));
  };

  const renderMenuGroup = (menus) => {
    return Object.entries(menus).map(([key, menuList]) => {
      return (
        <div key={key} className="mb-6">
          <h2 className="text-xl md:text-1xl lg:text-2xl dark:text-white">{key}</h2>
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
        <h1 className="text-2xl md:text-3xl lg:text-4xl mb-10 dark:text-white">메뉴</h1>
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
