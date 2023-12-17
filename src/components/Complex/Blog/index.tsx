import React from 'react';

import BlogHeader from './BlogHeader';
import { BlogComponent } from './type';
import MarkDown from '@components/Complex/MarkDown';

const BlogPost: BlogComponent = ({ blog }) => {
  const { contents } = blog;

  return (
    <>
      <BlogHeader blog={blog} />
      <MarkDown contents={contents} />
    </>
  );
};

export default BlogPost;
