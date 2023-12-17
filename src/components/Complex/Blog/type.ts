import React from 'react';
import { Blog } from '@api/Blog';

type BlogProps = {
  blog: Blog;
};

type BlogComponent = ({ blog }: BlogProps) => React.JSX.Element;

export type { BlogProps, BlogComponent };
