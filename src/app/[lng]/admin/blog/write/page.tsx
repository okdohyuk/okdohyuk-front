import React from 'react';
import axios from 'axios';
import { notFound } from 'next/navigation';
import { blogApi } from '@api';
import { BaseException } from '@api/Blog';
import { getTokenServer } from '@libs/server/token';
import BlogWritePageImpl from '~/app/[lng]/admin/blog/write/impl';
import { LanguageParams } from '~/app/[lng]/layout';

const getPost = async (urlSlug: string) => {
  try {
    const token = await getTokenServer();
    if (!token) return notFound();
    const { data } = await blogApi.getBlogUrlSlug(decodeURIComponent(urlSlug), token.accessToken);
    return data;
  } catch (error) {
    if (axios.isAxiosError<BaseException, never>(error)) {
      return notFound();
    }
    return notFound();
  }
};

const getCategory = async () => {
  const { data } = await blogApi.getBlogCategory();
  return data;
};

type BlogWriteProps = {
  params: LanguageParams['params'];
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BlogWritePage({ params, searchParams }: BlogWriteProps) {
  const { lng } = await params;
  const { urlSlug: urlSlugs } = await searchParams;

  const urlSlug = typeof urlSlugs === 'string' ? urlSlugs : null;
  const blog = urlSlug ? await getPost(urlSlug) : null;
  const category = await getCategory();

  return <BlogWritePageImpl lng={lng} blog={blog} category={category} />;
}
