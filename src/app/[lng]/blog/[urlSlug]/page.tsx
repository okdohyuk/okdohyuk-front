import React from 'react';
import axios from 'axios';
import { notFound } from 'next/navigation';
import { unstable_cache as cache } from 'next/cache';
import { blogApi } from '@api';
import { BaseException } from '@api/Blog';
import BlogDetail from '@components/blog/BlogDetail';
import { metadata } from '@libs/server/customMetadata';
import { Language } from '~/app/i18n/settings';

type BlogDetailProps = {
  params: Promise<{ lng: Language; urlSlug: string }>;
};

export const dynamic = 'force-static';

export async function generateStaticParams() {
  try {
    const { data } = await blogApi.getBlogSearch(0, 100);
    return data.results.map((blog) => ({ urlSlug: blog.urlSlug }));
  } catch (error) {
    // console.error('Failed to generate static params:', error);
    return [];
  }
}

const getPost = cache(async (urlSlug: string) => {
  try {
    const { data } = await blogApi.getBlogUrlSlug(decodeURIComponent(urlSlug));

    return data;
  } catch (error) {
    if (axios.isAxiosError<BaseException, never>(error)) {
      return notFound();
    }
    return notFound();
  }
});

export const generateMetadata = async (props: BlogDetailProps) => {
  const params = await props.params;

  const { lng, urlSlug } = params;

  const { title, contents, thumbnailImage, tags } = await getPost(urlSlug);

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

  return <BlogDetail blog={blog} lng={await lng} />;
}
