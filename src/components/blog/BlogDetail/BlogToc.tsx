import React, { useCallback, useEffect, useState } from 'react';
import Link from '@components/basic/Link';
import { cn } from '@utils/cn';
import ScrollUtils from '@utils/scrollUtils';
import { useBlogDetail } from 'components/blog/BlogDetail/BlogDetailProvider';
import { useTranslation } from '~/app/i18n/client';

function BlogToc() {
  const { toc, lng } = useBlogDetail();
  const { t } = useTranslation(lng, 'blog/index');
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
      .filter((heading) => heading !== null) as { id: string; top: number }[];
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

  // Quiet outline: muted text on a hairline rail. Only the active item gets the accent
  // (text + its rail segment); size and weight never change, so nothing shifts on scroll.
  return (
    <nav
      aria-label={t('toc')}
      className="sticky top-8 mx-4 mt-8 h-fit max-h-[calc(100vh-4rem)] w-full max-w-56 overflow-y-auto"
    >
      <p className="mb-2 text-xs text-fg-5">{t('toc')}</p>
      <ol className="border-l border-basic-3">
        {toc.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <Link
                href={`#${item.id}`}
                aria-current={isActive ? 'location' : undefined}
                className={cn(
                  '-ml-px block border-l py-1 pr-2 text-sm leading-5 transition-colors duration-150',
                  'focus-ring-inset',
                  item.level === 0 && 'pl-3',
                  item.level === 1 && 'pl-6 text-xs leading-4',
                  item.level >= 2 && 'pl-9 text-xs leading-4',
                  isActive
                    ? 'border-point-2 text-point-fg'
                    : 'border-transparent text-fg-5 hover:text-fg-2',
                )}
              >
                {item.text}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default BlogToc;
