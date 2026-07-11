import React from 'react';
import { BlogSearch } from '@api/Blog';

type BlogCardType = 'discript' | 'frame' | 'board';

type BlogCardProps = {
  blog: BlogSearch;
  isAdmin?: boolean;
  type?: BlogCardType;
  /** 지정 시 로케일 prefix가 붙은 경로로 이동해 미들웨어 리다이렉트를 거치지 않는다 */
  lng?: string;
};

type BlogCardTypeProps = {
  blog: BlogSearch;
};

type BlogCardTypeFC = React.FC<BlogCardTypeProps>;

type BlogCardFC = React.FC<BlogCardProps>;

export type { BlogCardFC, BlogCardTypeFC, BlogCardType };
