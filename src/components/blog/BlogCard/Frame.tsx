import React from 'react';
import Image from 'next/image';
import DateUtils from '@utils/dateUtils';
import { cn } from '@utils/cn';
import MarkdownUtils from '@utils/markdownUtils';
import { BLOG_GLASS_PANEL_SOFT } from '@components/blog/interactiveStyles';
import { BlogCardTypeFC } from './type';

const Frame: BlogCardTypeFC = function Frame({ blog }) {
  const { thumbnailImage, title, contents, createdAt } = blog;

  return (
    <article
      className={cn(BLOG_GLASS_PANEL_SOFT, 'group flex h-80 flex-col overflow-hidden md:h-96')}
    >
      {thumbnailImage ? (
        <div className="relative h-40 w-full overflow-hidden md:h-44">
          <Image
            src={`${thumbnailImage}?w=640`}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div className="h-40 w-full bg-gradient-to-r from-point-4/50 via-zinc-100 to-violet-100 dark:from-point-1/15 dark:via-zinc-800 dark:to-violet-900/20 md:h-44" />
      )}
      <div className="flex flex-1 flex-col p-4">
        <h2 className="line-clamp-1 text-base font-bold text-zinc-900 dark:text-zinc-100">
          {title}
        </h2>
        <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          {MarkdownUtils.removeMarkdown(contents)}
        </p>
        <span
          className="mt-auto pt-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400"
          suppressHydrationWarning
        >
          {DateUtils.foramtDate(createdAt)}
        </span>
      </div>
    </article>
  );
};

export default Frame;
