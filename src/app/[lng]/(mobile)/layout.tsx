import React from 'react';
import AsideScreenWrapper from '@components/complex/Layout/AsideScreenWrapper';
import { SERVICE_PAGE_SURFACE } from '@components/complex/Service/interactiveStyles';
import BackToMenuNav from '@components/complex/Nav/BackToMenuNav';
import { ChildrenProps } from '~/app/[lng]/layout';

export default function MobileLayout({ children }: ChildrenProps) {
  return (
    <AsideScreenWrapper>
      <div className="relative w-full">
        <div className="pointer-events-none absolute left-6 top-4 h-24 w-24 rounded-full bg-point-2/25 blur-3xl" />
        <div className="pointer-events-none absolute right-8 top-28 h-20 w-20 rounded-full bg-point-3/20 blur-3xl" />
        <section
          className={`${SERVICE_PAGE_SURFACE} relative z-10 pb-[calc(84px+env(safe-area-inset-bottom))]`}
        >
          <BackToMenuNav />
          {children}
        </section>
      </div>
    </AsideScreenWrapper>
  );
}
