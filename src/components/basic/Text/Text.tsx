/* eslint-disable react/require-default-props */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@utils/cn';

const textVariants = cva('', {
  variants: {
    variant: {
      t1: 'text-4xl font-bold',
      t2: 'text-3xl font-bold',
      t3: 'text-2xl font-bold',
      d1: 'text-lg font-normal',
      d2: 'text-base font-normal',
      d3: 'text-sm font-normal',
      c1: 'text-xs font-light',
      c2: 'text-[10px] font-light',
      c3: 'text-[8px] font-light',
    },
    color: {
      'basic-0': 'text-black dark:text-white',
      'basic-1': 'text-zinc-900 dark:text-zinc-50',
      'basic-2': 'text-zinc-800 dark:text-zinc-100',
      'basic-3': 'text-zinc-700 dark:text-zinc-200',
      'basic-4': 'text-zinc-600 dark:text-zinc-300',
      'basic-5': 'text-zinc-500 dark:text-zinc-400',
      'basic-6': 'text-zinc-400 dark:text-zinc-500',
      'basic-7': 'text-zinc-300 dark:text-zinc-600',
      'basic-8': 'text-zinc-200 dark:text-zinc-700',
      'basic-9': 'text-zinc-100 dark:text-zinc-800',
      'basic-10': 'text-zinc-50 dark:text-zinc-900',
    },
  },
  defaultVariants: {
    variant: 'd1',
    color: 'basic-1',
  },
});

export interface TextProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'>,
    VariantProps<typeof textVariants> {
  asChild?: boolean;
}

const Text = React.forwardRef<HTMLSpanElement, TextProps>(
  ({ className, variant, color, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'span';
    return (
      <Comp className={cn(textVariants({ className, variant, color }))} ref={ref} {...props} />
    );
  },
);
Text.displayName = 'Text';

export { Text, textVariants };
