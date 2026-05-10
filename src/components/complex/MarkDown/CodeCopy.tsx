import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import debounce from 'lodash/debounce';
import { cn } from '@utils/cn';
import { MarkdownItem } from './type';

type CodeCopyProps = {
  copyString: string;
} & MarkdownItem;

const CodeCopy = function CodeCopy({ children, copyString, ...props }: CodeCopyProps) {
  const [copied, setCopied] = useState(false);

  const resetCopied = useMemo(
    () =>
      debounce(() => {
        setCopied(false);
      }, 1000),
    [],
  );

  useEffect(() => () => resetCopied.cancel(), [resetCopied]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(copyString);
    setCopied(true);
    resetCopied();
  }, [copyString, resetCopied]);

  return (
    <div className="group relative w-full overflow-hidden rounded-xl border border-basic-3/85 bg-basic-0 shadow-sm">
      <div className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center">
        <button
          type="button"
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors',
            copied
              ? 'border-point-2/70 bg-point-2/20 text-point-2'
              : 'border-basic-4/80 bg-basic-1/80 text-fg-7 hover:border-basic-5 hover:text-fg-7',
          )}
          onClick={copyToClipboard}
          aria-label="Copy code"
        >
          <Copy className={cn('h-4 w-4', copied ? 'hidden' : '')} />
          <Check className={cn('h-4 w-4', !copied ? 'hidden' : '')} />
        </button>
      </div>
      <pre
        {...props}
        className={cn(
          'my-0 max-h-[560px] min-h-[42px] w-full overflow-auto p-4 pr-12 text-[13px] leading-6 text-fg-7',
          '[&>code]:bg-transparent [&>code]:p-0',
          props.className,
        )}
      >
        {children}
      </pre>
    </div>
  );
};

export default CodeCopy;
