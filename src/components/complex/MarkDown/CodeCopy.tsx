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
    <div className="group relative w-full overflow-hidden rounded-xl border border-zinc-700/40 bg-zinc-900 shadow-md">
      <div className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center">
        <button
          type="button"
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors duration-150',
            copied
              ? 'border-point-3/60 bg-point-3/20 text-point-3'
              : 'border-zinc-600/70 bg-zinc-800 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200',
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
          'my-0 max-h-[560px] min-h-[42px] w-full overflow-auto p-4 pr-12 text-[13px] leading-6 text-zinc-300',
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
