import { describe, expect, it } from 'vitest';
import { metadata } from '../customMetadata';

describe('customMetadata', () => {
  it('pathname이 주어지면 alternates.canonical, 다국어 hreflang(ko/en/ja/zh/x-default), rss.xml 타입을 생성한다', () => {
    const result = metadata({
      title: '블로그 글 제목',
      description: '평문 요약 설명',
      language: 'ko',
      pathname: '/blog/sample-post',
    });

    expect(result.alternates?.canonical).toBe('https://okdohyuk.dev/ko/blog/sample-post');
    expect(result.alternates?.languages).toEqual({
      ko: 'https://okdohyuk.dev/ko/blog/sample-post',
      en: 'https://okdohyuk.dev/en/blog/sample-post',
      ja: 'https://okdohyuk.dev/ja/blog/sample-post',
      zh: 'https://okdohyuk.dev/zh/blog/sample-post',
      'x-default': 'https://okdohyuk.dev/ko/blog/sample-post',
    });
    expect(result.alternates?.types).toEqual({
      'application/rss+xml': 'https://okdohyuk.dev/rss.xml',
    });
  });

  it('루트 pathname("/")이 주어지면 로케일 루트 URL로 정규화한다', () => {
    const result = metadata({
      title: '홈',
      description: '홈 설명',
      language: 'en',
      pathname: '/',
    });

    expect(result.alternates?.canonical).toBe('https://okdohyuk.dev/en');
    expect(result.alternates?.languages?.ko).toBe('https://okdohyuk.dev/ko');
    expect(result.alternates?.languages?.['x-default']).toBe('https://okdohyuk.dev/ko');
  });

  it('type이 article일 때 openGraph에 publishedTime, modifiedTime, authors, tags, section을 포함한다', () => {
    const result = metadata({
      title: '기술 아티클',
      description: '마크다운이 제거된 평문 요약',
      language: 'ko',
      type: 'article',
      pathname: '/blog/tech-article',
      publishedTime: '2026-10-20T00:00:00.000Z',
      modifiedTime: '2026-10-26T01:00:00.000Z',
      authors: ['Dohyuk You'],
      tags: ['SEO', 'GEO'],
      section: 'Engineering > Web',
    });

    const og = result.openGraph as Record<string, unknown>;
    expect(og).toBeDefined();
    expect(og.type).toBe('article');
    expect(og.url).toBe('https://okdohyuk.dev/ko/blog/tech-article');
    expect(og.publishedTime).toBe('2026-10-20T00:00:00.000Z');
    expect(og.modifiedTime).toBe('2026-10-26T01:00:00.000Z');
    expect(og.authors).toEqual(['Dohyuk You']);
    expect(og.tags).toEqual(['SEO', 'GEO']);
    expect(og.section).toBe('Engineering > Web');
  });
});
