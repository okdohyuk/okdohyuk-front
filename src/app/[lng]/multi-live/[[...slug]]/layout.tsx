import React from 'react';
import { LanguageParams } from '~/app/[lng]/layout';

type LayoutProps = { children: React.ReactNode; popup: React.ReactNode };

export type SlugParams = { params: { slug?: string[] } };

export type MultiLiveProps = LanguageParams & SlugParams;

export default function MultiLiveLayout({ children, popup }: LayoutProps) {
  return (
    <>
      {children}
      {popup}
    </>
  );
}
