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
} as const;

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

export function isMarkdownRequest(acceptHeader: string | null) {
  return /(^|,|\s|;)text\/markdown(\s|;|,|$)/i.test(acceptHeader ?? '');
}

export function isDiscoveryBypassPath(pathname: string) {
  return (
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
  ];

  linkValues.forEach((value) => headers.append('Link', value));
  headers.set('Content-Signal', CONTENT_SIGNAL_POLICY);
  headers.set(
    'Vary',
    mergeHeaderValues(headers.get('Vary'), ['Accept', 'Accept-Language', 'Cookie']),
  );
}

export function estimateMarkdownTokens(markdown: string) {
  return Math.max(1, Math.ceil(markdown.trim().length / 4));
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
    `- API docs: ${absoluteUrl(DISCOVERY_PATHS.apiDocs)}`,
    `- API catalog: ${absoluteUrl(DISCOVERY_PATHS.apiCatalog)}`,
    `- Agent skills: ${absoluteUrl(DISCOVERY_PATHS.agentSkillsIndex)}`,
  ].join('\n');
}
