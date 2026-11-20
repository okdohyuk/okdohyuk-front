import React from 'react';
import Image from 'next/image';
import { cn } from '@utils/cn';
import MarkdownUtils from '@utils/markdownUtils';
import { BLOG_CARD } from '@components/blog/interactiveStyles';
import CardMeta from './CardMeta';
import ThumbPlaceholder from './ThumbPlaceholder';
import { BlogCardTypeFC } from './type';

const Frame: BlogCardTypeFC = function Frame({ blog }) {
  const { thumbnailImage, title, contents, createdAt, tags } = blog;

  return (
    <article className={cn(BLOG_CARD, 'flex h-80 flex-col overflow-hidden md:h-96')}>
      {/* Image runs edge to edge under the card's own clip; a hairline separates it from text */}
      <div className="relative h-40 w-full shrink-0 overflow-hidden border-b border-basic-3 md:h-44">
        {thumbnailImage ? (
          <Image
            src={`${thumbnailImage}?w=640`}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
            unoptimized
          />
        ) : (
          <ThumbPlaceholder title={title} size="lg" />
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-4">
        <h2 className="line-clamp-2 text-base font-medium leading-snug text-fg-1">{title}</h2>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-fg-4">
          {MarkdownUtils.removeMarkdown(contents)}
        </p>
        <CardMeta createdAt={createdAt} tags={tags} className="mt-auto pt-3" />
      </div>
    </article>
  );
};

export default Frame;
