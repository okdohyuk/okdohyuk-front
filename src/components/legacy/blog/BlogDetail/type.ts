import React from 'react';
import { Blog } from '@api/Blog';

type BlogProps = {
  blog: Blog;
  isPreview?: boolean;
};

type BlogComponent = React.FC<BlogProps>;

type BlogToc = {
  id: string;
  text: string;
  level: number;
};

export type { BlogProps, BlogComponent, BlogToc };
