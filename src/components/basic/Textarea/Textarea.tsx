import * as React from 'react';
import { cn } from '@utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'block min-h-[32px] w-full p-1 border border-basic-3 rounded-lg ' +
            'bg-basic-0 text-fg-1 ' +
            'focus:ring-2 focus:ring-point-1 focus:border-transparent outline-none ' +
            'transition-all duration-200 resize-none ' +
            'whitespace-pre-wrap break-words',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
