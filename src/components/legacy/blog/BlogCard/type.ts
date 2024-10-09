import React from 'react';
import { BlogSearch } from '@api/Blog';

type BlogCardType = 'discript' | 'frame' | 'board';

type BlogCardProps = {
  blog: BlogSearch;
  isAdmin?: boolean;
  type?: BlogCardType;
};

type BlogCardTypeProps = {
  blog: BlogSearch;
};

type BlogCardTypeFC = React.FC<BlogCardTypeProps>;

type BlogCardFC = React.FC<BlogCardProps>;

export type { BlogCardFC, BlogCardTypeFC, BlogCardType };
