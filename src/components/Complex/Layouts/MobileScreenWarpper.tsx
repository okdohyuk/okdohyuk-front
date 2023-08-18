import React from 'react';
import ClassName from '@utils/classNameUtils';

type MobileScreenWarpperProps = {
  children: React.ReactNode;
  items?: 'center' | 'left' | 'right';
  text?: 'center' | 'left' | 'right';
  className?: string;
};

function MobileScreenWarpper({
  children,
  items = 'left',
  text = 'left',
  className = '',
}: MobileScreenWarpperProps) {
  const { cls } = ClassName;
  return (
    <div
      className={cls(
        'flex flex-col mx-auto w-full md:max-w-[512px] lg:max-w-[1024px] min-h-screen px-2 py-2 md:px-4 md:py-4 lg:px-6 lg:py-6 bg-zinc-100 dark:bg-zinc-900 ',
        'text-' + text,
        'items-' + items,
        className,
      )}
    >
      {children}
    </div>
  );
}

export default MobileScreenWarpper;
