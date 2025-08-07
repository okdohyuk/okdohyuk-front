import React from 'react';
import { translationsMetadata, GenerateMetadata } from '@libs/server/customMetadata';

export const generateMetadata: GenerateMetadata = async ({ params }) =>
  translationsMetadata({ params, ns: 'choseong-maker' });

export default function ChoseongMakerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
