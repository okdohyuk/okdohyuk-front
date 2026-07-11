'use server';

import axios from 'axios';
import { updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { getTokenServer } from '@libs/server/token';
import { blogApi } from '@api';
import { BlogRequest } from './schema';

export const submitBlog = async (blog: BlogRequest, urlSlug?: string, lng?: string) => {
  try {
    const token = await getTokenServer();
    if (!token) return;
    if (!urlSlug) {
      // Blog spec 에 X-Api-Key 헤더가 추가되어 authorization 뒤에 xApiKey 인자가 삽입됨.
      // 어드민 게시 플로우는 Authorization 만 사용하므로 xApiKey 자리에는 undefined 를 전달한다.
      await blogApi.postBlog(token.accessToken, undefined, blog);
    } else {
      await blogApi.patchBlogUrlSlug(urlSlug, token.accessToken, undefined, blog);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data.errorMessage ?? '블로그 저장 실패');
    }
    throw error;
  }
  // 게시/수정 결과가 공개 페이지에 바로 반영되도록 unstable_cache 태그를 무효화한다.
  // blog/(search)/page.tsx → 'blog-search'(태그 목록), blog/[urlSlug]/page.tsx → 'blog-post'
  updateTag('blog-search');
  updateTag('blog-post');
  // 로케일 없는 경로로 redirect 하면 미들웨어 307을 한 번 더 타면서 라우터 상태가 어긋나
  // 목록 복귀 후 Link 클릭이 동작하지 않는 문제가 있어 lng를 명시한다.
  redirect(lng ? `/${lng}/admin/blog` : '/admin/blog');
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
