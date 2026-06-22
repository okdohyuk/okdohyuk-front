'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from '@components/basic/Link';
import { ArrowUpRight, Search, X } from 'lucide-react';
import { MenuItem, menus } from '@assets/datas/menus';
import {
  SERVICE_SECTION_ORDER,
  ServiceSectionKey,
  getServiceSectionKey,
} from '@assets/datas/serviceCategories';
import { Input } from '@components/basic/Input';
import CursorGlowCard from '@components/complex/Service/CursorGlowCard';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import { cn } from '@utils/cn';
import { sendGAEvent } from '@libs/client/gtag';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';

type MenuDirectoryClientProps = {
  lng: Language;
};

type SectionKey = ServiceSectionKey | 'external' | 'archive';

type MenuSection = {
  key: SectionKey;
  title: string;
  description: string;
  items: MenuItem[];
};

const getLinkPreview = (link: string) => {
  if (link.startsWith('/')) {
    return link.slice(1) || '/';
  }

  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return link;
  }
};

const normalizeKeyword = (value: string) => value.trim().toLowerCase();

const getToolId = (link: string) => {
  if (link.startsWith('/')) {
    return link.replace(/^\//, '') || '/';
  }
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return link;
  }
};

const matchesKeyword = (menu: MenuItem, lng: Language, keyword: string) => {
  if (!keyword) {
    return true;
  }

  const haystack = [menu.title[lng], menu.title.en, menu.title.ja, menu.title.zh, menu.link]
    .join(' ')
    .toLowerCase();

  return haystack.includes(keyword);
};

export default function MenuDirectoryClient({ lng }: MenuDirectoryClientProps) {
  const { t } = useTranslation(lng, 'menu');
  const [query, setQuery] = useState('');

  const keyword = normalizeKeyword(query);

  const sections = useMemo(() => {
    const sectionCopy = {
      planning: {
        title: t('group.planning.title'),
        description: t('group.planning.description'),
      },
      finance: {
        title: t('group.finance.title'),
        description: t('group.finance.description'),
      },
      generator: {
        title: t('group.generator.title'),
        description: t('group.generator.description'),
      },
      textData: {
        title: t('group.textData.title'),
        description: t('group.textData.description'),
      },
      devUtility: {
        title: t('group.devUtility.title'),
        description: t('group.devUtility.description'),
      },
      lifestyle: {
        title: t('group.lifestyle.title'),
        description: t('group.lifestyle.description'),
      },
      learning: {
        title: t('group.learning.title'),
        description: t('group.learning.description'),
      },
      external: {
        title: t('group.external.title'),
        description: t('group.external.description'),
      },
      archive: {
        title: t('group.archive.title'),
        description: t('group.archive.description'),
      },
    } satisfies Record<SectionKey, { title: string; description: string }>;

    const serviceSections: MenuSection[] = SERVICE_SECTION_ORDER.map((key) => {
      const items = menus.service.filter(
        (menu) => getServiceSectionKey(menu.link) === key && matchesKeyword(menu, lng, keyword),
      );

      return {
        key,
        title: sectionCopy[key].title,
        description: sectionCopy[key].description,
        items,
      };
    }).filter((section) => section.items.length > 0);

    const externalItems = menus.out.filter((menu) => matchesKeyword(menu, lng, keyword));
    const archiveItems = menus.trash.filter((menu) => matchesKeyword(menu, lng, keyword));

    if (externalItems.length > 0) {
      serviceSections.push({
        key: 'external',
        title: sectionCopy.external.title,
        description: sectionCopy.external.description,
        items: externalItems,
      });
    }

    if (archiveItems.length > 0) {
      serviceSections.push({
        key: 'archive',
        title: sectionCopy.archive.title,
        description: sectionCopy.archive.description,
        items: archiveItems,
      });
    }

    return serviceSections;
  }, [keyword, lng, t]);

  const totalMenuCount = menus.service.length + menus.out.length + menus.trash.length;
  const totalVisibleCount = sections.reduce((sum, section) => sum + section.items.length, 0);

  useEffect(() => {
    if (!query.trim()) return undefined;
    const timer = setTimeout(() => {
      sendGAEvent('menu_search', query.trim().slice(0, 50), {
        search_keyword: query.trim().slice(0, 50),
        results_count: totalVisibleCount,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [query, totalVisibleCount]);

  const renderMenuItem = (menu: MenuItem, sectionKey: SectionKey) => {
    const title = menu.title[lng] || menu.title.en;
    const isInternal = menu.link.startsWith('/');

    return (
      <li key={`${title}-${menu.link}`} className="list-none">
        <CursorGlowCard>
          <Link
            href={menu.link}
            hasTargetBlank={!isInternal}
            rel={isInternal ? undefined : 'noopener noreferrer'}
            prefetch={isInternal}
            analyticsKey="tool_open"
            analyticsParams={{
              tool_id: getToolId(menu.link),
              tool_category: sectionKey,
              from: query.trim() ? 'search' : 'menu_grid',
            }}
            className={cn(
              SERVICE_PANEL_SOFT,
              SERVICE_CARD_INTERACTIVE,
              'group flex items-start gap-4 rounded-2xl p-4',
            )}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-basic-3 bg-basic-0/90 text-fg-3">
              {menu.icon}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-fg-1 md:text-base">{title}</span>
                {!isInternal ? (
                  <span className="rounded-full bg-basic-3 px-2 py-0.5 text-[10px] font-bold text-fg-4">
                    {t('outBadge')}
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-fg-5">{getLinkPreview(menu.link)}</p>
            </div>
            <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-fg-6 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-point-fg" />
          </Link>
        </CursorGlowCard>
      </li>
    );
  };

  return (
    <div className="space-y-4">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4 md:p-5')}>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-fg-1">{t('search.label')}</p>
          <p className="text-xs text-fg-5">
            {keyword
              ? t('search.results', { count: totalVisibleCount })
              : t('search.browse', { count: totalMenuCount })}
          </p>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-6" />
          <Input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('search.placeholder')}
            className="min-h-11 rounded-2xl pl-10 pr-10 text-sm md:text-base"
          />
          {query ? (
            <button
              type="button"
              aria-label={t('search.clear')}
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-fg-6 transition-colors hover:bg-basic-3 hover:text-fg-3"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </section>

      {sections.length > 0 ? (
        sections.map((section) => (
          <section key={section.key} className={cn(SERVICE_PANEL_SOFT, 'space-y-4 p-4 md:p-5')}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-lg font-extrabold text-fg-1">{section.title}</h2>
                <p className="text-sm text-fg-5">{section.description}</p>
              </div>
              <span className="rounded-full bg-point-4/70 px-2.5 py-1 text-xs font-bold text-point-fg dark:bg-point-1/20">
                {section.items.length}
              </span>
            </div>
            <ul className="space-y-3">
              {section.items.map((menu) => renderMenuItem(menu, section.key))}
            </ul>
          </section>
        ))
      ) : (
        <section className={cn(SERVICE_PANEL_SOFT, 'space-y-2 p-5 text-center')}>
          <h2 className="text-base font-bold text-fg-1">{t('search.emptyTitle')}</h2>
          <p className="text-sm text-fg-5">{t('search.emptyDescription')}</p>
        </section>
      )}
    </div>
  );
}
