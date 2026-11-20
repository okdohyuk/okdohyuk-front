/* eslint-disable react/require-default-props */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@utils/cn';

const textVariants = cva('', {
  variants: {
    variant: {
      // Hierarchy by size and colour; 500 for titles, 400 for body. Captions floor at 11px.
      t1: 'text-4xl font-medium leading-tight',
      t2: 'text-3xl font-medium leading-tight',
      t3: 'text-2xl font-medium leading-snug',
      d1: 'text-lg font-normal',
      d2: 'text-base font-normal',
      d3: 'text-sm font-normal',
      c1: 'text-xs font-normal',
      c2: 'text-2xs font-normal',
      c3: 'text-2xs font-normal',
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
      // Opt out of the default fg colour so the parent's color (e.g. an inline style) applies.
      inherit: 'text-inherit',
    },
  },
  defaultVariants: {
    variant: 'd1',
    color: 'basic-1',
  },
});

export interface TextProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'>, VariantProps<typeof textVariants> {
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
