import React from 'react';
import { useBlogDetail } from './BlogDetailProvider';

const BlogToc = () => {
  const { toc } = useBlogDetail();
  return <div>{toc?.map((t) => t.id)}</div>;
};

export default BlogToc;
