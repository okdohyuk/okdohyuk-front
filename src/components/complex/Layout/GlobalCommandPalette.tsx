'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { observer } from 'mobx-react';
import { Command, Search } from 'lucide-react';
import { menus } from '@assets/datas/menus';
import { Input } from '@components/basic/Input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import useStore from '@hooks/useStore';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language, languages } from '~/app/i18n/settings';

type SearchPageItem = {
  path: string;
  title: string;
  subtitle: string;
};

const ADMIN_ONLY_PREFIXES = ['/admin'];

let sitemapPathCache: string[] | null = null;

const normalizePath = (rawPath: string) => {
  const withoutQuery = rawPath.split('?')[0].split('#')[0].trim();
  if (!withoutQuery) return '/';
  if (withoutQuery === '/') return '/';
  return withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
};

const removeLocalePrefix = (path: string) => path.replace(/^\/(ko|en|ja|zh)(?=\/|$)/, '') || '/';

const titleByPath = new Map(
  menus.service.map((menu) => [
    menu.link,
    {
      ko: menu.title.ko,
      en: menu.title.en,
      ja: menu.title.ja,
      zh: menu.title.zh,
    },
  ]),
);

const toAbsoluteUrl = (path: string) => {
  if (path.startsWith('http')) {
    return path;
  }

  if (typeof window !== 'undefined') {
    return new URL(path, window.location.origin).toString();
  }

  return path;
};

const extractSitemapLocs = (xmlText: string) => {
  const xmlDoc = new DOMParser().parseFromString(xmlText, 'application/xml');
  const locNodes = Array.from(xmlDoc.getElementsByTagName('loc'));
  return locNodes
    .map((node) => node.textContent?.trim())
    .filter((value): value is string => Boolean(value));
};

const collectSitemapPaths = async (): Promise<string[]> => {
  if (sitemapPathCache) {
    return sitemapPathCache;
  }

  const indexResponse = await fetch('/sitemap.xml');
  if (!indexResponse.ok) {
    throw new Error('Failed to load sitemap.xml');
  }

  const indexXml = await indexResponse.text();
  const sitemapLocs = extractSitemapLocs(indexXml);

  const nestedXmlUrls = sitemapLocs.filter((loc) => /sitemap.*\.xml|server-sitemap\.xml/.test(loc));

  const urlCandidates = nestedXmlUrls.length > 0 ? nestedXmlUrls : ['/sitemap.xml'];

  const allPageLocs: string[] = [];

  await Promise.all(
    urlCandidates.map(async (urlCandidate) => {
      const response = await fetch(toAbsoluteUrl(urlCandidate));
      if (!response.ok) {
        return;
      }
      const xml = await response.text();
      const locs = extractSitemapLocs(xml);
      allPageLocs.push(...locs);
    }),
  );

  const paths = allPageLocs
    .map((loc) => {
      try {
        return normalizePath(new URL(loc).pathname);
      } catch {
        return normalizePath(loc);
      }
    })
    .filter((path) => !path.includes('sitemap.xml'))
    .filter((path) => !path.startsWith('/server-sitemap.xml'))
    .filter((path) => path !== '/404')
    .filter((path) => path !== '/500');

  sitemapPathCache = Array.from(new Set(paths)).sort((a, b) => a.localeCompare(b));
  return sitemapPathCache;
};

const isAccessiblePath = (path: string, role?: string) => {
  const localizedPath = removeLocalePrefix(path);

  if (
    ADMIN_ONLY_PREFIXES.some(
      (prefix) => localizedPath === prefix || localizedPath.startsWith(`${prefix}/`),
    )
  ) {
    return role === 'ADMIN' || role === 'Admin';
  }

  return true;
};

const fallbackTitleFromPath = (path: string) => {
  const normalized = removeLocalePrefix(path);
  if (normalized === '/') {
    return 'Home';
  }

  const lastSegment = normalized.split('/').filter(Boolean).pop();
  if (!lastSegment) {
    return 'Page';
  }

  return decodeURIComponent(lastSegment)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

function GlobalCommandPalette() {
  const pathname = usePathname();
  const { push } = useRouter();
  const { user } = useStore('userStore');

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [paths, setPaths] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const language = useMemo<Language>(() => {
    const locale = pathname?.split('/')[1];
    return (languages.includes(locale as Language) ? locale : 'ko') as Language;
  }, [pathname]);

  const { t } = useTranslation(language, 'menu');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isCommandK = event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey);

      if (!isCommandK) {
        return;
      }

      event.preventDefault();
      setOpen((prev) => !prev);
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!open || paths.length > 0 || loading) {
      return;
    }

    setLoading(true);
    collectSitemapPaths()
      .then(setPaths)
      .finally(() => setLoading(false));
  }, [loading, open, paths.length]);

  const items = useMemo<SearchPageItem[]>(() => {
    const keyword = query.trim().toLowerCase();

    return paths
      .filter((path) => isAccessiblePath(path, user?.role))
      .map((path) => {
        const localPath = removeLocalePrefix(path);
        const localizedPath = localPath === '/' ? `/${language}` : `/${language}${localPath}`;
        const translatedTitle = titleByPath.get(localPath)?.[language];
        const title = translatedTitle ?? fallbackTitleFromPath(path);

        return {
          path: localizedPath,
          title,
          subtitle: localPath,
        };
      })
      .filter((item) => {
        if (!keyword) {
          return true;
        }

        const haystack = [item.title, item.subtitle].join(' ').toLowerCase();
        return haystack.includes(keyword);
      })
      .slice(0, 20);
  }, [language, paths, query, user?.role]);

  const moveToPath = (path: string) => {
    setOpen(false);
    setQuery('');
    push(path);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="border-zinc-200 bg-white p-0 sm:max-w-2xl dark:border-zinc-700 dark:bg-zinc-900">
        <DialogHeader className="border-b border-zinc-200 px-5 pb-4 pt-5 dark:border-zinc-700">
          <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
            <Command className="h-4 w-4" />
            {t('commandPalette.title')}
          </DialogTitle>
          <DialogDescription>{t('commandPalette.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-5 pb-5 pt-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('commandPalette.placeholder')}
              className="min-h-11 rounded-2xl pl-10"
            />
          </div>

          <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
            {loading ? (
              <p className="px-2 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                {t('commandPalette.loading')}
              </p>
            ) : null}

            {!loading && items.length === 0 ? (
              <p className="px-2 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                {t('commandPalette.empty')}
              </p>
            ) : null}

            {items.map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => moveToPath(item.path)}
                className={cn(
                  'w-full rounded-xl border border-zinc-200 bg-white/80 px-3 py-2 text-left transition-colors hover:border-point-2 hover:bg-point-4/40 dark:border-zinc-700 dark:bg-zinc-800/80 dark:hover:border-point-1/60 dark:hover:bg-point-1/10',
                  pathname === item.path &&
                    'border-point-2/80 bg-point-4/60 dark:border-point-1/70 dark:bg-point-1/20',
                )}
              >
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {item.title}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.subtitle}</p>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default observer(GlobalCommandPalette);
