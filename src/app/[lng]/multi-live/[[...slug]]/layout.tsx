import React from 'react';
import MultiLiveTracker from '@components/analytics/MultiLiveTracker';
import { ChildrenProps } from '~/app/[lng]/layout';
import { Language } from '~/app/i18n/settings';

type LayoutProps = ChildrenProps & { popup: React.ReactNode };

export type SlugParams = { params: Promise<{ slug?: string[]; lng: Language }> };

export type MultiLiveProps = SlugParams;

export default function MultiLiveLayout({ children, popup }: LayoutProps) {
  return (
    <>
      <MultiLiveTracker />
      {children}
      {popup}
    </>
  );
}
