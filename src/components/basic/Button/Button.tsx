/* eslint-disable react/require-default-props */

'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@utils/cn';
import { useElementTracking } from '@hooks/analytics/useElementTracking';

/*
 * Variants (unslop 2026-11-19)
 *  - primary   solid accent (point-2, white text 5.7:1). One per view: the main action.
 *  - secondary neutral raised surface + hairline, primary text.
 *  - ghost     no surface until hover. Toolbars, inline actions, "back" links.
 *  - danger    solid red for destructive confirmation only.
 * Radius 10px (rounded-lg) for every size so buttons share the control radius.
 * `flex` (not inline-flex) is kept in the base so existing layouts don't reflow.
 */
const buttonVariants = cva(
  [
    'flex items-center justify-center gap-2 rounded-lg font-medium',
    'transition-colors duration-150 ease-out',
    'focus-ring',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-point-2 text-white hover:bg-point-1',
        secondary: 'border border-basic-3 bg-basic-1 text-fg-1 hover:bg-basic-2',
        ghost: 'bg-transparent text-fg-3 hover:bg-basic-2 hover:text-fg-1',
        danger: 'bg-danger-1 text-white hover:bg-danger-1/90',
      },
      size: {
        sm: 'min-h-8 px-3 py-1 text-xs',
        md: 'min-h-9 px-4 py-2 text-sm',
        lg: 'min-h-11 px-5 py-2.5 text-base',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** GA4 추적 키. 지정 시 ui_button_click 이벤트가 발화됩니다. */
  analyticsKey?: string;
  /** GA4 이벤트에 동봉할 추가 파라미터 */
  analyticsParams?: Record<string, string | number | boolean>;
  /** true 시 dwell hover 추적(라우트당 1회) */
  trackHover?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      analyticsKey,
      analyticsParams,
      trackHover,
      onClick,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';

    // asChild=true일 때는 Slot에 핸들러 합성을 위해 추적을 비활성화 (props 안전성)
    const tracking = useElementTracking({
      analyticsKey: asChild ? undefined : analyticsKey,
      analyticsParams,
      trackHover,
      component: 'button',
      extra: { disabled: props.disabled ?? false },
    });

    const composedClick = tracking.handleClick(onClick);

    const composedMouseEnter = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onMouseEnter?.(event);
        tracking.handleMouseEnter();
      },
      [onMouseEnter, tracking],
    );

    const composedMouseLeave = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onMouseLeave?.(event);
        tracking.handleMouseLeave();
      },
      [onMouseLeave, tracking],
    );

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={composedClick}
        onMouseEnter={composedMouseEnter}
        onMouseLeave={composedMouseLeave}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
