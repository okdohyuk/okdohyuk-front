import React, { useEffect, useMemo } from 'react';
import { useBlogDetail } from 'components/blog/BlogDetail/BlogDetailProvider';
import MarkDown from '@components/complex/MarkDown';
import MarkdownUtils from '@utils/markdownUtils';
import { cn } from '@utils/cn';

type BlogContentProps = {
  isPreview: boolean;
};

/*
 * Article body sits straight on the page canvas — reading text needs no card around it.
 * The column width (max-w-3xl on the article) keeps the measure near 65–75 characters.
 */
function BlogContent({ isPreview }: BlogContentProps) {
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

  return (
    <section
      itemProp="articleBody"
      className={cn('[&_.prose]:my-0 [&_.prose]:max-w-none', isPreview ? '' : 'mb-12')}
    >
      {blogContent}
    </section>
  );
}

export default BlogContent;
