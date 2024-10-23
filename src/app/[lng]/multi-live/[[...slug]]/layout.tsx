import React from 'react';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';

type LayoutProps = { children: React.ReactNode; popup: React.ReactNode };

export const generateMetadata: GenerateMetadata = ({ params }) =>
  translationsMetadata({ params, ns: 'multi-live' });

export default function layout({ children, popup }: LayoutProps) {
  return (
    <>
      {children}
      {popup}
    </>
  );
}
