import * as React from 'react';
import { cn } from '@utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex min-h-9 w-full items-center rounded-lg border border-basic-3 px-3 py-1.5',
          'bg-basic-0 text-fg-1 placeholder:text-fg-5',
          'outline-none focus:border-focus focus:ring-2 focus:ring-point-2/25',
          'transition-colors duration-150 resize-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
