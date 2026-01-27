'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import BlogHeader from 'components/blog/BlogDetail/BlogHeader';
import { BlogComponent } from 'components/blog/BlogDetail/type';
import { BlogDetailProvider } from 'components/blog/BlogDetail/BlogDetailProvider';
import BlogToc from 'components/blog/BlogDetail/BlogToc';
import BlogContent from 'components/blog/BlogDetail/BlogContent';

import MobileScreenWrapper from '@components/complex/Layout/MobileScreenWrapper';
import AsideScreenWrapper from '@components/complex/Layout/AsideScreenWrapper';
import { sendGAEvent } from '@libs/client/gtag';

const BlogBottom = dynamic(() => import('components/blog/BlogDetail/BlogBottom'), {
  loading: () => <div className="h-64" />,
});

const BlogDetail: BlogComponent = function BlogDetail({ blog, isPreview = false, lng }) {
  const Wrapper = isPreview ? MobileScreenWrapper : AsideScreenWrapper;
  const wrapperProps = isPreview ? {} : { right: <BlogToc /> };

  useEffect(() => {
    sendGAEvent('page_view', blog.title);
  }, [blog.title]);

  return (
    <BlogDetailProvider blog={blog} lng={lng}>
      <Wrapper {...wrapperProps}>
        <BlogHeader />
        <BlogContent isPreview={isPreview} />
        {isPreview ? null : <BlogBottom />}
      </Wrapper>
    </BlogDetailProvider>
  );
};

export default BlogDetail;
