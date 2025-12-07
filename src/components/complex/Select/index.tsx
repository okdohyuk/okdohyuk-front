import React from 'react';
import { cls } from '@utils/classNameUtils';
import { SelectProps } from './type';

function Select({ className = '', children, form, value, onChange }: SelectProps) {
  const change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) onChange(e.target.value);
  };

  return (
    <div className={cls('inline-block relative', className)}>
      <select
        className="block appearance-none w-full h-full input-text leading-tight overflow-hidden"
        value={value}
        onChange={change}
        {...form}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg
          className="fill-current h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
}

export default Select;
