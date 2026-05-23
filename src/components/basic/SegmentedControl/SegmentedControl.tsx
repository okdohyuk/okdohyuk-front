/* eslint-disable react/require-default-props */

'use client';

import * as React from 'react';
import { cn } from '@utils/cn';

export type SegmentedControlOption<T extends string> = {
  value: T;
  label: React.ReactNode;
  disabled?: boolean;
};

export interface SegmentedControlProps<T extends string> {
  name?: string;
  value: T;
  onChange: (value: T) => void;
  options: SegmentedControlOption<T>[];
  ariaLabel?: string;
  className?: string;
  size?: 'sm' | 'md';
}

function SegmentedControlInner<T extends string>({
  name,
  value,
  onChange,
  options,
  ariaLabel,
  className,
  size = 'md',
}: SegmentedControlProps<T>) {
  const sizeClass = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-3 py-2 text-sm';

  return (
    <div role="radiogroup" aria-label={ariaLabel} className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={option.disabled}
            data-state={active ? 'on' : 'off'}
            name={name}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-md font-semibold transition-colors outline-none',
              'focus-visible:ring-2 focus-visible:ring-point-1',
              'disabled:cursor-not-allowed disabled:opacity-50',
              sizeClass,
              active
                ? 'bg-point-2 text-white shadow-sm'
                : 'bg-basic-2 text-fg-5 hover:bg-basic-3 hover:text-fg-3',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export const SegmentedControl = SegmentedControlInner;
