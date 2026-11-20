/* eslint-disable react/require-default-props */
import React from 'react';
import { cn } from '@utils/cn';

type CursorGlowCardProps = {
  children: React.ReactNode;
  className?: string;
};

/*
 * Kept for API compatibility (Home bento, menu, pokemon hub, favorites).
 * The cursor-following violet/blue glow and hover lift were removed in the unslop pass —
 * this is now a plain wrapper; the child card owns its surface and hover colour.
 */
function CursorGlowCard({ children, className = '' }: CursorGlowCardProps) {
  return <div className={cn('relative rounded-2xl', className)}>{children}</div>;
}

export default CursorGlowCard;
