import React, { useCallback, useEffect, useState } from 'react';
import { useBlogDetail } from './BlogDetailProvider';
import Link from '@components/basic/Link';
import { cls } from '@utils/classNameUtils';
import ScrollUtils from '@utils/scrollUtils';

const BlogToc = () => {
  const { getScrollTop } = ScrollUtils;
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
    const scrollTop = getScrollTop();
    const headingTops = toc.map(({ id }) => {
      const el = document.getElementById(id);
      if (!el) {
        return {
          id,
          top: 0,
        };
      }
      const top = el.getBoundingClientRect().top + scrollTop;
      return {
        id,
        top,
      };
    });
    setHeadingTops(headingTops);
  }, [toc]);

  useEffect(() => {
    updateTocPositions();
    let prevScrollHeight = document.body.scrollHeight;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    function checkScrollHeight() {
      const scrollHeight = document.body.scrollHeight;
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
    const scrollTop = getScrollTop();
    if (!headingTops) return;
    const currentHeading = [...headingTops].reverse().find((headingTop) => {
      return scrollTop >= headingTop.top - 4;
    });
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
    <ol className="mt-8 ml-4 p-2 border-l-2 border-solid border-point-4 min-w-[150px] h-fit max-h-screen sticky top-20 overflow-y-scroll">
      {toc?.map((t) => (
        <li
          key={t.id}
          className={cls(
            't-d-2 couser-pointer hover:t-basic-1 transition-all',
            `pl-${2 * t.level}`,
            activeId === t.id ? 't-basic-1 font-bold scale-105' : 't-basic-5',
          )}
        >
          <Link href={`#${t.id}`}>{t.text}</Link>
        </li>
      ))}
    </ol>
  );
};

export default BlogToc;
