import React from 'react';
import { Blog } from '@api/Blog';

type BlogProps = {
  blog: Blog;
};

type BlogComponent = React.FC<BlogProps>;

export type { BlogProps, BlogComponent };
