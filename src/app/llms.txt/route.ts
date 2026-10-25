import { NextResponse } from 'next/server';
import { fetchAllPublicBlogs } from '@libs/server/blogFeedUtils';
import {
  absoluteUrl,
  CONTENT_SIGNAL_POLICY,
  DISCOVERY_PATHS,
  SITE_URL,
} from '@libs/shared/agentDiscovery';
import {
  getFeaturedDiscoveryPages,
  getLocalizedPageDescription,
  getLocalizedPageTitle,
} from '@libs/shared/discoveryPages';
import MarkdownUtils from '@utils/markdownUtils';
import { fallbackLng } from '~/app/i18n/settings';

export const revalidate = 3600;

const SUMMARY_MAX_LENGTH = 140;
const FEATURED_TOOLS_LIMIT = 12;
const UNCATEGORIZED_LABEL = 'General';

export async function GET() {
  const featuredTools = getFeaturedDiscoveryPages(fallbackLng, FEATURED_TOOLS_LIMIT);

  let blogs: Awaited<ReturnType<typeof fetchAllPublicBlogs>> = [];
  try {
    blogs = await fetchAllPublicBlogs();
  } catch {
    blogs = [];
  }

  const groupedByCategory = new Map<string, typeof blogs>();
  blogs.forEach((blog) => {
    const categoryKey = blog.category?.trim() || UNCATEGORIZED_LABEL;
    const list = groupedByCategory.get(categoryKey) ?? [];
    list.push(blog);
    groupedByCategory.set(categoryKey, list);
  });

  const toolLines = featuredTools.map((page) => {
    const title = getLocalizedPageTitle(page, fallbackLng);
    const description = getLocalizedPageDescription(page, fallbackLng);
    return `- [${title}](${SITE_URL}/${fallbackLng}${page.path})${
      description ? `: ${description}` : ''
    }`;
  });

  const categorySections: string[] = [];
  groupedByCategory.forEach((items, category) => {
    categorySections.push(`### ${category}`);
    items.forEach((blog) => {
      const summary = MarkdownUtils.extractPlainTextSummary(blog.contents, SUMMARY_MAX_LENGTH);
      const postUrl = `${SITE_URL}/${fallbackLng}/blog/${blog.urlSlug}`;
      categorySections.push(
        `- [${blog.title}](${postUrl})${summary ? `: ${summary}` : ''} ([Markdown](${postUrl}.md))`,
      );
    });
    categorySections.push('');
  });

  const lines = [
    '# okdohyuk.dev',
    '',
    '> Multilingual (ko/en/ja/zh) developer multi-tool platform (48+ tools) and technical engineering blog by Dohyuk You.',
    '',
    '## Machine-Readable Feeds & Discovery',
    `- [Full Blog Corpus for LLMs (llms-full.txt)](${absoluteUrl(DISCOVERY_PATHS.llmsFullTxt)}): Complete markdown text of all public technical blog posts.`,
    `- [RSS 2.0 Feed](${absoluteUrl(DISCOVERY_PATHS.rssXml)}): Syndication feed of technical blog posts.`,
    `- [API Documentation](${absoluteUrl(DISCOVERY_PATHS.apiDocs)}): Interactive documentation for public utility APIs.`,
    `- [API Catalog](${absoluteUrl(DISCOVERY_PATHS.apiCatalog)}): RFC 9727 linkset catalog of public APIs.`,
    `- [Public OpenAPI 3.0 Spec](${absoluteUrl(DISCOVERY_PATHS.publicOpenApi)}): OpenAPI specification for public utility endpoints.`,
    `- [MCP Server Card](${absoluteUrl(DISCOVERY_PATHS.mcpServerCard)}): Model Context Protocol server metadata.`,
    `- [Agent Skills Index](${absoluteUrl(DISCOVERY_PATHS.agentSkillsIndex)}): Agent skill definitions.`,
    '',
    '## Featured Developer & Utility Tools',
    ...toolLines,
    '',
    '## Technical Blog Posts',
    ...(categorySections.length > 0 ? categorySections : ['- No public blog posts available.']),
  ];

  return new NextResponse(lines.join('\n').trimEnd().concat('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'Content-Signal': CONTENT_SIGNAL_POLICY,
    },
  });
}
