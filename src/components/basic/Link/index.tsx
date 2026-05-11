/* eslint-disable react/require-default-props */

'use client';

import React from 'react';
import NextLink from 'next/link';
import { useElementTracking } from '@hooks/analytics/useElementTracking';

type LinkType = {
  children: React.ReactNode;
  href: string;
  hasTargetBlank?: boolean;
  className?: string;
  /** GA4 추적 키. 지정 시 ui_link_click 이벤트가 발화됩니다. */
  analyticsKey?: string;
  /** GA4 이벤트에 동봉할 추가 파라미터 */
  analyticsParams?: Record<string, string | number | boolean>;
  /** true 시 dwell hover 추적(라우트당 1회) */
  trackHover?: boolean;
  [key: string]: any;
};

export default function Link({
  children,
  href,
  hasTargetBlank = false,
  className = '',
  analyticsKey,
  analyticsParams,
  trackHover,
  ...rest
}: LinkType) {
  const { onClick, onMouseEnter, onMouseLeave, ...passthrough } = rest as {
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
    onMouseEnter?: React.MouseEventHandler<HTMLAnchorElement>;
    onMouseLeave?: React.MouseEventHandler<HTMLAnchorElement>;
    [key: string]: any;
  };

  const tracking = useElementTracking({
    analyticsKey,
    analyticsParams,
    trackHover,
    component: 'link',
    extra: { href, is_external: hasTargetBlank },
  });

  const composedClick = tracking.handleClick(onClick);

  const composedMouseEnter = React.useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      onMouseEnter?.(event);
      tracking.handleMouseEnter();
    },
    [onMouseEnter, tracking],
  );

  const composedMouseLeave = React.useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      onMouseLeave?.(event);
      tracking.handleMouseLeave();
    },
    [onMouseLeave, tracking],
  );

  return (
    <NextLink
      href={href}
      {...passthrough}
      target={hasTargetBlank ? '_blank' : '_self'}
      className={className}
      onClick={composedClick}
      onMouseEnter={composedMouseEnter}
      onMouseLeave={composedMouseLeave}
    >
      {children}
    </NextLink>
  );
}
