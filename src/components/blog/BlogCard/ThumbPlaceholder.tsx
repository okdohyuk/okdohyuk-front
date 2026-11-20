/* eslint-disable react/require-default-props */
import React from 'react';
import { cn } from '@utils/cn';

/*
 * Quiet stand-in for a post without a thumbnail: a raised neutral tile ruled like graph
 * paper (hairline lines, same colour as borders) with the title's first character in muted
 * mono. No hue, no gradient wash — it should read as an empty page on the workbench.
 */
const GRAPH_PAPER_STYLE: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(var(--hairline) 1px, transparent 1px), linear-gradient(90deg, var(--hairline) 1px, transparent 1px)',
  backgroundSize: '16px 16px',
  backgroundPosition: '-1px -1px',
};

const SIZE_CLASS = {
  sm: 'text-base',
  md: 'text-2xl md:text-4xl',
  lg: 'text-4xl',
} as const;

type ThumbPlaceholderProps = {
  title: string;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
};

function ThumbPlaceholder({ title, size = 'md', className = '' }: ThumbPlaceholderProps) {
  const initial = Array.from(title.trim())[0]?.toUpperCase() ?? '';

  return (
    <div
      aria-hidden
      data-testid="blog-thumb-placeholder"
      className={cn(
        'flex h-full w-full items-center justify-center bg-basic-1 font-mono font-medium text-fg-5 dark:bg-basic-2',
        SIZE_CLASS[size],
        className,
      )}
      style={GRAPH_PAPER_STYLE}
    >
      {initial}
    </div>
  );
}

export default ThumbPlaceholder;
