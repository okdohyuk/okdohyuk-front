import React from 'react';
import AsideScreenWrapper from '@components/complex/Layout/AsideScreenWrapper';
import GoogleAd from '@components/google/GoogleAd';
import { ChildrenProps } from '~/app/[lng]/layout';

export default function MobileLayout({ children }: ChildrenProps) {
  return (
    <AsideScreenWrapper
      left={
        <GoogleAd
          className="w-48 min-h-80 h-fit mt-8 mr-4 ml-auto sticky top-20 bg-basic-3"
          slotId="9185479703"
        />
      }
      right={
        <GoogleAd
          className="w-48 min-h-80 h-fit mt-8 ml-4 mr-auto sticky top-20 bg-basic-3"
          slotId="8803068842"
        />
      }
    >
      {children}
    </AsideScreenWrapper>
  );
}
