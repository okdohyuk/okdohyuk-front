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
      'basic-0': 'text-fg-0',
      'basic-1': 'text-fg-1',
      'basic-2': 'text-fg-2',
      'basic-3': 'text-fg-3',
      'basic-4': 'text-fg-4',
      'basic-5': 'text-fg-5',
      'basic-6': 'text-fg-6',
      'basic-7': 'text-fg-7',
      'basic-8': 'text-basic-3',
      'basic-9': 'text-basic-2',
      'basic-10': 'text-basic-1',
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
