import React from 'react';
import Image from 'next/image';
import DateUtils from '@utils/dateUtils';
import { cn } from '@utils/cn';
import MarkdownUtils from '@utils/markdownUtils';
import { BLOG_GLASS_PANEL_SOFT } from '@components/blog/interactiveStyles';
import { BlogCardTypeFC } from './type';

const Discript: BlogCardTypeFC = function Discript({ blog }) {
  const { thumbnailImage, title, contents, createdAt } = blog;

  return (
    <article
      className={cn(
        BLOG_GLASS_PANEL_SOFT,
        'flex gap-4 overflow-hidden p-3 md:min-h-[200px] md:gap-6 md:p-4',
      )}
    >
      {thumbnailImage ? (
        <div className="relative h-[108px] w-[108px] shrink-0 overflow-hidden rounded-xl md:h-[196px] md:w-[196px]">
          <Image
            src={`${thumbnailImage}?w=640`}
            alt={title}
            fill
            sizes="(max-width: 768px) 108px, 196px"
            className="object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div className="h-[108px] w-[108px] shrink-0 rounded-xl bg-gradient-to-br from-point-4/60 to-violet-100 dark:from-point-1/20 dark:to-violet-900/30 md:h-[196px] md:w-[196px]" />
      )}
      <div className="flex flex-1 flex-col justify-start overflow-hidden text-left">
        <h2 className="my-1 line-clamp-1 text-base font-bold text-zinc-900 dark:text-zinc-100 md:my-3 md:text-lg">
          {title}
        </h2>
        <p className="line-clamp-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 md:line-clamp-4">
          {MarkdownUtils.removeMarkdown(contents)}
        </p>
        <span
          className="mt-auto pt-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 md:pb-1"
          suppressHydrationWarning
        >
          {DateUtils.foramtDate(createdAt)}
        </span>
      </div>
    </article>
  );
};

export default Discript;
