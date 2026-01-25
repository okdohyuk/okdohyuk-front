import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { debounce } from 'lodash';
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
    <div className="w-full overflow-auto min-h-[42px] h-auto my-4 relative">
      <pre
        {...props}
        className={cn(
          'w-full overflow-auto min-h-[42px] h-auto p-2 rounded-md t-d-3 my-0 relative',
          props.className,
        )}
      >
        {children}
        <div className="absolute right-0 top-0 w-[42px] h-[42px] flex items-center justify-center">
          <button
            type="button"
            className={cn(
              'w-[32px] h-[32px] rounded-md bg-black border-2',
              copied
                ? 'border-point-2'
                : 'border-zinc-200 hover:border-basic-5 [&>svg]:hover:t-basic-5',
            )}
            onClick={copyToClipboard}
          >
            <Copy className={cn('m-auto text-zinc-200 hover:t-basic-5', copied ? 'hidden' : '')} />
            <Check className={cn('m-auto text-point-2', !copied ? 'hidden' : '')} />
          </button>
        </div>
      </pre>
    </div>
  );
};

export default CodeCopy;
