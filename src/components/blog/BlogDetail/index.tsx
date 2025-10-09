'use client';

import React, { useEffect } from 'react';
import BlogHeader from 'components/blog/BlogDetail/BlogHeader';
import { BlogComponent } from 'components/blog/BlogDetail/type';
import BlogBottom from 'components/blog/BlogDetail/BlogBottom';
import { BlogDetailProvider } from 'components/blog/BlogDetail/BlogDetailProvider';
import BlogToc from 'components/blog/BlogDetail/BlogToc';
import BlogContent from 'components/blog/BlogDetail/BlogContent';

import MobileScreenWrapper from '@components/complex/Layout/MobileScreenWrapper';
import AsideScreenWrapper from '@components/complex/Layout/AsideScreenWrapper';
import { sendGAEvent } from '@libs/client/gtag';

const BlogDetail: BlogComponent = ({ blog, isPreview = false }) => {
  const Wrapper = isPreview ? MobileScreenWrapper : AsideScreenWrapper;
  const rightProp = isPreview ? {} : { right: <BlogToc /> };

  useEffect(() => {
    sendGAEvent('page_view', blog.title);
  }, [blog]);

  return (
    <BlogDetailProvider blog={blog}>
      <Wrapper {...rightProp}>
        <BlogHeader />
        <BlogContent isPreview={isPreview} />
        <BlogBottom />
      </Wrapper>
    </BlogDetailProvider>
  );
};

export default BlogDetail;
