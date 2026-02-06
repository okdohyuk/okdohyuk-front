import React, { useCallback, useEffect, useState } from 'react';
import Link from '@components/basic/Link';
import { cn } from '@utils/cn';
import ScrollUtils from '@utils/scrollUtils';
import { useBlogDetail } from 'components/blog/BlogDetail/BlogDetailProvider';
import { BLOG_GLASS_PANEL_SOFT } from '@components/blog/interactiveStyles';

function BlogToc() {
  const { toc } = useBlogDetail();
  const [activeId, setActiveId] = useState<null | string>(null);
  const [headingTops, setHeadingTops] = useState<
    | null
    | {
        id: string;
        top: number;
      }[]
  >(null);

  const updateTocPositions = useCallback(() => {
    if (!toc) return;
    const scrollTop = ScrollUtils.getScrollTop();
    const calculatedHeadingTops = toc
      .map(({ id }) => {
        const el = document.getElementById(id);
        if (!el) {
          return null;
        }
        const { top } = el.getBoundingClientRect();
        return {
          id,
          top: top + scrollTop,
        };
      })
      .filter((t) => t !== null) as { id: string; top: number }[];
    setHeadingTops(calculatedHeadingTops);
  }, [toc]);

  useEffect(() => {
    updateTocPositions();
    const { scrollHeight: initialScrollHeight } = document.body;
    let prevScrollHeight = initialScrollHeight;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    function checkScrollHeight() {
      const { scrollHeight } = document.body;
      if (prevScrollHeight !== scrollHeight) {
        updateTocPositions();
      }
      prevScrollHeight = scrollHeight;
      timeoutId = setTimeout(checkScrollHeight, 250);
    }
    timeoutId = setTimeout(checkScrollHeight, 250);
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [updateTocPositions]);

  const onScroll = useCallback(() => {
    const scrollTop = ScrollUtils.getScrollTop();
    if (!headingTops) return;
    const currentHeading = [...headingTops].reverse().find(({ top }) => scrollTop >= top - 4);
    if (!currentHeading) {
      setActiveId(null);
      return;
    }

    setActiveId(currentHeading.id);
  }, [headingTops]);

  useEffect(() => {
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [onScroll]);

  // For post SSR
  useEffect(() => {
    onScroll();
  }, [onScroll]);

  if (!toc || !headingTops) return null;

  return (
    <ol
      className={cn(
        BLOG_GLASS_PANEL_SOFT,
        'sticky top-20 mt-8 ml-4 h-fit max-h-[calc(100vh-110px)] min-w-[180px] overflow-y-auto p-3',
      )}
    >
      {toc?.map((t) => (
        <li
          key={t.id}
          className={cn(
            'mb-1 cursor-pointer rounded-md px-2 py-1 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800',
            t.level === 0 && 'text-sm font-semibold',
            t.level === 1 && 'pl-3 text-xs',
            t.level >= 2 && 'pl-5 text-xs',
            activeId === t.id
              ? 'scale-[1.02] bg-point-4/50 font-bold text-zinc-900 dark:bg-point-1/20 dark:text-zinc-100'
              : 'text-zinc-500 dark:text-zinc-400',
          )}
        >
          <Link href={`#${t.id}`}>{t.text}</Link>
        </li>
      ))}
    </ol>
  );
}

export default BlogToc;
