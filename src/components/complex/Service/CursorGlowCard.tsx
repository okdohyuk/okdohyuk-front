/* eslint-disable react/require-default-props */

'use client';

import React, { CSSProperties, useCallback, useRef } from 'react';
import { cn } from '@utils/cn';

type CursorGlowCardProps = {
  children: React.ReactNode;
  className?: string;
};

function CursorGlowCard({ children, className = '' }: CursorGlowCardProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return;

    const root = rootRef.current;
    if (!root) return;

    const { left, top } = root.getBoundingClientRect();
    root.style.setProperty('--cursor-x', `${event.clientX - left}px`);
    root.style.setProperty('--cursor-y', `${event.clientY - top}px`);
  }, []);

  return (
    <div
      ref={rootRef}
      onPointerMove={onPointerMove}
      className={cn('group/cursor-glow relative rounded-2xl', className)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/cursor-glow:opacity-100"
        style={
          {
            background:
              'radial-gradient(180px circle at var(--cursor-x, 50%) var(--cursor-y, 50%), rgba(124, 58, 237, 0.45), rgba(59, 130, 246, 0.25) 45%, transparent 72%)',
          } as CSSProperties
        }
      />
      <div className="relative rounded-[inherit]">{children}</div>
    </div>
  );
}

export default CursorGlowCard;
