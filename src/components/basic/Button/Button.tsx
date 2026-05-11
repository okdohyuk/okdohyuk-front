/* eslint-disable react/require-default-props */

'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@utils/cn';
import { useElementTracking } from '@hooks/analytics/useElementTracking';

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
        className={cn(buttonVariants({ className }))}
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
