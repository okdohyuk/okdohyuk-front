import { NextResponse } from 'next/server';
import { fetchAllPublicBlogs, fetchFullBlogsWithConcurrency } from '@libs/server/blogFeedUtils';
import {
  absoluteUrl,
  CONTENT_SIGNAL_POLICY,
  DISCOVERY_PATHS,
  SITE_URL,
} from '@libs/shared/agentDiscovery';
import { fallbackLng } from '~/app/i18n/settings';

export const revalidate = 3600;

const FETCH_CONCURRENCY = 8;

export async function GET() {
  let fullEntries: Awaited<ReturnType<typeof fetchFullBlogsWithConcurrency>> = [];

  try {
    const summaries = await fetchAllPublicBlogs();
    fullEntries = await fetchFullBlogsWithConcurrency(summaries, FETCH_CONCURRENCY);
  } catch {
    fullEntries = [];
  }

  const headerLines = [
    '# okdohyuk.dev — Full Technical Blog Corpus (llms-full.txt)',
    '',
    '> Complete Markdown corpus of public engineering articles published on okdohyuk.dev by Dohyuk You.',
    `> Summary index: ${absoluteUrl(DISCOVERY_PATHS.llmsTxt)}`,
    `> RSS feed: ${absoluteUrl(DISCOVERY_PATHS.rssXml)}`,
    '',
  ];

  const postSections = fullEntries.map(({ summary, detail }) => {
    const title = detail?.title ?? summary.title;
    const urlSlug = detail?.urlSlug ?? summary.urlSlug;
    const canonicalUrl = `${SITE_URL}/${fallbackLng}/blog/${urlSlug}`;
    const createdAt = detail?.createdAt ?? summary.createdAt;
    const updatedAt = detail?.updatedAt ?? summary.updatedAt ?? createdAt;
    const category =
      detail?.categoryChain && detail.categoryChain.length > 0
        ? detail.categoryChain.join(' > ')
        : (summary.category ?? 'General');
    const tags = detail?.tags ?? summary.tags ?? [];
    const contents = detail?.contents ?? summary.contents;

    return [
      '---',
      `## ${title}`,
      `- URL: ${canonicalUrl}`,
      `- Markdown URL: ${canonicalUrl}.md`,
      ...(createdAt ? [`- Published: ${createdAt}`] : []),
      ...(updatedAt ? [`- Updated: ${updatedAt}`] : []),
      `- Category: ${category}`,
      ...(tags.length > 0 ? [`- Tags: ${tags.join(', ')}`] : []),
      '',
      contents,
      '',
    ].join('\n');
  });

  const body = [...headerLines, ...postSections].join('\n').trimEnd().concat('\n');

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'Content-Signal': CONTENT_SIGNAL_POLICY,
    },
  });
}
