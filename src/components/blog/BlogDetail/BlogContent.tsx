import React, { useEffect, useMemo } from 'react';
import { useBlogDetail } from 'components/blog/BlogDetail/BlogDetailProvider';
import MarkDown from '@components/complex/MarkDown';
import MarkdownUtils from '@utils/markdownUtils';
import { cn } from '@utils/cn';
import { BLOG_GLASS_PANEL } from '@components/blog/interactiveStyles';

type BlogContentProps = {
  isPreview: boolean;
};

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
      className={cn(
        BLOG_GLASS_PANEL,
        'px-4 py-5 md:px-8 md:py-6',
        '[&_.prose]:my-0 [&_.prose]:max-w-none',
        isPreview ? '' : 'mb-6',
      )}
    >
      {blogContent}
    </section>
  );
}

export default BlogContent;
