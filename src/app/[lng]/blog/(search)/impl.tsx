'use client';

import React, { Suspense } from 'react';
import { Language } from '~/app/i18n/settings';
import { BlogCategory } from '@api/Blog';
import dynamic from 'next/dynamic';

const BlogSearchListClient = dynamic(() => import('@components/blog/BlogSearchListClient'), {
  ssr: false,
});

const BlogImpl = ({
  params: { lng },
  category,
  tags,
}: {
  params: { lng: Language };
  category: BlogCategory[];
  tags: string[];
}) => {
  return (
    <Suspense>
      <BlogSearchListClient lng={lng} category={category} tags={tags} />
    </Suspense>
  );
};

export default BlogImpl;
