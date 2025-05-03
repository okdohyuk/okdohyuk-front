import React from 'react';
import { notFound } from 'next/navigation';
import axios from 'axios';
import { blogApi } from '@api';
import { BaseException } from '@api/Blog';
import { verifySession } from '@libs/server/dal';
import BlogWritePageImpl from '~/app/[lng]/admin/blog/write/impl';
import { LanguageParams } from '~/app/[lng]/layout';

const getPost = async (urlSlug: string) => {
  try {
    const session = await verifySession();
    if (!session) return notFound();
    const { data } = await blogApi.getBlogUrlSlug(decodeURIComponent(urlSlug), session.accessToken);
    return data;
  } catch (e) {
    if (axios.isAxiosError<BaseException, never>(e)) {
      console.error(e.response?.data.errorMessage);
    }
    return notFound();
  }
};

const getCategory = async () => {
  const { data } = await blogApi.getBlogCategory();
  return data;
};

type BlogWriteProps = LanguageParams & {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function BlogWritePage(props: BlogWriteProps) {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const { lng } = params;

  const urlSlug = typeof searchParams.urlSlug === 'string' ? searchParams.urlSlug : null;
  const blog = urlSlug ? await getPost(urlSlug) : null;
  const category = await getCategory();

  return <BlogWritePageImpl lng={lng} blog={blog} category={category} />;
}
