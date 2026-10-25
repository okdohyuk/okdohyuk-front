import { NextResponse } from 'next/server';
import { escapeXml, fetchAllPublicBlogs, toSafeRfc2822Date } from '@libs/server/blogFeedUtils';
import { DISCOVERY_PATHS, SITE_URL } from '@libs/shared/agentDiscovery';
import MarkdownUtils from '@utils/markdownUtils';
import { fallbackLng } from '~/app/i18n/settings';

export const revalidate = 3600;

const RSS_DESCRIPTION_MAX_LENGTH = 200;

export async function GET() {
  let blogs: Awaited<ReturnType<typeof fetchAllPublicBlogs>> = [];
  try {
    blogs = await fetchAllPublicBlogs();
  } catch {
    blogs = [];
  }

  const latestDate = blogs[0]?.updatedAt || blogs[0]?.createdAt;
  const lastBuildDate = latestDate ? toSafeRfc2822Date(latestDate) : new Date().toUTCString();
  const feedUrl = `${SITE_URL}${DISCOVERY_PATHS.rssXml}`;
  const blogHomeUrl = `${SITE_URL}/${fallbackLng}/blog`;

  const itemsXml = blogs
    .map((blog) => {
      const postUrl = `${SITE_URL}/${fallbackLng}/blog/${blog.urlSlug}`;
      const description = MarkdownUtils.extractPlainTextSummary(
        blog.contents,
        RSS_DESCRIPTION_MAX_LENGTH,
      );
      const pubDate = toSafeRfc2822Date(blog.createdAt);
      const categoryTag = blog.category
        ? `\n      <category>${escapeXml(blog.category)}</category>`
        : '';

      return [
        '    <item>',
        `      <title>${escapeXml(blog.title)}</title>`,
        `      <link>${escapeXml(postUrl)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(postUrl)}</guid>`,
        `      <pubDate>${pubDate}</pubDate>`,
        `      <description>${escapeXml(description)}</description>${categoryTag}`,
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  const rssXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    '    <title>okdohyuk.dev Tech Blog</title>',
    `    <link>${escapeXml(blogHomeUrl)}</link>`,
    '    <description>Multilingual developer tools platform and technical engineering blog by Dohyuk You.</description>',
    `    <language>${fallbackLng}</language>`,
    `    <lastBuildDate>${lastBuildDate}</lastBuildDate>`,
    `    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />`,
    ...(itemsXml ? [itemsXml] : []),
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');

  return new NextResponse(rssXml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
