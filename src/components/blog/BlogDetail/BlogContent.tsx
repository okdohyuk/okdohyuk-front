import React, { useEffect, useMemo } from 'react';
import { useBlogDetail } from 'components/blog/BlogDetail/BlogDetailProvider';
import MarkDown from '@components/complex/MarkDown';
import MarkdownUtils from '@utils/markdownUtils';

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
    const toc = MarkdownUtils.extractHeadings(contents);
    setToc(toc);
  }, [contents, setToc, isPreview]);

  return blogContent;
};

export default BlogContent;
