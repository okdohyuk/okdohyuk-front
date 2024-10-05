import React from 'react';
import metadata, { GenerateMetadata } from '@libs/server/customMetadata';

export const generateMetadata: GenerateMetadata = ({ params }) => metadata({ params, ns: 'coder' });

export default function CoderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
