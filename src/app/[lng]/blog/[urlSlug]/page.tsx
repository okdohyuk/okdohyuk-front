import React from 'react';
import { blogApi } from '@api';
import BlogDetail from '@components/legacy/blog/BlogDetail';
import { notFound } from 'next/navigation';
import axios from 'axios';
import { BaseException } from '@api/Blog';
import { unstable_cache as cache } from 'next/cache';
import { metadata } from '@libs/server/customMetadata';
import { Language } from '~/app/i18n/settings';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const { data: res } = await blogApi.getBlogSearch(0, 100);
  const paths = res.results.map((blog) => ({ urlSlug: blog.urlSlug }));

  return paths;
}

const getPost = cache(async (urlSlug: string) => {
  try {
    const { data } = await blogApi.getBlogUrlSlug(decodeURIComponent(urlSlug));

    return data;
  } catch (e) {
    if (axios.isAxiosError<BaseException, never>(e)) {
      console.error(e.response?.data.errorMessage);
    }
    return notFound();
  }
});

export const generateMetadata = async ({
  params: { lng, urlSlug },
}: {
  params: { lng: Language; urlSlug: string };
}) => {
  const { title, contents, thumbnailImage, tags } = await getPost(urlSlug);

  return metadata({
    title: title,
    description: contents.slice(0, 200) + '..',
    image: thumbnailImage,
    type: 'article',
    keywords: tags,
    language: lng,
  });
};

async function BlogDetailPage({ params: { urlSlug } }: { params: { urlSlug: string } }) {
  const blog = await getPost(urlSlug);

  return <BlogDetail blog={blog} />;
}

export default BlogDetailPage;
