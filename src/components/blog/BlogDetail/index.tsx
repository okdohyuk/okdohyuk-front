'use client';

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import BlogHeader from 'components/blog/BlogDetail/BlogHeader';
import { BlogComponent } from 'components/blog/BlogDetail/type';
import { BlogDetailProvider } from 'components/blog/BlogDetail/BlogDetailProvider';
import BlogToc from 'components/blog/BlogDetail/BlogToc';
import BlogContent from 'components/blog/BlogDetail/BlogContent';
import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';

import MobileScreenWrapper from '@components/complex/Layout/MobileScreenWrapper';
import AsideScreenWrapper from '@components/complex/Layout/AsideScreenWrapper';
import { sendGAEvent } from '@libs/client/gtag';

const BlogBottom = dynamic(() => import('components/blog/BlogDetail/BlogBottom'), {
  loading: () => <div className="h-64" />,
});

const BlogDetail: BlogComponent = function BlogDetail({ blog, isPreview = false, lng }) {
  const Wrapper = isPreview ? MobileScreenWrapper : AsideScreenWrapper;
  const wrapperProps = isPreview ? {} : { right: <BlogToc /> };
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    sendGAEvent('blog_view', blog.urlSlug ?? blog.title, {
      post_title: blog.title,
      post_slug: blog.urlSlug ?? '',
      category: (blog.categoryChain ?? []).join(' > '),
      tag_list: (blog.tags ?? []).join(','),
    });
  }, [blog.urlSlug, blog.title, blog.categoryChain, blog.tags]);

  // blog_read_complete: 90% 스크롤 + 30초 이상 체류
  const readStartRef = useRef<number>(0);
  const completedRef = useRef<boolean>(false);

  useEffect(() => {
    readStartRef.current = Date.now();
    completedRef.current = false;
  }, [blog.urlSlug]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const check = () => {
      if (completedRef.current) return;
      const doc = document.documentElement;
      const scrollableHeight = doc.scrollHeight - window.innerHeight;
      if (scrollableHeight <= 0) return;
      const scrolled = (window.scrollY / scrollableHeight) * 100;
      if (scrolled < 90) return;
      const elapsed = Math.floor((Date.now() - readStartRef.current) / 1000);
      if (elapsed < 30) return;
      completedRef.current = true;
      sendGAEvent('blog_read_complete', blog.urlSlug ?? '', {
        post_slug: blog.urlSlug ?? '',
        time_on_page_sec: elapsed,
      });
    };

    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, [blog.urlSlug]);

  return (
    <BlogDetailProvider blog={blog} lng={lng}>
      <LazyMotion features={domAnimation}>
        <Wrapper {...wrapperProps}>
          <m.section
            className="w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
          >
            <BlogHeader />
            <BlogContent isPreview={isPreview} />
            {isPreview ? null : <BlogBottom />}
          </m.section>
        </Wrapper>
      </LazyMotion>
    </BlogDetailProvider>
  );
};

export default BlogDetail;
