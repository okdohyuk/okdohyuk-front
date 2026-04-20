import crypto from 'node:crypto';
import {
  absoluteUrl,
  API_BASE_URL,
  CONTENT_SIGNAL_POLICY,
  DISCOVERY_PATHS,
  DISCOVERY_VERSION,
  SITE_URL,
} from '@libs/shared/agentDiscovery';
import { searchDiscoveryPages } from '@libs/shared/discoveryPages';

const GOOGLE_AUTHORIZATION_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_SCOPE = process.env.NEXT_PUBLIC_GOOGLE_SCOPE ?? 'openid email profile';

const publicApisOpenApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'okdohyuk.dev Public Utility APIs',
    version: DISCOVERY_VERSION,
    description:
      'Public read-only utility APIs exposed by okdohyuk.dev for agent and developer workflows.',
  },
  servers: [{ url: SITE_URL }],
  tags: [
    { name: 'status', description: 'Operational status and discovery URLs.' },
    { name: 'network', description: 'IP lookup and common port inspection utilities.' },
    { name: 'time', description: 'Remote server time inspection utility.' },
  ],
  paths: {
    '/api/status': {
      get: {
        operationId: 'getStatus',
        summary: 'Get site status and discovery links',
        tags: ['status'],
        responses: {
          '200': {
            description: 'Operational status metadata.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    service: { type: 'string' },
                    timestamp: { type: 'string', format: 'date-time' },
                    links: {
                      type: 'object',
                      additionalProperties: { type: 'string', format: 'uri' },
                    },
                  },
                  required: ['status', 'service', 'timestamp', 'links'],
                },
              },
            },
          },
        },
      },
    },
    '/api/ip-lookup': {
      get: {
        operationId: 'lookupIp',
        summary: 'Look up the current client IP or forwarded IP metadata',
        tags: ['network'],
        responses: {
          '200': {
            description: 'IP metadata for the detected client IP.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ip: { type: 'string' },
                    country: { type: 'string' },
                    regionName: { type: 'string' },
                    city: { type: 'string' },
                    latitude: { type: 'number' },
                    longitude: { type: 'number' },
                    isp: { type: 'string' },
                    hostname: { type: ['string', 'null'] },
                    isMobile: { type: 'boolean' },
                    isProxy: { type: 'boolean' },
                    isHosting: { type: 'boolean' },
                  },
                  required: ['ip'],
                },
              },
            },
          },
        },
      },
    },
    '/api/ip-lookup/port-scan': {
      get: {
        operationId: 'scanCommonPorts',
        summary: 'Scan a fixed set of common ports for an IPv4 or IPv6 address',
        tags: ['network'],
        parameters: [
          {
            name: 'ip',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            description: 'Target IP address in IPv4 or IPv6 format.',
          },
        ],
        responses: {
          '200': {
            description: 'Common port status results.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ip: { type: 'string' },
                    ports: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          port: { type: 'integer' },
                          service: { type: 'string' },
                          description: { type: 'string' },
                          status: {
                            type: 'string',
                            enum: ['open', 'closed', 'filtered', 'scanning'],
                          },
                        },
                        required: ['port', 'service', 'description', 'status'],
                      },
                    },
                  },
                  required: ['ip', 'ports'],
                },
              },
            },
          },
        },
      },
    },
    '/api/server-time': {
      get: {
        operationId: 'getRemoteServerTime',
        summary: 'Resolve remote server time from the target Date response header',
        tags: ['time'],
        parameters: [
          {
            name: 'site',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            description: 'One of the built-in ticketing site identifiers or a full http/https URL.',
          },
        ],
        responses: {
          '200': {
            description: 'Remote server timestamp.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    site: { type: 'string' },
                    serverTime: { type: 'string', format: 'date-time' },
                  },
                  required: ['site', 'serverTime'],
                },
              },
            },
          },
        },
      },
    },
  },
} as const;

