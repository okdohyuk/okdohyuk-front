/* eslint-disable react/require-default-props */
import React from 'react';
import { cn } from '@utils/cn';
import { SERVICE_PANEL_SOFT } from './interactiveStyles';

type ServiceInfoNoticeProps = {
  icon: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  textClassName?: string;
  iconContainerClassName?: string;
};

function ServiceInfoNotice({
  icon,
  children,
  action = null,
  className = '',
  textClassName = '',
  iconContainerClassName = '',
}: ServiceInfoNoticeProps) {
  return (
    <section
      className={cn(SERVICE_PANEL_SOFT, 'flex flex-wrap items-center gap-3 px-4 py-3', className)}
    >
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-point-4/70 text-point-1 dark:bg-point-1/20',
          iconContainerClassName,
        )}
      >
        {icon}
      </div>
      <div
        className={cn(
          'min-w-0 flex-1 text-sm font-medium leading-relaxed text-zinc-700 dark:text-zinc-200',
          textClassName,
        )}
      >
        {children}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </section>
  );
}

export default ServiceInfoNotice;
