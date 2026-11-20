import * as React from 'react';
import { cn } from '@utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'block min-h-9 w-full rounded-lg border border-basic-3 px-3 py-2 ' +
            'bg-basic-0 text-fg-1 placeholder:text-fg-5 ' +
            'outline-none focus:border-focus focus:ring-2 focus:ring-point-2/25 ' +
            'transition-colors duration-150 resize-none ' +
            'disabled:cursor-not-allowed disabled:opacity-50 ' +
            // textarea 는 세로 스크롤만: 가로 스크롤바(모바일/레티나 미세 오버플로) 제거
            'overflow-x-hidden overflow-y-auto whitespace-pre-wrap break-words',
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
