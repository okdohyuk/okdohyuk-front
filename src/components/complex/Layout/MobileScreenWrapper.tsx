/* eslint-disable react/require-default-props */
import React, { JSX } from 'react';
import { cn } from '@utils/cn';

type MobileScreenWrapperProps = {
  children: React.ReactNode;
  items?: 'center' | 'left' | 'right';
  text?: 'center' | 'left' | 'right';
  className?: string;
};

// Static class maps so Tailwind can see every class (template strings like `text-${x}` are
// invisible to the scanner).
const TEXT_ALIGN = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

// `left` keeps the default stretch (the old `items-left` class never existed in Tailwind).
const ITEMS_ALIGN = {
  left: '',
  center: 'items-center',
  right: 'items-end',
} as const;

/*
 * Content column for tool and blog pages. No background of its own — the page canvas shows
 * through, and each tool card is the only surface (unslop: one layer, no box-in-box).
 */
function MobileScreenWrapper({
  children,
  items = 'left',
  text = 'left',
  className = '',
}: MobileScreenWrapperProps): JSX.Element {
  return (
    <div
      className={cn(
        'relative flex flex-col',
        'mx-auto mt-safe w-full min-h-screen md:max-w-lg lg:max-w-5xl',
        'px-4 pt-4 md:px-6 md:pt-6 lg:px-8 lg:pt-8',
        'overflow-x-hidden break-words',
        TEXT_ALIGN[text],
        ITEMS_ALIGN[items],
        className,
      )}
    >
      {children}
    </div>
  );
}

export default MobileScreenWrapper;
