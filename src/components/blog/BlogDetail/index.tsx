import React from 'react';

import BlogHeader from './BlogHeader';
import { BlogComponent } from './type';
import MarkDown from '@components/complex/MarkDown';
import BlogBottom from './BlogBottom';

const BlogPost: BlogComponent = ({ blog }) => {
  const { contents } = blog;

  return (
    <>
      <BlogHeader blog={blog} />
      <MarkDown contents={contents} />
      <BlogBottom blog={blog} />
    </>
  );
};

export default BlogPost;
