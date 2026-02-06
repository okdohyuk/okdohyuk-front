import React from 'react';
import { MenuItem, Menus, menus } from '@assets/datas/menus';
import { getTranslations } from '~/app/i18n';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import UserInfoCard from '@components/complex/Card/UserInfoCard';
import Link from 'next/link';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language, languages } from '~/app/i18n/settings';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { cn } from '@utils/cn';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import ServiceInfoNotice from '@components/complex/Service/ServiceInfoNotice';
import CursorGlowCard from '@components/complex/Service/CursorGlowCard';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';

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
      const title = menu.title[language as keyof typeof menu.title] || menu.title.en;
      const isInternal = menu.link.startsWith('/');

      return (
        <li key={`${title}-${menu.link}`} className="list-none">
          <CursorGlowCard>
            <Link
              href={menu.link}
              target={isInternal ? '_self' : '_blank'}
              rel={isInternal ? undefined : 'noopener noreferrer'}
              prefetch={isInternal}
              className={cn(
                SERVICE_PANEL_SOFT,
                SERVICE_CARD_INTERACTIVE,
                'group flex items-center gap-3 p-3',
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white/90 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-200">
                {menu.icon}
              </div>
              <span className="flex min-w-[4ch] flex-1 items-center gap-2 text-left text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                <span className="min-w-[4ch] flex-1 truncate">{title}</span>
                {!isInternal ? (
                  <span className="shrink-0 rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                    {t('outBadge')}
                  </span>
                ) : null}
              </span>
              <ArrowUpRight className="h-4 w-4 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-point-1 dark:text-zinc-500" />
            </Link>
          </CursorGlowCard>
        </li>
      );
    });
  };

  const renderMenuGroup = (menuMap: Menus) => {
    return Object.entries(menuMap).map(([key, menuList]) => {
      return (
        <section
          key={key}
          className={cn(SERVICE_PANEL_SOFT, 'mb-4 p-3 md:p-4')}
          style={{ breakInside: 'avoid', WebkitColumnBreakInside: 'avoid' }}
        >
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">{t(key)}</h2>
            <span className="rounded-full bg-point-4/70 px-2.5 py-1 text-xs font-bold text-point-1 dark:bg-point-1/20">
              {menuList.length}
            </span>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">{renderMenuList(menuList)}</ul>
        </section>
      );
    });
  };

  return (
    <div className="space-y-4">
      <ServicePageHeader
        title={t('title')}
        description={t('openGraph.description')}
        badge={t('headerBadge')}
      />

      <ServiceInfoNotice icon={<Sparkles className="h-5 w-5" />}>{t('intro')}</ServiceInfoNotice>

      <div className="lg:columns-2 lg:gap-4">
        <div style={{ breakInside: 'avoid', WebkitColumnBreakInside: 'avoid' }}>
          <UserInfoCard lng={language} />
        </div>
        {renderMenuGroup(menus)}
      </div>
    </div>
  );
}
