import React from 'react';
import Image from 'next/image';
import Tag from '@components/basic/Tag';
import { cn } from '@utils/cn';
import { BLOG_GLASS_PANEL_SOFT } from '@components/blog/interactiveStyles';
import { BlogCardTypeFC } from './type';

const Board: BlogCardTypeFC = function Board({ blog }) {
  const { thumbnailImage, title, isPublic, tags } = blog;

  return (
    <article
      className={cn(
        BLOG_GLASS_PANEL_SOFT,
        'flex items-center overflow-hidden p-2',
        isPublic ? '' : 'border-red-300 bg-red-100/80 dark:border-red-600/50 dark:bg-red-900/25',
      )}
    >
      <div className="relative flex h-12 w-12 shrink-0 overflow-hidden rounded-lg">
        {thumbnailImage ? (
          <Image
            src={`${thumbnailImage}?w=200`}
            alt={title}
            fill
            sizes="48px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-point-4/60 to-violet-100 dark:from-point-1/20 dark:to-violet-900/30" />
        )}
      </div>

      <h2 className="ml-3 line-clamp-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">
        {title}
      </h2>

      <div className="ml-auto flex overflow-hidden whitespace-nowrap">
        {tags.map((t) => (
          <Tag tag={t} key={t} />
        ))}
      </div>
    </article>
  );
};

export default Board;
