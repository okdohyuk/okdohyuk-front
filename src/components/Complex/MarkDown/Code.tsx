import React, { useState, useCallback } from 'react';
import { MdOutlineContentCopy, MdOutlineCheck } from 'react-icons/md';
import { debounce } from 'lodash';

import ClassName from '@utils/classNameUtils';

type CodeType = {
  children: React.ReactNode | string;
};

const Code = ({ children, ...props }: CodeType) => {
  const { cls } = ClassName;
  const [copied, setCopied] = useState<boolean>(false);

  const setServicesValueDebounced = useCallback(
    debounce(() => setCopied(false), 1000),
    [],
  );

  const copyToClipboard = () => {
    navigator.clipboard.writeText(children + '');

    setCopied(true);
    setServicesValueDebounced();
  };

  return (
    <div className="w-full overflow-auto min-h-[42px] h-auto my-4 relative">
      <pre
        {...props}
        className={'w-full overflow-auto min-h-[42px] h-auto p-2 rounded-md bg-basic-4 t-d-3'}
      >
        {children}
        <div className="absolute right-0 top-0 w-[42px] h-[42px] flex items-center justify-center">
          <button
            className={cls(
              'w-[32px] h-[32px] rounded-md bg-basic-5 border-2',
              copied ? 'border-point-4' : 'border-basic-3 hover:border-basic-2',
            )}
            onClick={copyToClipboard}
          >
            <MdOutlineContentCopy className={cls('m-auto t-basic-7', copied ? 'hidden' : '')} />
            <MdOutlineCheck className={cls('m-auto text-point-4', !copied ? 'hidden' : '')} />
          </button>
        </div>
      </pre>
    </div>
  );
};

export default Code;
