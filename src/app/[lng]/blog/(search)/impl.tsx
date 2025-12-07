'use client';

import React, { Suspense } from 'react';
import { Language } from '~/app/i18n/settings';
import { BlogCategory } from '@api/Blog';
import dynamic from 'next/dynamic';

const BlogSearchListClient = dynamic(() => import('@components/blog/BlogSearchListClient'), {
  ssr: false,
});

type BlogImplProps = {
  lng: Language;
  category: BlogCategory[];
  tags: string[];
};

function BlogImpl({ lng, category, tags }: BlogImplProps) {
  return (
    <Suspense>
      <BlogSearchListClient lng={lng} category={category} tags={tags} />
    </Suspense>
  );
}

export default BlogImpl;
