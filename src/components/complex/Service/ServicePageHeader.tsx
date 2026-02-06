/* eslint-disable react/require-default-props */
import React from 'react';
import { cn } from '@utils/cn';
import { SERVICE_PANEL } from './interactiveStyles';

type ServicePageHeaderProps = {
  title: string;
  description?: string;
  badge?: string;
  className?: string;
};

function ServicePageHeader({ title, description, badge, className = '' }: ServicePageHeaderProps) {
  return (
    <header
      className={cn(SERVICE_PANEL, 'relative overflow-hidden px-5 py-6 md:px-7 md:py-7', className)}
    >
      <div className="pointer-events-none absolute -left-12 top-0 h-28 w-28 rounded-full bg-point-2/30 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-6 h-20 w-20 rounded-full bg-violet-400/20 blur-3xl" />
      {badge ? (
        <p className="relative z-10 mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-point-1">
          {badge}
        </p>
      ) : null}
      <h1 className="relative z-10 text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 md:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="relative z-10 mt-2 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          {description}
        </p>
      ) : null}
    </header>
  );
}

export default ServicePageHeader;
