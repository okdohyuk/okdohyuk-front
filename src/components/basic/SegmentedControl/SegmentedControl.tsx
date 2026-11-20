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
  const sizeClass = size === 'sm' ? 'min-h-8 px-3 py-1.5 text-xs' : 'min-h-9 px-3 py-2 text-sm';

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
              'rounded-lg border font-medium transition-colors duration-150 outline-none',
              'focus-ring',
              'disabled:cursor-not-allowed disabled:opacity-50',
              sizeClass,
              active
                ? 'border-point-2 bg-point-2 text-white'
                : 'border-basic-3 bg-basic-0 text-fg-4 hover:bg-basic-2 hover:text-fg-1',
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
