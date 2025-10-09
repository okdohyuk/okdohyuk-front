import React, { createContext, useContext, useState } from 'react';
import { BlogToc } from 'components/blog/BlogDetail/type';
import { Blog } from '@api/Blog';

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

const BlogDetailProvider = ({ children, blog }: BlogTocProviderProps) => {
  const [toc, setToc] = useState<BlogToc[] | null>(null);

  return (
    <BlogDetailContext.Provider value={{ blog, toc, setToc }}>
      {children}
    </BlogDetailContext.Provider>
  );
};

const useBlogDetail = () => {
  const context = useContext(BlogDetailContext);
  if (!context) {
    throw new Error('useBlogToc must be used within a BlogTocProvider');
  }
  return context;
};

export { BlogDetailProvider, useBlogDetail };
