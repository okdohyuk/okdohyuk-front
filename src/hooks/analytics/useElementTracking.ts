'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { sendGAEvent } from '@libs/client/gtag';

const HOVER_DWELL_MS = 150;

type Component = 'button' | 'link';

type UseElementTrackingOptions = {
  analyticsKey: string | undefined;
  analyticsParams?: Record<string, string | number | boolean>;
  trackHover?: boolean;
  component: Component;
  extra?: Record<string, unknown>;
};

type UseElementTrackingReturn = {
  handleClick: <E extends React.MouseEvent<any>>(
    originalHandler?: (event: E) => void,
  ) => (event: E) => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
};

const NOOP = () => {};

export function useElementTracking(options: UseElementTrackingOptions): UseElementTrackingReturn {
  const { analyticsKey, analyticsParams, trackHover, component, extra } = options;
  const pathname = usePathname();

  const dwellTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedHoverRef = React.useRef<Set<string>>(new Set());

  // 라우트 바뀔 때 hover dedupe set 리셋
  React.useEffect(() => {
    firedHoverRef.current = new Set();
    return () => {
      if (dwellTimerRef.current) {
        clearTimeout(dwellTimerRef.current);
        dwellTimerRef.current = null;
      }
    };
  }, [pathname]);

  const enabled = typeof analyticsKey === 'string' && analyticsKey.length > 0;

  const buildParams = React.useCallback(() => {
    return {
      analytics_key: analyticsKey,
      component,
      ...(analyticsParams ?? {}),
      ...(extra ?? {}),
    };
  }, [analyticsKey, analyticsParams, component, extra]);

  const fireClick = React.useCallback(() => {
    if (!enabled) return;
    const event = component === 'button' ? 'ui_button_click' : 'ui_link_click';
    sendGAEvent(event, analyticsKey as string, buildParams());
  }, [enabled, component, analyticsKey, buildParams]);

  const fireHover = React.useCallback(() => {
    if (!enabled) return;
    const dedupeKey = `${pathname}::${analyticsKey}`;
    if (firedHoverRef.current.has(dedupeKey)) return;
    firedHoverRef.current.add(dedupeKey);
    const event = component === 'button' ? 'ui_button_hover' : 'ui_link_hover';
    sendGAEvent(event, analyticsKey as string, buildParams());
  }, [enabled, component, analyticsKey, pathname, buildParams]);

  const handleClick = React.useCallback(
    <E extends React.MouseEvent<any>>(originalHandler?: (event: E) => void) => {
      if (!enabled && !originalHandler) return NOOP as (event: E) => void;
      return (event: E) => {
        try {
          originalHandler?.(event);
        } finally {
          fireClick();
        }
      };
    },
    [enabled, fireClick],
  );

  const handleMouseEnter = React.useCallback(() => {
    if (!enabled || !trackHover) return;
    if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
    dwellTimerRef.current = setTimeout(() => {
      fireHover();
      dwellTimerRef.current = null;
    }, HOVER_DWELL_MS);
  }, [enabled, trackHover, fireHover]);

  const handleMouseLeave = React.useCallback(() => {
    if (dwellTimerRef.current) {
      clearTimeout(dwellTimerRef.current);
      dwellTimerRef.current = null;
    }
  }, []);

  return { handleClick, handleMouseEnter, handleMouseLeave };
}

export default useElementTracking;
