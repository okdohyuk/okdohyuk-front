import { NextResponse } from 'next/server';
import { CONTENT_SIGNAL_POLICY, SITE_URL } from '@libs/shared/agentDiscovery';

const AI_SEARCH_ALLOWED_AGENTS = [
  'Googlebot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'PerplexityBot',
  'Perplexity-User',
  'Claude-SearchBot',
  'Claude-User',
  'Applebot',
] as const;

const AI_TRAINING_BLOCKED_AGENTS = [
  'CCBot',
  'Google-Extended',
  'GPTBot',
  'ClaudeBot',
  'Bytespider',
] as const;

export async function GET() {
  const searchAllowBlocks = AI_SEARCH_ALLOWED_AGENTS.flatMap((agent) => [
    `User-agent: ${agent}`,
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /admin/*',
    '',
  ]);

  const trainingDisallowBlocks = AI_TRAINING_BLOCKED_AGENTS.flatMap((agent) => [
    `User-agent: ${agent}`,
    'Disallow: /',
    '',
  ]);

  const body = [
    '# Public crawling policy',
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /admin/*',
    `Content-Signal: ${CONTENT_SIGNAL_POLICY}`,
    '',
    '# AI Search & Citation Crawlers (Allowed)',
    ...searchAllowBlocks,
    '# Unrequested AI Training Scrapers (Disallowed)',
    ...trainingDisallowBlocks,
    '# Host',
    `Host: ${SITE_URL}`,
    '',
    '# Sitemaps',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    `Sitemap: ${SITE_URL}/server-sitemap.xml`,
    '',
  ].join('\n');

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
