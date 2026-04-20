import { NextResponse } from 'next/server';
import { CONTENT_SIGNAL_POLICY, SITE_URL } from '@libs/shared/agentDiscovery';

export async function GET() {
  const body = [
    '# Public crawling policy',
    'User-agent: *',
    'Allow: /',
    `Content-Signal: ${CONTENT_SIGNAL_POLICY}`,
    '',
    '# Private admin surfaces',
    'User-agent: *',
    'Disallow: /admin',
    'Disallow: /admin/*',
    `Content-Signal: ${CONTENT_SIGNAL_POLICY}`,
    '',
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
