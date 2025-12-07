import React from 'react';
import { MenuItem, Menus, menus } from '@assets/datas/menus';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import UserInfoCard from '@components/complex/Card/UserInfoCard';
import Link from 'next/link';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language } from '~/app/i18n/settings';

export const generateMetadata: GenerateMetadata = ({ params }) =>
  translationsMetadata({ params, ns: 'menu' });

export default async function MenuPage({ params }: LanguageParams) {
  const { lng } = await params;
  const language = lng as Language;

  const { t } = await getTranslations(language, 'menu');

  const renderMenuList = (menuList: MenuItem[]) => {
    return menuList.map((menu) => {
      // Get the title in the current language, fallback to English if not available
      const title = menu.title[language as keyof typeof menu.title] || menu.title.en;

      return (
        <li key={title} className="list-none">
          <Link href={menu.link} target={menu.link.startsWith('/') ? '' : '_blank'}>
            <button
              type="button"
              className="flex items-center gap-2 w-full bg-transparent hover:bg-basic-4 active:bg-basic-5 outline-none transition ease-in duration-[40ms] rounded-md p-2 text-left t-d-1 t-basic-1"
            >
              {menu.icon}
              {title}
            </button>
          </Link>
        </li>
      );
    });
  };

  const renderMenuGroup = (menuMap: Menus) => {
    return Object.entries(menuMap).map(([key, menuList]) => {
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
        <UserInfoCard lng={language} />
        {renderMenuGroup(menus)}
      </div>
    </>
  );
}
