'use server';

import { blogApi } from '@api';
import axios from 'axios';
import { BlogRequest } from './schema';
import { verifySession } from '@libs/server/dal';
import { redirect } from 'next/navigation';

export const submitBlog = async (blog: BlogRequest, urlSlug?: string) => {
  try {
    const session = await verifySession();
    if (!session) return;
    if (!urlSlug) {
      await blogApi.postBlog(session.accessToken, blog);
    } else {
      await blogApi.patchBlogUrlSlug(urlSlug, session.accessToken, blog);
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
