'use client';

import React, { useEffect } from 'react';
import BlogHeader from './BlogHeader';
import { BlogComponent } from './type';
import BlogBottom from './BlogBottom';
import { BlogDetailProvider } from './BlogDetailProvider';
import BlogToc from './BlogToc';
import BlogContent from './BlogContent';

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
