'use client';

import React from 'react';
import BlogSearchListClient from '@components/blog/BlogSearchListClient';
import useBlogSearchClient from '@hooks/blog/useBlogSearchClient';
import { Language } from '~/app/i18n/settings';
import { observer } from 'mobx-react';
import { BlogCategory } from '@api/Blog';

/**
 * TODO
 * 블로그 app라우팅
 *  * 작성페이지
 * pwa 고치기
 * 에널리틱스 고치기
 * 해몽 서버컴포넌트
 *
 */

const BlogImpl = ({
  params: { lng },
  category,
  tags,
}: {
  params: { lng: Language };
  category: BlogCategory[];
  tags: string[];
}) => {
  const {} = useBlogSearchClient(category, tags);

  return <BlogSearchListClient lng={lng} />;
};

export default observer(BlogImpl);
