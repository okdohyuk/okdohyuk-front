import { blogApi } from '@api';
import { Blog, BlogSearch } from '@api/Blog';

const FEED_PAGE_SIZE = 100;
const MAX_FEED_PAGES = 50;
const DEFAULT_CONCURRENCY = 8;
const FALLBACK_ISO_DATE = '2026-01-01T00:00:00.000Z';

export function toSafeIsoDate(dateStr?: string, fallbackIso: string = FALLBACK_ISO_DATE): string {
  if (!dateStr) {
    return fallbackIso;
  }

  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) {
    return fallbackIso;
  }

  return parsed.toISOString();
}

export function toSafeRfc2822Date(dateStr?: string): string {
  if (!dateStr) {
    return new Date(FALLBACK_ISO_DATE).toUTCString();
  }

  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) {
    return new Date(FALLBACK_ISO_DATE).toUTCString();
  }

  return parsed.toUTCString();
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function fetchAllPublicBlogs(): Promise<BlogSearch[]> {
  const collected: BlogSearch[] = [];
  const seenSlugs = new Set<string>();

  for (let page = 0; page < MAX_FEED_PAGES; page += 1) {
    // eslint-disable-next-line no-await-in-loop
    const { data } = await blogApi.getBlogSearch(page, FEED_PAGE_SIZE);
    const items = data?.results ?? [];

    items.forEach((item) => {
      if (item && item.urlSlug && !seenSlugs.has(item.urlSlug)) {
        seenSlugs.add(item.urlSlug);
        collected.push(item);
      }
    });

    if (data?.isLast || items.length < FEED_PAGE_SIZE) {
      break;
    }
  }

  return collected;
}

export async function fetchFullBlogsWithConcurrency(
  blogs: BlogSearch[],
  concurrency: number = DEFAULT_CONCURRENCY,
): Promise<Array<{ summary: BlogSearch; detail: Blog | null }>> {
  const results: Array<{ summary: BlogSearch; detail: Blog | null }> = [];
  const batchSize = Math.max(1, concurrency);

  for (let i = 0; i < blogs.length; i += batchSize) {
    const slice = blogs.slice(i, i + batchSize);
    // eslint-disable-next-line no-await-in-loop
    const chunkResults = await Promise.all(
      slice.map(async (summary) => {
        try {
          const { data } = await blogApi.getBlogUrlSlug(summary.urlSlug);
          return { summary, detail: data };
        } catch {
          return { summary, detail: null };
        }
      }),
    );

    results.push(...chunkResults);
  }

  return results;
}
