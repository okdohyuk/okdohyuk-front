import React from 'react';
import { notFound } from 'next/navigation';
import { unstable_cache as cache } from 'next/cache';
import { blogApi } from '@api';
import { Blog } from '@api/Blog';
import BlogDetail from '@components/blog/BlogDetail';
import { metadata } from '@libs/server/customMetadata';
import { Language } from '~/app/i18n/settings';

type BlogDetailProps = {
  params: Promise<{ lng: Language; urlSlug: string }>;
};

// 4시간(=4*60*60=14400s)마다 정적 페이지를 ISR 재생성한다.
// Next.js 세그먼트 설정은 정적 분석 가능한 리터럴이어야 하므로 변수 참조 대신 리터럴 사용.
export const revalidate = 14400;

// 빌드 시점에 알려진 슬러그를 prerender. dynamicParams=true 이므로
// 여기에 없던 새 글도 첫 요청 시 온디맨드로 정적 생성된다.
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const { data } = await blogApi.getBlogSearch(0, 100);
    return data.results.map((blog) => ({ urlSlug: blog.urlSlug }));
  } catch (error) {
    // console.error('Failed to generate static params:', error);
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
      const { data } = await blogApi.getBlogUrlSlug(decodeURIComponent(urlSlug));

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

  const { title, contents, thumbnailImage, tags } = post;

  return metadata({
    title,
    description: `${contents.slice(0, 200)}..`,
    image: thumbnailImage,
    type: 'article',
    keywords: tags,
    language: lng,
  });
};

export default async function BlogDetailPage({ params }: BlogDetailProps) {
  const { urlSlug, lng } = await params;
  const blog = await getPost(urlSlug);

  if (!blog) {
    return notFound();
  }

  return <BlogDetail blog={blog} lng={lng} />;
}
