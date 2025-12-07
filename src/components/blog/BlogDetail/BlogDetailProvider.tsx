import React, { createContext, useContext, useMemo, useState } from 'react';
import { Blog } from '@api/Blog';
import { BlogToc } from 'components/blog/BlogDetail/type';

type BlogDetailContextType = {
  blog: Blog;
  toc: BlogToc[] | null;
  setToc: React.Dispatch<React.SetStateAction<BlogToc[] | null>>;
};

const BlogDetailContext = createContext<BlogDetailContextType | null>(null);

type BlogTocProviderProps = {
  blog: Blog;
  children: React.ReactNode;
};

function BlogDetailProvider({ children, blog }: BlogTocProviderProps) {
  const [toc, setToc] = useState<BlogToc[] | null>(null);
  const contextValue = useMemo(() => ({ blog, toc, setToc }), [blog, toc]);

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
