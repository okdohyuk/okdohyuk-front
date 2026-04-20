import { fallbackLng, type Language, languages } from '~/app/i18n/settings';
import commandPalettePages from '../../../public/command-palette-pages.json';

export type DiscoveryPage = {
  path: string;
  access: 'public' | 'admin';
  titles?: Partial<Record<Language, string>>;
  descriptions?: Partial<Record<Language, string>>;
};

type DiscoveryPagesDocument = {
  pages: DiscoveryPage[];
  generatedAt?: string;
};

const discoveryPagesDocument = commandPalettePages as DiscoveryPagesDocument;

const excludedFeaturedPaths = new Set(['/auth/login', '/blog', '/privacy', '/terms']);

export const discoveryPages = discoveryPagesDocument.pages;

export const publicDiscoveryPages = discoveryPages.filter((page) => page.access === 'public');

function pickLocalizedValue<T extends Partial<Record<Language, string>> | undefined>(
  values: T,
  language: Language,
) {
  if (!values) {
    return null;
  }

  return values[language] ?? values.en ?? values.ko ?? values[fallbackLng] ?? null;
}

export function getLocalizedPageTitle(page: DiscoveryPage, language: Language) {
  return pickLocalizedValue(page.titles, language) ?? page.path;
}

export function getLocalizedPageDescription(page: DiscoveryPage, language: Language) {
  return pickLocalizedValue(page.descriptions, language);
}

export function getDiscoveryPage(path: string) {
  return discoveryPages.find((page) => page.path === path) ?? null;
}

export function getFeaturedDiscoveryPages(language: Language, limit = 4) {
  return publicDiscoveryPages
    .filter(
      (page) =>
        page.path !== '/' &&
        !page.path.startsWith('/blog/') &&
        !excludedFeaturedPaths.has(page.path) &&
        Boolean(getLocalizedPageDescription(page, language)),
    )
    .slice(0, limit);
}

export function searchDiscoveryPages(query: string, language: Language, limit = 8) {
  const normalizedQuery = query.trim().toLowerCase();

  return publicDiscoveryPages
    .filter((page) => {
      const title = getLocalizedPageTitle(page, language);
      const description = getLocalizedPageDescription(page, language) ?? '';
      return `${title} ${description} ${page.path}`.toLowerCase().includes(normalizedQuery);
    })
    .slice(0, limit);
}

export function getSupportedLanguages() {
  return languages;
}
