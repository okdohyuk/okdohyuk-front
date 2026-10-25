import {
  getDiscoveryPage,
  getFeaturedDiscoveryPages,
  getLocalizedPageDescription,
  getLocalizedPageTitle,
} from '@libs/shared/discoveryPages';
import { fallbackLng, type Language, languages } from '~/app/i18n/settings';

export const SITE_URL = process.env.NEXT_PUBLIC_URL ?? 'https://okdohyuk.dev';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? `${SITE_URL}/api`;
export const DISCOVERY_VERSION = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? '2026.04.20';
export const CONTENT_SIGNAL_POLICY = 'ai-train=no, search=yes, ai-input=yes';

const TOKENS_PER_CHAR_DIVISOR = 4;

export const DISCOVERY_PATHS = {
  apiCatalog: '/.well-known/api-catalog',
  publicOpenApi: '/.well-known/openapi/public-apis.json',
  openIdConfiguration: '/.well-known/openid-configuration',
  oauthAuthorizationServer: '/.well-known/oauth-authorization-server',
  oauthProtectedResource: '/.well-known/oauth-protected-resource',
  jwks: '/.well-known/jwks.json',
  mcpServerCard: '/.well-known/mcp/server-card.json',
  agentSkillsIndex: '/.well-known/agent-skills/index.json',
  apiDocs: '/docs/api',
  mcpEndpoint: '/mcp',
  status: '/api/status',
  llmsTxt: '/llms.txt',
  llmsFullTxt: '/llms-full.txt',
  rssXml: '/rss.xml',
} as const;

const BYPASS_EXACT_PATHS = new Set<string>([
  DISCOVERY_PATHS.llmsTxt,
  DISCOVERY_PATHS.llmsFullTxt,
  DISCOVERY_PATHS.rssXml,
  '/robots.txt',
  '/sitemap.xml',
  '/server-sitemap.xml',
]);

export type BlogMarkdownSource = {
  title: string;
  urlSlug: string;
  contents: string;
  createdAt?: string;
  updatedAt?: string;
  categoryChain?: string[];
  tags?: string[];
};

const HOME_TOOLS_HEADING: Record<Language, string> = {
  ko: '대표 도구',
  en: 'Featured tools',
  ja: '注目ツール',
  zh: '推荐工具',
};

function joinPath(pathname: string) {
  if (!pathname.startsWith('/')) {
    return `/${pathname}`;
  }

  return pathname;
}

export function absoluteUrl(pathname: string) {
  return new URL(joinPath(pathname), SITE_URL).toString();
}

// 단축 링크 경로는 항상 /l/{code} 이며, 표시·복사용 절대 URL 은 백엔드 응답의 shortUrl
// (미설정 시 http://localhost:3000 으로 새는 문제) 대신 NEXT_PUBLIC_URL(SITE_URL) 기반으로
// 직접 구성한다. absoluteUrl 이 new URL 로 trailing slash 를 정규화하므로 그대로 재사용한다.
export function buildShortUrl(code: string) {
  return absoluteUrl(`/l/${code}`);
}

export function isMarkdownRequest(acceptHeader: string | null) {
  return /(^|,|\s|;)text\/markdown(\s|;|,|$)/i.test(acceptHeader ?? '');
}

export function isDiscoveryBypassPath(pathname: string) {
  return (
    BYPASS_EXACT_PATHS.has(pathname) ||
    pathname.startsWith('/.well-known') ||
    pathname.startsWith('/docs/api') ||
    pathname.startsWith('/mcp')
  );
}

export function resolveLanguageFromPath(pathname: string): Language | null {
  const segment = pathname.split('/')[1];

  return languages.find((language) => language === segment) ?? null;
}

export function stripLanguagePrefix(pathname: string) {
  const language = resolveLanguageFromPath(pathname);

  if (!language) {
    return { language: fallbackLng, routePath: pathname || '/' };
  }

  const remainder = pathname.slice(language.length + 1);
  return {
    language,
    routePath: remainder.length > 0 ? remainder : '/',
  };
}

