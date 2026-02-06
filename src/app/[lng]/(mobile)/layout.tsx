import React from 'react';
import AsideScreenWrapper from '@components/complex/Layout/AsideScreenWrapper';
import GoogleAd from '@components/google/GoogleAd';
import { SERVICE_PAGE_SURFACE } from '@components/complex/Service/interactiveStyles';
import BackToMenuNav from '@components/complex/Nav/BackToMenuNav';
import { ChildrenProps } from '~/app/[lng]/layout';

export default function MobileLayout({ children }: ChildrenProps) {
  return (
    <AsideScreenWrapper
      left={
        <GoogleAd
          className="w-48 min-h-80 h-fit mt-8 mr-4 ml-auto sticky top-20"
          slotId="9185479703"
        />
      }
      right={
        <GoogleAd
          className="w-48 min-h-80 h-fit mt-8 ml-4 mr-auto sticky top-20"
          slotId="8803068842"
        />
      }
    >
      <div className="relative w-full">
        <div className="pointer-events-none absolute left-6 top-4 h-24 w-24 rounded-full bg-point-2/25 blur-3xl" />
        <div className="pointer-events-none absolute right-8 top-28 h-20 w-20 rounded-full bg-violet-400/20 blur-3xl" />
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