const apiDocumentationMarkdown = [
  '# okdohyuk.dev API docs',
  '',
  '## Discovery endpoints',
  `- API catalog: ${absoluteUrl(DISCOVERY_PATHS.apiCatalog)}`,
  `- Public OpenAPI document: ${absoluteUrl(DISCOVERY_PATHS.publicOpenApi)}`,
  `- OAuth discovery wrapper: ${absoluteUrl(DISCOVERY_PATHS.openIdConfiguration)}`,
  `- OAuth protected resource metadata: ${absoluteUrl(DISCOVERY_PATHS.oauthProtectedResource)}`,
  `- MCP server card: ${absoluteUrl(DISCOVERY_PATHS.mcpServerCard)}`,
  `- Agent skills index: ${absoluteUrl(DISCOVERY_PATHS.agentSkillsIndex)}`,
  '',
  '## Public utility APIs',
  `- GET ${absoluteUrl('/api/status')} — service status and discovery links`,
  `- GET ${absoluteUrl('/api/ip-lookup')} — current client IP metadata lookup`,
  `- GET ${absoluteUrl('/api/ip-lookup/port-scan')}?ip=8.8.8.8 — common port scan`,
  `- GET ${absoluteUrl('/api/server-time')}?site=ticketlink — remote server time`,
  '',
  '## Authentication notes',
  `- Publisher API base URL: ${API_BASE_URL}`,
  '- The current sign-in flow is Google-backed and browser-first.',
  `- Authorization starts at ${GOOGLE_AUTHORIZATION_ENDPOINT}`,
  `- Application token exchange happens at ${API_BASE_URL}/auth/google`,
  `- Token refresh happens at ${API_BASE_URL}/auth/token/{userId}`,
  '- The well-known OAuth/OIDC documents in this site expose the existing sign-in flow so agents can discover it, but the underlying API still uses a brokered token-exchange design rather than a native first-party OIDC server.',
  '',
  '## Example requests',
  '```bash',
  `curl -s ${absoluteUrl('/api/status')}`,
  `curl -s ${absoluteUrl('/api/ip-lookup')}`,
  `curl -s '${absoluteUrl('/api/ip-lookup/port-scan')}?ip=1.1.1.1'`,
  `curl -s '${absoluteUrl('/api/server-time')}?site=ticketlink'`,
  '```',
].join('\n');

const apiDocumentationHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>okdohyuk.dev API docs</title>
    <style>
      :root { color-scheme: light dark; }
      body { font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; background: #09090b; color: #f4f4f5; }
      main { max-width: 840px; margin: 0 auto; padding: 48px 20px 72px; line-height: 1.6; }
      h1, h2 { line-height: 1.2; }
      section { margin-top: 32px; padding: 24px; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; background: rgba(24,24,27,0.85); }
      a { color: #a78bfa; }
      code, pre { font-family: ui-monospace, SFMono-Regular, monospace; }
      pre { overflow-x: auto; padding: 16px; border-radius: 16px; background: rgba(0,0,0,0.35); }
      ul { padding-left: 20px; }
      .muted { color: #d4d4d8; }
    </style>
  </head>
  <body>
    <main>
      <h1>okdohyuk.dev API docs</h1>
      <p class="muted">Human-readable documentation for the site's discovery and utility APIs.</p>

      <section>
        <h2>Discovery endpoints</h2>
        <ul>
          <li><a href="${absoluteUrl(DISCOVERY_PATHS.apiCatalog)}">API catalog</a></li>
          <li><a href="${absoluteUrl(
            DISCOVERY_PATHS.publicOpenApi,
          )}">Public OpenAPI document</a></li>
          <li><a href="${absoluteUrl(
            DISCOVERY_PATHS.openIdConfiguration,
          )}">OAuth discovery wrapper</a></li>
          <li><a href="${absoluteUrl(
            DISCOVERY_PATHS.oauthProtectedResource,
          )}">OAuth protected resource metadata</a></li>
          <li><a href="${absoluteUrl(DISCOVERY_PATHS.mcpServerCard)}">MCP server card</a></li>
          <li><a href="${absoluteUrl(DISCOVERY_PATHS.agentSkillsIndex)}">Agent skills index</a></li>
        </ul>
      </section>

      <section>
        <h2>Public utility APIs</h2>
        <ul>
          <li><code>GET ${absoluteUrl(
            '/api/status',
          )}</code> — service status and discovery links</li>
          <li><code>GET ${absoluteUrl(
            '/api/ip-lookup',
          )}</code> — current client IP metadata lookup</li>
          <li><code>GET ${absoluteUrl(
            '/api/ip-lookup/port-scan',
          )}?ip=8.8.8.8</code> — common port scan</li>
          <li><code>GET ${absoluteUrl(
            '/api/server-time',
          )}?site=ticketlink</code> — remote server time</li>
        </ul>
      </section>

      <section id="authentication">
        <h2>Authentication notes</h2>
        <ul>
          <li>Publisher API base URL: <code>${API_BASE_URL}</code></li>
          <li>The current sign-in flow is Google-backed and browser-first.</li>
          <li>Authorization starts at <code>${GOOGLE_AUTHORIZATION_ENDPOINT}</code>.</li>
          <li>Application token exchange happens at <code>${API_BASE_URL}/auth/google</code>.</li>
          <li>Token refresh happens at <code>${API_BASE_URL}/auth/token/{userId}</code>.</li>
          <li>The published well-known OAuth/OIDC documents expose the current flow for discovery, but the underlying API still follows a brokered token-exchange design rather than a native first-party OIDC server.</li>
        </ul>
      </section>

      <section>
        <h2>Example requests</h2>
        <pre><code>curl -s ${absoluteUrl('/api/status')}