function mergeHeaderValues(existingValue: string | null, nextValues: string[]) {
  const values = new Set(
    (existingValue ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  );

  nextValues.forEach((value) => values.add(value));

  return Array.from(values).join(', ');
}

export function appendAgentDiscoveryHeaders(headers: Headers) {
  const linkValues = [
    `<${DISCOVERY_PATHS.apiCatalog}>; rel="api-catalog"; type="application/linkset+json"`,
    `<${DISCOVERY_PATHS.publicOpenApi}>; rel="service-desc"; type="application/json"`,
    `<${DISCOVERY_PATHS.apiDocs}>; rel="service-doc"; type="text/html"`,
    `<${DISCOVERY_PATHS.agentSkillsIndex}>; rel="describedby"; type="application/json"`,
    `<${DISCOVERY_PATHS.mcpServerCard}>; rel="describedby"; type="application/json"`,
    `<${DISCOVERY_PATHS.llmsTxt}>; rel="describedby"; type="text/plain"`,
    `<${DISCOVERY_PATHS.rssXml}>; rel="alternate"; type="application/rss+xml"`,
  ];

  linkValues.forEach((value) => headers.append('Link', value));
  headers.set('Content-Signal', CONTENT_SIGNAL_POLICY);
  headers.set(
    'Vary',
    mergeHeaderValues(headers.get('Vary'), ['Accept', 'Accept-Language', 'Cookie']),
  );
}

export function estimateMarkdownTokens(markdown: string) {
  return Math.max(1, Math.ceil(markdown.trim().length / TOKENS_PER_CHAR_DIVISOR));
}

function escapeYamlString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r?\n/g, ' ');
}

export function extractBlogSlugFromPath(pathname: string): string | null {
  const { routePath } = stripLanguagePrefix(pathname);
  const match = routePath.match(/^\/blog\/([^/]+?)(?:\.md)?\/?$/i);
  if (!match || !match[1]) {
    return null;
  }

  const rawSlug = match[1];
  try {
    return decodeURIComponent(rawSlug);
  } catch {
    return rawSlug;
  }
}

export function buildBlogPostMarkdown(blog: BlogMarkdownSource, language: Language): string {
  const canonicalUrl = absoluteUrl(`/${language}/blog/${blog.urlSlug}`);
  const frontmatterLines = [
    '---',
    `title: "${escapeYamlString(blog.title)}"`,
    `url: "${canonicalUrl}"`,
    `canonical_url: "${canonicalUrl}"`,
    `language: "${language}"`,
  ];

  if (blog.createdAt) {
    frontmatterLines.push(`created_at: "${escapeYamlString(blog.createdAt)}"`);
  }
  if (blog.updatedAt || blog.createdAt) {
    frontmatterLines.push(
      `updated_at: "${escapeYamlString(blog.updatedAt ?? blog.createdAt ?? '')}"`,
    );
  }
  if (blog.categoryChain && blog.categoryChain.length > 0) {
    frontmatterLines.push(`category: "${escapeYamlString(blog.categoryChain.join(' > '))}"`);
  }
  if (blog.tags && blog.tags.length > 0) {
    const serializedTags = blog.tags.map((tag) => `"${escapeYamlString(tag)}"`).join(', ');
    frontmatterLines.push(`tags: [${serializedTags}]`);
  }

  frontmatterLines.push('---');

  return [...frontmatterLines, '', `# ${blog.title}`, '', blog.contents].join('\n');
}

