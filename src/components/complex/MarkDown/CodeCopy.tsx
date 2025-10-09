import React, { useState, useCallback } from 'react';
import { Check, Copy } from 'lucide-react';
import { debounce } from 'lodash';

import ClassName from '@utils/classNameUtils';
import { MarkdownItem } from './type';

type CodeCopyProps = {
  copyString: string;
} & MarkdownItem;

const CodeCopy = ({ children, copyString, ...props }: CodeCopyProps) => {
  const { cls } = ClassName;
  const [copied, setCopied] = useState<boolean>(false);

  const setServicesValueDebounced = useCallback(
    debounce(() => setCopied(false), 1000),
    [],
  );

  const copyToClipboard = () => {
    navigator.clipboard.writeText(copyString);

    setCopied(true);
    setServicesValueDebounced();
  };

  return (
    <div className="w-full overflow-auto min-h-[42px] h-auto my-4 relative">
      <pre
        {...props}
        className={cls(
          'w-full overflow-auto min-h-[42px] h-auto p-2 rounded-md t-d-3 my-0',
          props.className,
        )}
      >
        {children}
        <div className="absolute right-0 top-0 w-[42px] h-[42px] flex items-center justify-center">
          <button
            className={cls(
              'w-[32px] h-[32px] rounded-md bg-black border-2',
              copied
                ? 'border-point-2'
                : 'border-white hover:border-basic-5 [&>svg]:hover:t-basic-5',
            )}
            onClick={copyToClipboard}
          >
            <Copy className={cls('m-auto text-white', copied ? 'hidden' : '')} />
            <Check className={cls('m-auto text-point-2', !copied ? 'hidden' : '')} />
          </button>
        </div>
      </pre>
    </div>
  );
};

export default CodeCopy;
