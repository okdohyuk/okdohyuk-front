import { getUser } from '@libs/server/dal';
import { UserRoleEnum } from '@api/User';

export async function GET() {
  const user = await getUser();

  if (!user) return new Response(null, { status: 401 });

  if (user.role !== UserRoleEnum.Admin) return new Response(null, { status: 403 });

  return new Response(null, { status: 200 });
}
