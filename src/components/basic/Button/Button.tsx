/* eslint-disable react/require-default-props */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@utils/cn';

const buttonVariants = cva(
  'flex items-center justify-center min-h-[32px] rounded-md bg-point-2 hover:bg-point-1 p-1 text-lg font-normal text-white transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {},
    defaultVariants: {},
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ className }))} ref={ref} {...props} />;
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
