import React from 'react';
import { cn } from '@utils/cn';
import { MarkdownComponent } from './type';

const Table: MarkdownComponent = function Table({ children, className = '', ...props }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200/85 bg-white/80 dark:border-zinc-700 dark:bg-zinc-900/70">
      <table
        {...props}
        className={cn(
          'min-w-full border-collapse text-sm',
          '[&_thead_tr]:bg-zinc-100/80 dark:[&_thead_tr]:bg-zinc-800/80',
          '[&_th]:whitespace-nowrap [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-[11px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-zinc-500 dark:[&_th]:text-zinc-300',
          '[&_tr]:border-t [&_tr]:border-zinc-200/80 dark:[&_tr]:border-zinc-700/70',
          '[&_td]:px-3 [&_td]:py-2 [&_td]:align-top [&_td]:text-zinc-700 dark:[&_td]:text-zinc-200',
          className,
        )}
      >
        {children}
      </table>
    </div>
  );
};

export default Table;
