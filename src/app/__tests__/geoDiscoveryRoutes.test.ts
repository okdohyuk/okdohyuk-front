import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET as getRobotsTxt } from '../robots.txt/route';
import { GET as getLlmsTxt } from '../llms.txt/route';
import { GET as getLlmsFullTxt } from '../llms-full.txt/route';
import { GET as getRssXml } from '../rss.xml/route';
import { GET as getServerSitemap } from '../server-sitemap.xml/route';

const mockFetchAllPublicBlogs = vi.fn();
const mockFetchFullBlogsWithConcurrency = vi.fn();
const mockGetServerSideSitemap = vi.fn(async (fields: unknown) => {
  return new Response(JSON.stringify(fields), {
    headers: { 'Content-Type': 'application/xml' },
  });
});

vi.mock('next-sitemap', () => ({
  getServerSideSitemap: (fields: unknown) => mockGetServerSideSitemap(fields),
}));

vi.mock('@libs/server/blogFeedUtils', async () => {
  const actual = await vi.importActual<typeof import('@libs/server/blogFeedUtils')>(
    '@libs/server/blogFeedUtils',
  );
  return {
    ...actual,
    fetchAllPublicBlogs: () => mockFetchAllPublicBlogs(),
    fetchFullBlogsWithConcurrency: (...args: unknown[]) =>
      mockFetchFullBlogsWithConcurrency(...args),
  };
});

