import React from 'react';
import { Blog } from '@api/Blog';

import { Language } from '~/app/i18n/settings';

type BlogProps = {
  blog: Blog;
  isPreview?: boolean;
  lng: Language;
};

type BlogComponent = React.FC<BlogProps>;

type BlogToc = {
  id: string;
  text: string;
  level: number;
};

export type { BlogProps, BlogComponent, BlogToc };
