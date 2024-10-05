import React from 'react';
import metadata, { GenerateMetadata } from '@libs/server/customMetadata';

export const generateMetadata: GenerateMetadata = ({ params }) => metadata({ params, ns: 'todo' });

export default function TodoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
