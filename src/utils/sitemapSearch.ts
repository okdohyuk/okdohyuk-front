import { Language, languages } from '~/app/i18n/settings';

export type SitemapRoute = {
  path: string;
  locale: Language;
};

const SITEMAP_URLS = ['/sitemap.xml', '/server-sitemap.xml'];

const normalizePathname = (rawPath: string) => {
  if (!rawPath.startsWith('/')) {
    return `/${rawPath}`;
  }
  return rawPath;
};

const parseUrlSet = (xmlText: string) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, 'application/xml');
  return Array.from(xml.querySelectorAll('url > loc'))
    .map((node) => node.textContent?.trim())
    .filter((value): value is string => Boolean(value));
};

const parseSitemapIndex = (xmlText: string) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, 'application/xml');
  return Array.from(xml.querySelectorAll('sitemap > loc'))
    .map((node) => node.textContent?.trim())
    .filter((value): value is string => Boolean(value));
};

const toRelativePath = (input: string) => {
  try {
    const url = new URL(input);
    return normalizePathname(url.pathname);
  } catch {
    return normalizePathname(input);
  }
};

const toLocalizedRoute = (path: string): SitemapRoute | null => {
  const segments = path.split('/').filter(Boolean);
  const firstSegment = segments[0];

  if (!firstSegment || !languages.includes(firstSegment as Language)) {
    return null;
  }

  return {
    path,
    locale: firstSegment as Language,
  };
};

async function collectSitemapUrls(path: string, visited: Set<string>): Promise<string[]> {
  if (visited.has(path)) {
    return [];
  }

  visited.add(path);

  const response = await fetch(path, { credentials: 'same-origin' });
  if (!response.ok) {
    return [];
  }

  const xmlText = await response.text();
  const nestedSitemaps = parseSitemapIndex(xmlText);
  if (nestedSitemaps.length === 0) {
    return parseUrlSet(xmlText);
  }

  const nestedResults = await Promise.all(
    nestedSitemaps.map((loc) => collectSitemapUrls(toRelativePath(loc), visited)),
  );

  return nestedResults.flat();
}

export async function loadSitemapRoutes(): Promise<SitemapRoute[]> {
  const allUrls = (
    await Promise.all(
      SITEMAP_URLS.map((entry) => collectSitemapUrls(entry, new Set<string>()).catch(() => [])),
    )
  ).flat();

  const uniquePaths = Array.from(new Set(allUrls.map((value) => toRelativePath(value))));
  return uniquePaths
    .map((path) => toLocalizedRoute(path))
    .filter((entry): entry is SitemapRoute => entry !== null);
}
