import React from 'react';
import { getUser } from '@libs/server/dal';
import { notFound } from 'next/navigation';
import { UserRoleEnum } from '@api/User';

export default async function BlogsLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user || (user && user.role !== UserRoleEnum.Admin)) {
    notFound();
  }

  return children;
}
