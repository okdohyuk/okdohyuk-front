import { getUser } from '@libs/server/dal';
import { notFound } from 'next/navigation';
import { UserRoleEnum } from '@api/User';
import { ChildrenProps } from '~/app/[lng]/layout';

export default async function AdminLayout({ children }: ChildrenProps) {
  const user = await getUser();
  if (!user || (user && user.role !== UserRoleEnum.Admin)) {
    notFound();
  }

  return children;
}