curl -s ${absoluteUrl('/api/ip-lookup')}
curl -s '${absoluteUrl('/api/ip-lookup/port-scan')}?ip=1.1.1.1'
curl -s '${absoluteUrl('/api/server-time')}?site=ticketlink'</code></pre>
      </section>
    </main>
  </body>
</html>`;

const agentSkillArtifacts = {
  'site-navigation': `# Site navigation skill\n\nUse this skill when an agent needs to find a public page or utility on okdohyuk.dev.\n\n## Rules\n\n- Public pages live under locale-prefixed paths such as /ko, /en, /ja, and /zh.\n- Discovery metadata is published at /.well-known/api-catalog, /.well-known/agent-skills/index.json, and /.well-known/mcp/server-card.json.\n- If you need a compact representation of a page, request it with Accept: text/markdown.\n\n## Helpful destinations\n\n- Homepage: /en\n- API docs: /docs/api\n- IP lookup: /en/ip-lookup\n- Server clock: /en/server-clock\n- JWT decoder: /en/jwt-decoder\n`,
  'utility-api': `# Utility API skill\n\nUse this skill when an agent needs the site's public read-only utility APIs.\n\n## Endpoints\n\n- GET /api/status\n- GET /api/ip-lookup\n- GET /api/ip-lookup/port-scan?ip=<address>\n- GET /api/server-time?site=<ticketlink|yes24|interpark|melon|auction|nol|https://example.com>\n\n## Discovery\n\n- API catalog: /.well-known/api-catalog\n- OpenAPI: /.well-known/openapi/public-apis.json\n- Human docs: /docs/api\n\n## Notes\n\n- These APIs are read-only and do not require authentication.\n- Responses are JSON.\n- The site also publishes markdown summaries for public HTML pages when Accept: text/markdown is sent.\n`,
} as const;

const readOnlyToolResults = {
  discovery_summary: {
    catalog: absoluteUrl(DISCOVERY_PATHS.apiCatalog),
    openApi: absoluteUrl(DISCOVERY_PATHS.publicOpenApi),
    docs: absoluteUrl(DISCOVERY_PATHS.apiDocs),
    skills: absoluteUrl(DISCOVERY_PATHS.agentSkillsIndex),
    mcp: absoluteUrl(DISCOVERY_PATHS.mcpServerCard),
  },
  utility_apis: {
    status: absoluteUrl('/api/status'),
    ipLookup: absoluteUrl('/api/ip-lookup'),
    portScan: absoluteUrl('/api/ip-lookup/port-scan'),
    serverTime: absoluteUrl('/api/server-time'),
  },
};

function sha256Digest(content: string) {
  return `sha256:${crypto.createHash('sha256').update(content).digest('hex')}`;
}

export function getPublicApisOpenApiDocument() {
  return publicApisOpenApiDocument;
}

export function getApiCatalogDocument() {
  return {
    linkset: [
      {
        anchor: absoluteUrl('/api'),
        'service-desc': [
          {
            href: absoluteUrl(DISCOVERY_PATHS.publicOpenApi),
            type: 'application/json',
          },
        ],
        'service-doc': [
          {
            href: absoluteUrl(DISCOVERY_PATHS.apiDocs),
            type: 'text/html',
          },
        ],
        status: [
          {
            href: absoluteUrl(DISCOVERY_PATHS.status),
            type: 'application/json',
          },
        ],
      },
    ],
  };
}

export function getApiDocumentationMarkdown() {
  return apiDocumentationMarkdown;
}

export function getApiDocumentationHtml() {
  return apiDocumentationHtml;
}

export function getOpenIdConfiguration() {
  return {
    issuer: SITE_URL,
    authorization_endpoint: GOOGLE_AUTHORIZATION_ENDPOINT,
    token_endpoint: `${API_BASE_URL}/auth/google`,
    jwks_uri: absoluteUrl(DISCOVERY_PATHS.jwks),
    grant_types_supported: ['implicit', 'refresh_token'],
    response_types_supported: ['token'],
    scopes_supported: GOOGLE_SCOPE.split(/\s+/).filter(Boolean),
    service_documentation: absoluteUrl(`${DISCOVERY_PATHS.apiDocs}#authentication`),
  };
}

