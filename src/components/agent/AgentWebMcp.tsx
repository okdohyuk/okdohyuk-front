'use client';

import { useEffect } from 'react';
import { DISCOVERY_PATHS } from '@libs/shared/agentDiscovery';
import {
  getLocalizedPageDescription,
  getLocalizedPageTitle,
  searchDiscoveryPages,
} from '@libs/shared/discoveryPages';
import { openCommandPalette } from '@utils/commandPalette';
import { type Language } from '~/app/i18n/settings';

type AgentWebMcpProps = {
  language: Language;
};

function normalizeLocalizedPath(language: Language, inputPath: string) {
  if (inputPath.startsWith(`/${language}`)) {
    return inputPath;
  }

  if (inputPath === '/') {
    return `/${language}`;
  }

  return `/${language}${inputPath.startsWith('/') ? inputPath : `/${inputPath}`}`;
}

export default function AgentWebMcp({ language }: AgentWebMcpProps) {
  useEffect(() => {
    if (!navigator.modelContext?.registerTool) {
      return undefined;
    }

    const controller = new AbortController();

    navigator.modelContext.registerTool(
      {
        name: 'search_site_tools',
        title: 'Search site tools',
        description: 'Find public pages and utility tools available on okdohyuk.dev.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search by localized title or pathname.',
            },
          },
          required: ['query'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true },
        execute: async ({ query }) => {
          const normalizedQuery = typeof query === 'string' ? query : '';
          const matches = searchDiscoveryPages(normalizedQuery, language).map((page) => ({
            path: page.path,
            title: getLocalizedPageTitle(page, language),
            description: getLocalizedPageDescription(page, language),
            url: normalizeLocalizedPath(language, page.path),
          }));

          return {
            language,
            matches,
            discovery: {
              apiCatalog: DISCOVERY_PATHS.apiCatalog,
              apiDocs: DISCOVERY_PATHS.apiDocs,
            },
          };
        },
      },
      { signal: controller.signal },
    );

    navigator.modelContext.registerTool(
      {
        name: 'open_public_page',
        title: 'Open public page',
        description: 'Navigate the current tab to a public okdohyuk.dev page.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'A public path such as /ip-lookup, /jwt-decoder, or /.',
            },
          },
          required: ['path'],
          additionalProperties: false,
        },
        execute: ({ path }) => {
          const targetPath =
            typeof path === 'string' ? normalizeLocalizedPath(language, path) : `/${language}`;
          window.location.assign(targetPath);
          return {
            navigated: true,
            url: targetPath,
          };
        },
      },
      { signal: controller.signal },
    );

    navigator.modelContext.registerTool(
      {
        name: 'open_command_palette',
        title: 'Open command palette',
        description: 'Open the in-page command palette to search available pages manually.',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
        execute: () => {
          openCommandPalette();
          return {
            opened: true,
          };
        },
      },
      { signal: controller.signal },
    );

    return () => {
      controller.abort();
    };
  }, [language]);

  return null;
}
