import React from 'react';
import { notFound } from 'next/navigation';
import { unstable_cache as cache } from 'next/cache';
import { blogApi } from '@api';
import { Blog } from '@api/Blog';
import BlogDetail from '@components/blog/BlogDetail';
import { metadata } from '@libs/server/customMetadata';
import { SITE_URL } from '@libs/shared/agentDiscovery';
import MarkdownUtils from '@utils/markdownUtils';
import { Language } from '~/app/i18n/settings';

type BlogDetailProps = {
  params: Promise<{ lng: Language; urlSlug: string }>;
};

const DESCRIPTION_MAX_LENGTH = 160;
const STATIC_PARAMS_PAGE_LIMIT = 100;
const BLOG_AUTHOR_NAME = 'Dohyuk You';
const BLOG_AUTHOR_SAME_AS = [
  'https://github.com/okdohyuk',
  'https://www.linkedin.com/in/dohyuk-you-829945218/',
] as const;

// 4시간(=4*60*60=14400s)마다 정적 페이지를 ISR 재생성한다.
// Next.js 세그먼트 설정은 정적 분석 가능한 리터럴이어야 하므로 변수 참조 대신 리터럴 사용.
export const revalidate = 14400;

// 빌드 시점에 알려진 슬러그를 prerender. dynamicParams=true 이므로
// 여기에 없던 새 글도 첫 요청 시 온디맨드로 정적 생성된다.
export const dynamicParams = true;

function normalizeBlogSlug(rawSlug: string): string {
  try {
    return decodeURIComponent(rawSlug).replace(/\.md$/i, '');
  } catch {
    return rawSlug.replace(/\.md$/i, '');
  }
}

function toOptionalIsoString(dateValue?: string): string | undefined {
  if (!dateValue) {
    return undefined;
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toISOString();
}

function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function buildBlogStructuredData(blog: Blog, lng: Language) {
  const canonicalUrl = `${SITE_URL}/${lng}/blog/${blog.urlSlug}`;
  const plainSummary = MarkdownUtils.extractPlainTextSummary(blog.contents, DESCRIPTION_MAX_LENGTH);
  const publishedTime = toOptionalIsoString(blog.createdAt);
  const modifiedTime = toOptionalIsoString(blog.updatedAt || blog.createdAt);
  const categoryChain = blog.categoryChain ?? [];

  const techArticle = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: blog.title,
    description: plainSummary,
    image: [blog.thumbnailImage || `${SITE_URL}/opengraph_image.png`],
    ...(publishedTime ? { datePublished: publishedTime } : {}),
    ...(modifiedTime ? { dateModified: modifiedTime } : {}),
    ...(blog.tags && blog.tags.length > 0 ? { keywords: blog.tags.join(', ') } : {}),
    ...(categoryChain.length > 0 ? { articleSection: categoryChain.join(' > ') } : {}),
    inLanguage: lng,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    author: {
      '@type': 'Person',
      name: BLOG_AUTHOR_NAME,
      url: SITE_URL,
      sameAs: BLOG_AUTHOR_SAME_AS,
    },
    publisher: {
      '@type': 'Person',
      name: BLOG_AUTHOR_NAME,
      url: SITE_URL,
    },
  };

  const breadcrumbList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${SITE_URL}/${lng}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${SITE_URL}/${lng}/blog`,
      },
      ...categoryChain.map((categoryName, idx) => ({
        '@type': 'ListItem',
        position: idx + 3,
        name: categoryName,
        item: `${SITE_URL}/${lng}/blog?categoryIn=${encodeURIComponent(
          categoryChain.slice(0, idx + 1).join(','),
        )}`,
      })),
      {
        '@type': 'ListItem',
        position: categoryChain.length + 3,
        name: blog.title,
        item: canonicalUrl,
      },
    ],
  };

  return { techArticle, breadcrumbList };
}

export async function generateStaticParams() {
  try {
    const { data } = await blogApi.getBlogSearch(0, STATIC_PARAMS_PAGE_LIMIT);
    return data.results.map((blog) => ({ urlSlug: blog.urlSlug }));
  } catch (error) {
    return [];
  }
}

// 데이터 캐시도 페이지 ISR 정책과 동일하게 4시간으로 맞춘다.
// notFound()는 캐시 내부에서 호출하지 않는다 — 존재하지 않는 슬러그의 404
// 결과가 캐시에 박히면 이후 글이 추가돼도 계속 404가 노출되기 때문.
// 대신 실패 시 null을 반환하고, 호출부(페이지/메타데이터)에서 notFound()를 호출한다.
const getPost = cache(
  async (urlSlug: string): Promise<Blog | null> => {
    try {
      const normalizedSlug = normalizeBlogSlug(urlSlug);
      const { data } = await blogApi.getBlogUrlSlug(normalizedSlug);

      return data;
    } catch (error) {
      return null;
    }
  },
  ['blog-post'],
  { revalidate: 14400, tags: ['blog-post'] },
);

export const generateMetadata = async (props: BlogDetailProps) => {
  const params = await props.params;

  const { lng, urlSlug } = params;

  const post = await getPost(urlSlug);

  if (!post) {
    return notFound();
  }

  const { title, contents, thumbnailImage, tags, createdAt, updatedAt, categoryChain } = post;
  const plainSummary = MarkdownUtils.extractPlainTextSummary(contents, DESCRIPTION_MAX_LENGTH);
  const publishedTime = toOptionalIsoString(createdAt);
  const modifiedTime = toOptionalIsoString(updatedAt || createdAt);
  const section = categoryChain && categoryChain.length > 0 ? categoryChain.join(' > ') : undefined;

  return metadata({
    title,
    description: plainSummary,
    image: thumbnailImage,
    type: 'article',
    keywords: tags,
    language: lng,
    pathname: `/blog/${post.urlSlug}`,
    publishedTime,
    modifiedTime,
    authors: [BLOG_AUTHOR_NAME],
    tags,
    section,
  });
};

export default async function BlogDetailPage({ params }: BlogDetailProps) {
  const { urlSlug, lng } = await params;
  const blog = await getPost(urlSlug);

  if (!blog) {
    return notFound();
  }

  const { techArticle, breadcrumbList } = buildBlogStructuredData(blog, lng);

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(techArticle) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbList) }}
      />
      <BlogDetail blog={blog} lng={lng} />
    </>
  );
}
