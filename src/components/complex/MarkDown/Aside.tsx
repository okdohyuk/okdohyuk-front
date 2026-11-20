import React from 'react';
import { cn } from '@utils/cn';
import { MarkdownComponent } from './type';

const Aside: MarkdownComponent = function Aside({ children, ...props }) {
  return (
    <aside
      {...props}
      className={cn(
        'my-4 w-full rounded-xl border border-basic-3 bg-basic-1 px-4 py-3',
        'text-sm leading-relaxed text-fg-3',
        '[&>p]:my-0',
        props.className,
      )}
    >
      {children}
    </aside>
  );
};

export default Aside;
