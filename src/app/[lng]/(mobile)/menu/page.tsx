import React from 'react';
import { MenuItem, Menus, menus } from '@assets/datas/menus';
import { useTranslation } from '~/app/i18n';
import { Language } from '~/app/i18n/settings';
import { translationsMetadata, GenerateMetadata } from '@libs/server/customMetadata';
import UserInfoCard from '@components/complex/Card/UserInfoCard';
import Link from 'next/link';

export const generateMetadata: GenerateMetadata = ({ params }) =>
  translationsMetadata({ params, ns: 'menu' });

async function MenuPage({ params: { lng } }: { params: { lng: Language } }) {
  const { t } = await useTranslation(lng, 'menu');

  const renderMenuList = (menuList: MenuItem[]) => {
    return menuList.map((menu) => (
      <li key={menu.title} className="list-none">
        <Link href={menu.link} target={menu.link.startsWith('/') ? '' : '_blank'}>
          <button className="flex items-center gap-2 w-full bg-transparent hover:bg-basic-4 active:bg-basic-5 outline-none transition ease-in duration-[40ms] rounded-md p-2 text-left t-d-1 t-basic-1">
            {menu.icon}
            {lng === 'ko' ? menu.title : menu.titlen}
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
      <h1 className="t-t-1 t-basic-1 mb-4">{t('title')}</h1>
      <div className="lg:columns-2">
        <UserInfoCard lng={lng} />
        {renderMenuGroup(menus)}
      </div>
    </>
  );
}

export default MenuPage;
