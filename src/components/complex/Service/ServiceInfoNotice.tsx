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
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-basic-2 text-fg-4 [&_svg]:h-4 [&_svg]:w-4',
          iconContainerClassName,
        )}
      >
        {icon}
      </div>
      <div className={cn('min-w-0 flex-1 text-sm leading-relaxed text-fg-3', textClassName)}>
        {children}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </section>
  );
}

export default ServiceInfoNotice;