export async function fetchBlogMarkdownBySlug(
  urlSlug: string,
  language: Language,
): Promise<string | null> {
  const baseUrl = API_BASE_URL.replace(/\/+$/, '');
  const endpoint = `${baseUrl}/blog/${encodeURIComponent(urlSlug)}`;

  try {
    const response = await fetch(endpoint, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as Partial<BlogMarkdownSource> | null;
    if (
      !payload ||
      typeof payload.title !== 'string' ||
      typeof payload.contents !== 'string' ||
      typeof payload.urlSlug !== 'string'
    ) {
      return null;
    }

    return buildBlogPostMarkdown(
      {
        title: payload.title,
        urlSlug: payload.urlSlug,
        contents: payload.contents,
        createdAt: payload.createdAt,
        updatedAt: payload.updatedAt,
        categoryChain: Array.isArray(payload.categoryChain) ? payload.categoryChain : [],
        tags: Array.isArray(payload.tags) ? payload.tags : [],
      },
      language,
    );
  } catch {
    return null;
  }
}

export async function fetchBlogMarkdownIfApplicable(
  language: Language,
  pathname: string,
): Promise<string | null> {
  const slug = extractBlogSlugFromPath(pathname);
  if (!slug) {
    return null;
  }

  return fetchBlogMarkdownBySlug(slug, language);
}

export function buildHomepageMarkdown(language: Language) {
  const homePage = getDiscoveryPage('/');
  const title = homePage ? getLocalizedPageTitle(homePage, language) : 'okdohyuk.dev';
  const description =
    (homePage && getLocalizedPageDescription(homePage, language)) ||
    'okdohyuk.dev multi-tool platform';
  const featuredTools = getFeaturedDiscoveryPages(language)
    .map((page) => {
      const pageTitle = getLocalizedPageTitle(page, language);
      const pageDescription = getLocalizedPageDescription(page, language) ?? '';
      return `- [${pageTitle}](${absoluteUrl(`/${language}${page.path}`)})${
        pageDescription ? ` — ${pageDescription}` : ''
      }`;
    })
    .join('\n');

  return [
    `# ${title}`,
    '',
    description,
    '',
    `- Canonical URL: ${absoluteUrl(`/${language}`)}`,
    `- LLMs index: ${absoluteUrl(DISCOVERY_PATHS.llmsTxt)}`,
    `- LLMs full corpus: ${absoluteUrl(DISCOVERY_PATHS.llmsFullTxt)}`,
    `- RSS feed: ${absoluteUrl(DISCOVERY_PATHS.rssXml)}`,
    `- API catalog: ${absoluteUrl(DISCOVERY_PATHS.apiCatalog)}`,
    `- API docs: ${absoluteUrl(DISCOVERY_PATHS.apiDocs)}`,
    `- Agent skills index: ${absoluteUrl(DISCOVERY_PATHS.agentSkillsIndex)}`,
    `- MCP server card: ${absoluteUrl(DISCOVERY_PATHS.mcpServerCard)}`,
    '',
    `## ${HOME_TOOLS_HEADING[language]}`,
    featuredTools,
    '',
    '## Agent discovery',
    `- Public API status endpoint: ${absoluteUrl(DISCOVERY_PATHS.status)}`,
    `- Public OpenAPI document: ${absoluteUrl(DISCOVERY_PATHS.publicOpenApi)}`,
    `- OAuth discovery wrapper: ${absoluteUrl(DISCOVERY_PATHS.openIdConfiguration)}`,
    `- OAuth protected resource metadata: ${absoluteUrl(DISCOVERY_PATHS.oauthProtectedResource)}`,
  ].join('\n');
}

export function buildRouteMarkdown(language: Language, pathname: string) {
  const { routePath } = stripLanguagePrefix(pathname);

  if (routePath === '/') {
    return buildHomepageMarkdown(language);
  }

  const page = getDiscoveryPage(routePath);
  const title = page ? getLocalizedPageTitle(page, language) : routePath;
  const description = page ? getLocalizedPageDescription(page, language) : null;

  return [
    `# ${title || 'Page'}`,
    '',
    ...(description ? [description, ''] : []),
    `- Page URL: ${absoluteUrl(pathname)}`,
    `- Language: ${language}`,
    `- HTML version: request this URL without \`Accept: text/markdown\`.`,
    '',
    '## Site discovery',
    `- Homepage: ${absoluteUrl(`/${language}`)}`,
    `- LLMs index: ${absoluteUrl(DISCOVERY_PATHS.llmsTxt)}`,
    `- RSS feed: ${absoluteUrl(DISCOVERY_PATHS.rssXml)}`,
    `- API docs: ${absoluteUrl(DISCOVERY_PATHS.apiDocs)}`,
    `- API catalog: ${absoluteUrl(DISCOVERY_PATHS.apiCatalog)}`,
    `- Agent skills: ${absoluteUrl(DISCOVERY_PATHS.agentSkillsIndex)}`,
  ].join('\n');
}

export async function resolveRouteMarkdown(language: Language, pathname: string): Promise<string> {
  const blogMarkdown = await fetchBlogMarkdownIfApplicable(language, pathname);
  if (blogMarkdown) {
    return blogMarkdown;
  }

  return buildRouteMarkdown(language, pathname);
}
