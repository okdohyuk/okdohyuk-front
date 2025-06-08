'use server';

import { blogApi } from '@api';
import axios from 'axios';
import { BlogRequest } from './schema';
import { redirect } from 'next/navigation';
import { getTokenServer } from '@libs/server/token';

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
  } catch (e) {
    if (axios.isAxiosError(e)) {
      console.error('-> e', e.response?.data.errorMessage);
    }
    throw e;
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
