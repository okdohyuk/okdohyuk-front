/* eslint-disable react/require-default-props */
import React from 'react';
import { cn } from '@utils/cn';
import ServicePageMeta from './ServicePageMeta';

type ServicePageHeaderProps = {
  title: string;
  description?: string;
  badge?: string;
  className?: string;
};

/*
 * Tool page header — sits directly on the page, not in a panel.
 * Signature meta row (mono path + category + ⌘K), then a size-led title and description.
 */
function ServicePageHeader({ title, description, badge, className = '' }: ServicePageHeaderProps) {
  return (
    <header className={cn('pb-2 pt-1', className)}>
      <ServicePageMeta badge={badge} />
      <h1 className="mt-3 text-2xl font-semibold leading-tight text-fg-1 md:text-3xl">{title}</h1>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-fg-4 md:text-base">
          {description}
        </p>
      ) : null}
    </header>
  );
}

export default ServicePageHeader;
