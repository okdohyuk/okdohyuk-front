import React from 'react';
import { cn } from '@utils/cn';
import { MarkdownComponent } from './type';

const Table: MarkdownComponent = function Table({ children, className = '', ...props }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-basic-3/85 bg-basic-0/80">
      <table
        {...props}
        className={cn(
          'min-w-full border-collapse text-sm',
          '[&_thead_tr]:bg-basic-2/80',
          '[&_th]:whitespace-nowrap [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-[11px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-fg-5',
          '[&_tr]:border-t [&_tr]:border-basic-3/80',
          '[&_td]:px-3 [&_td]:py-2 [&_td]:align-top [&_td]:text-fg-3',
          className,
        )}
      >
        {children}
      </table>
    </div>
  );
};

export default Table;
