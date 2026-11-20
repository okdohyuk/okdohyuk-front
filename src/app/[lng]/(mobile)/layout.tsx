import React from 'react';
import AsideScreenWrapper from '@components/complex/Layout/AsideScreenWrapper';
import { SERVICE_PAGE_SURFACE } from '@components/complex/Service/interactiveStyles';
import BackToMenuNav from '@components/complex/Nav/BackToMenuNav';
import { cn } from '@utils/cn';
import { ChildrenProps } from '~/app/[lng]/layout';

// One layer: tool content sits on the page canvas, no wrapping surface. The footer below
// already reserves room for the floating mobile nav, so the section only needs section spacing.
export default function MobileLayout({ children }: ChildrenProps) {
  return (
    <AsideScreenWrapper>
      <section className={cn(SERVICE_PAGE_SURFACE, 'pb-12')}>
        <BackToMenuNav />
        {children}
      </section>
    </AsideScreenWrapper>
  );
}
