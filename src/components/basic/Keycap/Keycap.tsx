import * as React from 'react';
import { cn } from '@utils/cn';

/*
 * Keycap — small mono key label for keyboard shortcuts (⌘K, ESC, ↵).
 * Part of the okdohyuk.dev signature (mono path + keycap). 4px radius, hairline, muted text.
 */
export interface KeycapProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

const Keycap = React.forwardRef<HTMLElement, KeycapProps>(({ className, ...props }, ref) => (
  <kbd
    ref={ref}
    className={cn(
      'inline-flex h-5 min-w-5 items-center justify-center rounded-xs border border-basic-3 bg-basic-1 px-1.5',
      'font-mono text-2xs font-normal leading-none text-fg-5 tabular-nums',
      className,
    )}
    {...props}
  />
));
Keycap.displayName = 'Keycap';

export { Keycap };
