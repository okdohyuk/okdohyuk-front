import React, { createContext, useContext, useMemo, useState } from 'react';
import { Blog } from '@api/Blog';
import { BlogToc } from 'components/blog/BlogDetail/type';

import { Language } from '~/app/i18n/settings';

type BlogDetailContextType = {
  blog: Blog;
  toc: BlogToc[] | null;
  setToc: React.Dispatch<React.SetStateAction<BlogToc[] | null>>;
  lng: Language;
};

const BlogDetailContext = createContext<BlogDetailContextType | null>(null);

type BlogTocProviderProps = {
  blog: Blog;
  children: React.ReactNode;
  lng: Language;
};

function BlogDetailProvider({ children, blog, lng }: BlogTocProviderProps) {
  const [toc, setToc] = useState<BlogToc[] | null>(null);
  const contextValue = useMemo(() => ({ blog, toc, setToc, lng }), [blog, toc, lng]);

  return <BlogDetailContext.Provider value={contextValue}>{children}</BlogDetailContext.Provider>;
}

function useBlogDetail() {
  const context = useContext(BlogDetailContext);
  if (!context) {
    throw new Error('useBlogToc must be used within a BlogTocProvider');
  }
  return context;
}

export { BlogDetailProvider, useBlogDetail };
