import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import debounce from 'lodash/debounce';
import { cn } from '@utils/cn';

const COPIED_RESET_MS = 1000;

type CodeCopyProps = {
  children: React.ReactNode;
  /** Raw code, copied as-is. */
  copyString: string;
  /** Language shown in the header; empty hides it (plain text). */
  label?: string;
  className?: string;
};

// The code surface stays graphite in both themes; Prism token colours in prism.css are
// tuned against it. `not-prose` keeps Typography's pre/code rules out of the way.
const CodeCopy = function CodeCopy({ children, copyString, label = '', className }: CodeCopyProps) {
  const [copied, setCopied] = useState(false);

  const resetCopied = useMemo(
    () =>
      debounce(() => {
        setCopied(false);
      }, COPIED_RESET_MS),
    [],
  );

  useEffect(() => () => resetCopied.cancel(), [resetCopied]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(copyString);
      setCopied(true);
      resetCopied();
    } catch {
      // Clipboard can be blocked (permissions, insecure context); leave the icon as is.
    }
  }, [copyString, resetCopied]);

  return (
    <div className="code-block not-prose w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      <div className="flex h-9 items-center justify-between gap-3 border-b border-zinc-800 pl-4 pr-1.5">
        <span className="truncate font-mono text-xs text-zinc-400">{label}</span>
        <button
          type="button"
          className={cn(
            'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors duration-150',
            'focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-zinc-400',
            copied
              ? 'bg-zinc-800 text-zinc-100'
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100',
          )}
          onClick={copyToClipboard}
          aria-label={copied ? 'Copied' : 'Copy code'}
        >
          {copied ? (
            <Check strokeWidth={1.75} aria-hidden className="h-4 w-4" />
          ) : (
            <Copy strokeWidth={1.75} aria-hidden className="h-4 w-4" />
          )}
        </button>
      </div>
      <pre
        className={cn(
          'my-0 max-h-140 w-full overflow-auto px-4 py-3 font-mono text-[13px] leading-relaxed text-zinc-200',
          className,
        )}
      >
        {children}
      </pre>
    </div>
  );
};

// React 19 ignores defaultProps on function components (the destructuring defaults above
// are what apply); kept only to satisfy react/require-default-props, as elsewhere in the repo.
CodeCopy.defaultProps = {
  label: '',
  className: undefined,
};

export default CodeCopy;