describe('GEO & AI Discovery Route Handlers', () => {
  beforeEach(() => {
    mockFetchAllPublicBlogs.mockReset();
    mockFetchFullBlogsWithConcurrency.mockReset();
    mockGetServerSideSitemap.mockClear();
  });

  describe('GET /robots.txt', () => {
    it('AI 검색 크롤러(OAI-SearchBot, PerplexityBot, Claude-SearchBot, Googlebot)는 허용하고 학습용 스크레이퍼는 차단한다', async () => {
      const response = await getRobotsTxt();
      const text = await response.text();

      expect(response.headers.get('Content-Type')).toContain('text/plain');
      expect(text).toContain('User-agent: Googlebot\nAllow: /');
      expect(text).toContain('User-agent: OAI-SearchBot\nAllow: /');
      expect(text).toContain('User-agent: PerplexityBot\nAllow: /');
      expect(text).toContain('User-agent: Claude-SearchBot\nAllow: /');

      expect(text).toContain('User-agent:CCBot'.replace(':', ': '));
      expect(text).toContain('User-agent: GPTBot\nDisallow: /');
      expect(text).toContain('User-agent: ClaudeBot\nDisallow: /');
      expect(text).toContain('User-agent: Google-Extended\nDisallow: /');
      expect(text).toContain('Sitemap: https://okdohyuk.dev/server-sitemap.xml');
    });
  });

  describe('GET /llms.txt', () => {
    it('사이트 요약, 대표 도구 및 카테고리별 공개 블로그 평문 요약과 .md 링크를 반환한다', async () => {
      mockFetchAllPublicBlogs.mockResolvedValueOnce([
        {
          id: 1,
          urlSlug: 'geo-optimization',
          title: 'GEO 최적화 가이드',
          contents: '| 항목 | 결과 |\n| :--- | --- |\n| 테스트 | 통과 |\n핵심 본문 요약입니다.',
          isPublic: true,
          createdAt: '2026-10-20T00:00:00.000Z',
          updatedAt: '2026-10-26T00:00:00.000Z',
          category: 'Engineering',
          tags: ['GEO'],
        },
      ]);

      const response = await getLlmsTxt();
      const text = await response.text();

      expect(response.headers.get('Content-Type')).toContain('text/plain');
      expect(text).toContain('# okdohyuk.dev');
      expect(text).toContain('llms-full.txt');
      expect(text).toContain('### Engineering');
      expect(text).toContain(
        '- [GEO 최적화 가이드](https://okdohyuk.dev/ko/blog/geo-optimization): 항목 결과 테스트 통과 핵심 본문 요약입니다. ([Markdown](https://okdohyuk.dev/ko/blog/geo-optimization.md))',
      );
    });
  });

  describe('GET /rss.xml', () => {
    it('표준 RSS 2.0 XML 피드와 블로그 아이템들을 반환한다', async () => {
      mockFetchAllPublicBlogs.mockResolvedValueOnce([
        {
          id: 2,
          urlSlug: 'rss-feed-test',
          title: 'RSS & AI Feed <Test>',
          contents: '![이미지](https://example.com/a.png) RSS 피드용 마크다운 본문입니다.',
          isPublic: true,
          createdAt: '2026-10-20T12:00:00.000Z',
          updatedAt: '2026-10-26T12:00:00.000Z',
          category: 'Web',
          tags: ['RSS'],
        },
      ]);

      const response = await getRssXml();
      const xml = await response.text();

      expect(response.headers.get('Content-Type')).toContain('application/rss+xml');
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain('<rss version="2.0"');
      expect(xml).toContain('<title>RSS &amp; AI Feed &lt;Test&gt;</title>');
      expect(xml).toContain('<link>https://okdohyuk.dev/ko/blog/rss-feed-test</link>');
      expect(xml).toContain('<description>RSS 피드용 마크다운 본문입니다.</description>');
      expect(xml).toContain('<category>Web</category>');
    });
  });

  describe('GET /llms-full.txt', () => {
    it('전체 기술 블로그 메타데이터와 마크다운 본문 코퍼스를 반환한다', async () => {
      const summary = {
        id: 3,
        urlSlug: 'full-corpus-post',
        title: 'Full Corpus Post',
        contents: '요약본',
        isPublic: true,
        createdAt: '2026-10-20T00:00:00.000Z',
        updatedAt: '2026-10-26T05:00:00.000Z',
        category: 'AI',
        tags: ['LLM', 'RAG'],
      };
      mockFetchAllPublicBlogs.mockResolvedValueOnce([summary]);
      mockFetchFullBlogsWithConcurrency.mockResolvedValueOnce([
        {
          summary,
          detail: {
            ...summary,
            categoryChain: ['AI', 'Search'],
            contents: '## 상세 섹션\n\n전체 마크다운 원문입니다.',
          },
        },
      ]);

      const response = await getLlmsFullTxt();
      const text = await response.text();

      expect(response.headers.get('Content-Type')).toContain('text/plain');
      expect(text).toContain('## Full Corpus Post');
      expect(text).toContain('- URL: https://okdohyuk.dev/ko/blog/full-corpus-post');
      expect(text).toContain('- Markdown URL: https://okdohyuk.dev/ko/blog/full-corpus-post.md');
      expect(text).toContain('- Category: AI > Search');
      expect(text).toContain('## 상세 섹션\n\n전체 마크다운 원문입니다.');
    });
  });

  describe('GET /server-sitemap.xml', () => {
    it('기본 로케일(/ko/blog/...) loc, updatedAt 기반 lastmod 및 4개 국어 alternateRefs를 생성한다', async () => {
      mockFetchAllPublicBlogs.mockResolvedValueOnce([
        {
          id: 10,
          urlSlug: 'sitemap-post',
          title: 'Sitemap Post',
          contents: '본문 요약',
          isPublic: true,
          createdAt: '2026-10-20T00:00:00.000Z',
          updatedAt: '2026-10-26T08:30:00.000Z',
          category: 'SEO',
          tags: [],
        },
      ]);

      await getServerSitemap();

      expect(mockGetServerSideSitemap).toHaveBeenCalledTimes(1);
      const fields = mockGetServerSideSitemap.mock.calls[0][0] as Array<{
        loc: string;
        lastmod: string;
        alternateRefs: Array<{ href: string; hreflang: string }>;
      }>;

      expect(fields).toHaveLength(1);
      expect(fields[0].loc).toBe('https://okdohyuk.dev/ko/blog/sitemap-post');
      expect(fields[0].lastmod).toBe('2026-10-26T08:30:00.000Z');
      expect(fields[0].alternateRefs).toEqual([
        { href: 'https://okdohyuk.dev/ko/blog/sitemap-post', hreflang: 'ko' },
        { href: 'https://okdohyuk.dev/en/blog/sitemap-post', hreflang: 'en' },
        { href: 'https://okdohyuk.dev/ja/blog/sitemap-post', hreflang: 'ja' },
        { href: 'https://okdohyuk.dev/zh/blog/sitemap-post', hreflang: 'zh' },
      ]);
    });
  });
});
