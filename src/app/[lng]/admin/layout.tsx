// import { getUser } from '@libs/server/dal';
import { notFound } from 'next/navigation';
import { UserRoleEnum } from '@api/User';
import { ChildrenProps } from '~/app/[lng]/layout';
import { authenticateAdminAction } from './action';

export default async function AdminLayout({ children }: ChildrenProps) {
  const user = await authenticateAdminAction();
  if (!user.ok || (user.ok && user.user?.role !== UserRoleEnum.Admin)) {
    notFound();
  }

  return children;
}
