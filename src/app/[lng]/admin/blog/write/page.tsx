import React from 'react';
import { notFound } from 'next/navigation';
import axios from 'axios';
import { blogApi } from '@api';
import { BaseException } from '@api/Blog';
import BlogWritePageImpl from '~/app/[lng]/admin/blog/write/impl';
import { LanguageParams } from '~/app/[lng]/layout';
import { cookies } from 'next/headers';

const getPost = async (urlSlug: string) => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    if (!accessToken) return notFound();
    const { data } = await blogApi.getBlogUrlSlug(
      decodeURIComponent(urlSlug),
      'Bearer ' + accessToken,
    );
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
