import React from 'react';
import { translationsMetadata, GenerateMetadata } from '@libs/server/customMetadata';

export const generateMetadata: GenerateMetadata = ({ params }) =>
  translationsMetadata({ params, ns: 'coder' });

export default function CoderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
