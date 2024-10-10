import React from 'react';
import { BlogCardType } from '../BlogCard/type';

type BlogCardSkeletonProps = {
  type?: BlogCardType;
};

type BlogCardSkeletonFC = React.FC<BlogCardSkeletonProps>;

export type { BlogCardSkeletonFC, BlogCardSkeletonProps };
