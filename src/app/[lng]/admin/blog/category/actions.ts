'use server';

import axios from 'axios';
import { updateTag } from 'next/cache';
import { getTokenServer } from '@libs/server/token';
import { blogApi } from '@api';
import { PatchBlogCategoryIdRequest, PostBlogCategoryRequest } from '@api/Blog';

// 블로그 메인(카테고리·태그 목록)과 상세(categoryChain) 캐시를 무효화한다.
// unstable_cache 태그: blog/(search)/page.tsx → 'blog-search', blog/[urlSlug]/page.tsx → 'blog-post'
const revalidateBlogCaches = () => {
  updateTag('blog-search');
  updateTag('blog-post');
};

const toActionError = (error: unknown, fallback: string): Error => {
  if (axios.isAxiosError(error)) {
    return new Error(error.response?.data.errorMessage ?? fallback);
  }
  return error instanceof Error ? error : new Error(fallback);
};

export const createBlogCategory = async (request: PostBlogCategoryRequest) => {
  try {
    const token = await getTokenServer();
    if (!token) return;
    await blogApi.postBlogCategory(token.accessToken, request);
  } catch (error) {
    throw toActionError(error, '카테고리 생성 실패');
  }
  revalidateBlogCaches();
};

export const updateBlogCategory = async (id: string, request: PatchBlogCategoryIdRequest) => {
  try {
    const token = await getTokenServer();
    if (!token) return;
    await blogApi.patchBlogCategoryId(id, token.accessToken, request);
  } catch (error) {
    throw toActionError(error, '카테고리 수정 실패');
  }
  revalidateBlogCaches();
};

export const deleteBlogCategory = async (id: string) => {
  try {
    const token = await getTokenServer();
    if (!token) return;
    await blogApi.deleteBlogCategoryId(id, token.accessToken);
  } catch (error) {
    throw toActionError(error, '카테고리 삭제 실패');
  }
  revalidateBlogCaches();
};
