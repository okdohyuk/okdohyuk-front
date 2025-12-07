import React, { useEffect, useMemo } from 'react';
import ReactDomServer from 'react-dom/server';
import { useBlogDetail } from 'components/blog/BlogDetail/BlogDetailProvider';
import MarkDown from '@components/complex/MarkDown';
import { parseHeadings } from '@libs/client/heading';

type BlogContentProps = {
  isPreview: boolean;
};

const BlogContent: React.FC<BlogContentProps> = ({ isPreview }) => {
  const {
    blog: { contents },
    setToc,
  } = useBlogDetail();
  const blogContent = useMemo(() => <MarkDown contents={contents} />, [contents]);

  useEffect(() => {
    if (isPreview) return;
    const toc = parseHeadings(ReactDomServer.renderToString(blogContent));
    setToc(toc);
  }, [blogContent, setToc, isPreview]);

  return blogContent;
};

export default BlogContent;
