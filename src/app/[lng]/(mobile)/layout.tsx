import React from 'react';
import MobileScreenWrapper from '@components/complex/Layout/MobileScreenWrapper';

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return <MobileScreenWrapper>{children}</MobileScreenWrapper>;
}
