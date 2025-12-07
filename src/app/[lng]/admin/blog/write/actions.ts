'use server';

import axios from 'axios';
import { redirect } from 'next/navigation';
import { getTokenServer } from '@libs/server/token';
import { blogApi } from '@api';
import { BlogRequest } from './schema';

export const submitBlog = async (blog: BlogRequest, urlSlug?: string) => {
  try {
    const token = await getTokenServer();
    if (!token) return;
    if (!urlSlug) {
      await blogApi.postBlog(token.accessToken, blog);
    } else {
      await blogApi.patchBlogUrlSlug(urlSlug, token.accessToken, blog);
    }
    redirect('/admin/blog');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.errorMessage ?? '블로그 저장 실패');
    }
    throw error;
  }
};

/*
export const uploadImage = async (file: File) => {
  try {
    const session = await verifySession();
    if (!session) return;
    const { data } = await storageApi.postStorageImage(session.accessToken, file);
    return data;
  } catch (e) {
    console.error('-> e', e);
  }
};
*/
