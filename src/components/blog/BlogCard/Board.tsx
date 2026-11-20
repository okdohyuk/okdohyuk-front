import React from 'react';
import Image from 'next/image';
import Tag from '@components/basic/Tag';
import { cn } from '@utils/cn';
import { BLOG_CARD } from '@components/blog/interactiveStyles';
import ThumbPlaceholder from './ThumbPlaceholder';
import { BlogCardTypeFC } from './type';

const Board: BlogCardTypeFC = function Board({ blog }) {
  const { thumbnailImage, title, isPublic, tags } = blog;

  return (
    <article
      className={cn(
        BLOG_CARD,
        'flex min-h-16 items-center gap-3 overflow-hidden p-2',
        isPublic
          ? ''
          : 'border-danger-3 bg-danger-4/60 dark:border-danger-1/50 dark:bg-danger-1/20',
      )}
    >
      {/* card 16px − padding 8px → 8px inner radius */}
      <div className="relative flex h-12 w-12 shrink-0 overflow-hidden rounded-md border border-basic-3">
        {thumbnailImage ? (
          <Image
            src={`${thumbnailImage}?w=200`}
            alt=""
            fill
            sizes="48px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <ThumbPlaceholder title={title} size="sm" />
        )}
      </div>

      <h2 className="line-clamp-1 min-w-0 flex-1 text-sm font-medium text-fg-1">{title}</h2>

      <div className="ml-auto flex shrink-0 gap-1 overflow-hidden whitespace-nowrap">
        {tags.map((t) => (
          <Tag tag={t} key={t} />
        ))}
      </div>
    </article>
  );
};

export default Board;