export function getOauthProtectedResourceMetadata() {
  return {
    resource: API_BASE_URL,
    authorization_servers: [SITE_URL],
    scopes_supported: GOOGLE_SCOPE.split(/\s+/).filter(Boolean),
    bearer_methods_supported: ['header'],
  };
}

export function getJwksProxyUrl() {
  return 'https://www.googleapis.com/oauth2/v3/certs';
}

export function getAgentSkillsIndexDocument() {
  const skills = Object.entries(agentSkillArtifacts).map(([name, content]) => ({
    name,
    type: 'skill-md',
    description:
      name === 'site-navigation'
        ? 'Navigate public pages and discovery metadata on okdohyuk.dev.'
        : "Use the site's public read-only utility APIs.",
    url: absoluteUrl(`/.well-known/agent-skills/${name}/SKILL.md`),
    digest: sha256Digest(content),
  }));

  return {
    $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
    skills,
  };
}

export function getAgentSkillArtifact(name: keyof typeof agentSkillArtifacts) {
  return agentSkillArtifacts[name];
}

export function getMcpServerCardDocument() {
  return {
    $schema: 'https://static.modelcontextprotocol.io/schemas/mcp-server-card/v1.json',
    protocolVersion: '2025-06-18',
    version: 1,
    serverInfo: {
      name: 'okdohyuk-site',
      title: 'okdohyuk.dev Site Discovery',
      version: DISCOVERY_VERSION,
    },
    description:
      'Read-only MCP server exposing site discovery metadata, public pages, and utility API references.',
    documentationUrl: absoluteUrl(DISCOVERY_PATHS.apiDocs),
    transport: {
      type: 'streamable-http',
      endpoint: DISCOVERY_PATHS.mcpEndpoint,
    },
    capabilities: {
      tools: {
        listChanged: false,
      },
      resources: {},
      prompts: {},
    },
  };
}

const mcpTools = [
  {
    name: 'search_public_pages',
    title: 'Search public pages',
    description: 'Search public okdohyuk.dev pages by localized title or path.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search keywords for title or path.' },
      },
      required: ['query'],
      additionalProperties: false,
    },
  },
  {
    name: 'get_discovery_summary',
    title: 'Get discovery summary',
    description: 'Return the main discovery URLs for APIs, skills, OAuth metadata, and MCP.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: 'get_public_api_reference',
    title: 'Get public API reference',
    description: 'Return references for the public utility APIs exposed by the site.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
] as const;

function searchPublicPages(query: string) {
  return searchDiscoveryPages(query, 'en', 10).map((page) => ({
    path: page.path,
    url: absoluteUrl(`/en${page.path === '/' ? '' : page.path}`),
    titles: page.titles ?? {},
    descriptions: page.descriptions ?? {},
  }));
}

function buildToolCallResult(name: string, args: Record<string, unknown>) {
  switch (name) {
    case 'search_public_pages': {
      const query = typeof args.query === 'string' ? args.query : '';
      return { query, matches: searchPublicPages(query) };
    }
    case 'get_discovery_summary':
      return readOnlyToolResults.discovery_summary;
    case 'get_public_api_reference':
      return readOnlyToolResults.utility_apis;
    default:
      return null;
  }
}

export function getMcpInitializeResult() {
  return {
    protocolVersion: '2025-06-18',
    capabilities: {
      tools: { listChanged: false },
    },
    serverInfo: {
      name: 'okdohyuk-site',
      version: DISCOVERY_VERSION,
    },
    instructions:
      'Use the read-only tools to discover public pages, APIs, and well-known metadata on okdohyuk.dev.',
  };
}

export function getMcpToolsListResult() {
  return {
    tools: mcpTools,
  };
}

export function getMcpToolCallResult(name: string, args: Record<string, unknown>) {
  const result = buildToolCallResult(name, args);

  if (!result) {
    return null;
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result, null, 2),
      },
    ],
    structuredContent: result,
    isError: false,
  };
}

export function getDefaultJsonHeaders(contentType = 'application/json; charset=utf-8') {
  const headers = new Headers({
    'Content-Type': contentType,
    'Cache-Control': 'public, max-age=0, must-revalidate',
    'Content-Signal': CONTENT_SIGNAL_POLICY,
  });

  return headers;
}
