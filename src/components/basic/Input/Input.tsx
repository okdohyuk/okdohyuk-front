import * as React from 'react';
import { cn } from '@utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex min-h-[32px] w-full items-center p-1 border border-gray-200 dark:border-gray-700 rounded-lg \n' +
            '                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100\n' +
            '                     focus:ring-2 focus:ring-point-1 focus:border-transparent outline-none\n' +
            '                     transition-all duration-200 resize-none',
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
