/* eslint-disable react/require-default-props */
import React from 'react';
import { format } from 'date-fns';
import { cn } from '@utils/cn';
import { BLOG_META } from '@components/blog/interactiveStyles';

const MAX_TAGS = 3;

type CardMetaProps = {
  createdAt?: string;
  tags?: string[];
  className?: string;
};

const toDate = (value?: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/*
 * Quiet meta line for list cards: ISO date in mono tabular figures, then up to three tags
 * as plain muted text. Same `yyyy-MM-dd` format as the post header so dates read the same
 * everywhere (the old relative "3일 전" was Korean-only on every locale).
 */
function CardMeta({ createdAt, tags = [], className = '' }: CardMetaProps) {
  const date = toDate(createdAt);
  const visibleTags = tags.slice(0, MAX_TAGS);

  return (
    <div className={cn(BLOG_META, 'flex min-w-0 items-center gap-2', className)}>
      {date ? (
        <time dateTime={date.toISOString()} className="shrink-0 font-mono tabular-nums">
          {format(date, 'yyyy-MM-dd')}
        </time>
      ) : null}
      {visibleTags.length > 0 ? (
        <span className="min-w-0 truncate">
          {visibleTags.map((tag) => (
            <span key={tag} className="mr-2 last:mr-0">
              #{tag}
            </span>
          ))}
        </span>
      ) : null}
    </div>
  );
}

export default CardMeta;
