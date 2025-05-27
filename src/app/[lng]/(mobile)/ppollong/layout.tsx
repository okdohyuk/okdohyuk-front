import React from 'react';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { ChildrenProps } from '~/app/[lng]/layout';

export const generateMetadata: GenerateMetadata = ({ params }) =>
  translationsMetadata({ params, ns: 'ppollong' });

export default function PpollongLayout({ children }: ChildrenProps) {
  return <>{children}</>;
}
