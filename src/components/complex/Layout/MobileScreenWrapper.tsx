/* eslint-disable react/require-default-props */
import React, { JSX } from 'react';
import ClassName from '@utils/classNameUtils';

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
  const { cls } = ClassName;
  return (
    <div
      className={cls(
        'relative flex flex-col ',
        'mx-auto mt-safe w-full md:max-w-[512px] lg:max-w-[1024px] min-h-screen p-2 md:p-4 lg:p-6 ',
        'bg-zinc-100 dark:bg-zinc-900 overflow-x-hidden break-words ',
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
