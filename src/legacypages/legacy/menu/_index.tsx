import React from 'react';
import { GetStaticPropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';

import Link from '~/components/basic/Link';
import Opengraph from 'components/legacy/basic/Opengraph';
import { MenuItem, Menus, menus } from '@assets/datas/menus';
import MobileScreenWrapper from '@components/complex/Layout/MobileScreenWrapper';
import dynamic from 'next/dynamic';

const UserInfoCard = dynamic(() => import('@components/legacy/complex/Card/UserInfoCard'), {
  ssr: false,
});

function MenuPage() {
  const { t } = useTranslation('menu');
  const { locale } = useRouter();

  const renderMenuList = (menuList: MenuItem[]) => {
    return menuList.map((menu) => (
      <li key={menu.title} className="list-none">
        <Link href={menu.link} hasTargetBlank={menu.link.includes('http')}>
          <button className="flex items-center gap-2 w-full bg-transparent hover:bg-basic-4 active:bg-basic-5 outline-none transition ease-in duration-[40ms] rounded-md p-2 text-left t-d-1 t-basic-1">
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
        <section key={key} className="mb-4 bg-basic-3 rounded-md p-2">
          <h2 className="t-t-3 t-basic-1">{t(key)}</h2>
          <ul className="space-y-2">{renderMenuList(menuList)}</ul>
        </section>
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
      <MobileScreenWrapper>
        <h1 className="t-t-1 t-basic-1 mb-4">{t('title')}</h1>
        <div className="lg:columns-2">
          <UserInfoCard />
          {renderMenuGroup(menus)}
        </div>
      </MobileScreenWrapper>
    </>
  );
}

export default MenuPage;

export const getStaticProps = async ({ locale }: GetStaticPropsContext) => ({
  props: {
    ...(await serverSideTranslations(locale as string, ['common', 'menu'])),
  },
});
