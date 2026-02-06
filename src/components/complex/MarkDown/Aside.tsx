import React from 'react';
import { cn } from '@utils/cn';
import { MarkdownComponent } from './type';

const Aside: MarkdownComponent = function Aside({ children, ...props }) {
  return (
    <aside
      {...props}
      className={cn(
        'my-4 w-full rounded-xl border border-point-2/45 bg-point-4/55 px-4 py-3',
        'text-sm leading-relaxed text-zinc-700 dark:border-point-2/35 dark:bg-point-1/20 dark:text-zinc-200',
        '[&>p]:my-0',
        props.className,
      )}
    >
      {children}
    </aside>
  );
};

export default Aside;
