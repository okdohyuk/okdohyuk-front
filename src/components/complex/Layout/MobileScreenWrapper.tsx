/* eslint-disable react/require-default-props */
import React, { JSX } from 'react';
import { cn } from '@utils/cn';

type MobileScreenWrapperProps = {
  children: React.ReactNode;
  items?: 'center' | 'left' | 'right';
  text?: 'center' | 'left' | 'right';
  className?: string;
};

function MobileScreenWrapper({
  children,
  items = 'left',
  text = 'left',
  className = '',
}: MobileScreenWrapperProps): JSX.Element {
  return (
    <div
      className={cn(
        'relative flex flex-col ',
        'mx-auto mt-safe w-full md:max-w-[512px] lg:max-w-[1024px] min-h-screen p-2 md:p-4 lg:p-6 ',
        'bg-gradient-to-br from-zinc-100 via-zinc-100 to-point-4/35 dark:from-zinc-900 dark:via-zinc-900 dark:to-point-1/15 overflow-x-hidden break-words ',
        `text-${text}`,
        ` items-${items}`,
        className,
      )}
    >
      {children}
    </div>
  );
}

export default MobileScreenWrapper;
