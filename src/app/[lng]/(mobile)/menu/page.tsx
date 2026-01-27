import React from 'react';
import { MenuItem, Menus, menus } from '@assets/datas/menus';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import UserInfoCard from '@components/complex/Card/UserInfoCard';
import Link from 'next/link';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import { H1, H2, Text } from '@components/basic/Text';
import { Button } from '@components/basic/Button';

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

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
          <Link
            href={menu.link}
            target={menu.link.startsWith('/') ? '' : '_blank'}
            prefetch={menu.link.startsWith('/')}
          >
            <Button
              type="button"
              className="w-full justify-start rounded-md bg-transparent p-2 outline-none transition duration-[40ms] ease-in hover:bg-basic-4 active:bg-basic-5"
            >
              <Text className="flex gap-2 items-center w-full justify-start text-left t-basic-1">
                {menu.icon}
                {title}
              </Text>
            </Button>
          </Link>
        </li>
      );
    });
  };

  const renderMenuGroup = (menuMap: Menus) => {
    return Object.entries(menuMap).map(([key, menuList]) => {
      return (
        <section key={key} className="mb-4 rounded-md bg-basic-3 p-2">
          <H2 variant="t3" className="t-basic-1">
            {t(key)}
          </H2>
          <ul className="space-y-2">{renderMenuList(menuList)}</ul>
        </section>
      );
    });
  };

  return (
    <>
      <H1 className="mb-4 t-basic-1">{t('title')}</H1>
      <div className="lg:columns-2">
        <UserInfoCard lng={language} />
        {renderMenuGroup(menus)}
      </div>
    </>
  );
}
