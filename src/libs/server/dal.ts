import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';
import Jwt from '@utils/jwtUtils';
import { redirect } from 'next/navigation';
import { userApi } from '@api';
import UserTokenUtil from '@utils/userTokenUtil';

export const verifySession = cache(async () => {
  const accessToken = cookies().get('access_token')?.value;
  if (!accessToken) {
    redirect('/auth/login');
    return null;
  }

  const { id } = Jwt.getPayload(accessToken) || {};
  if (!id) {
    redirect('/auth/login');
    return null;
  }

  return { isAuth: true, accessToken: UserTokenUtil.getTokenBearer(accessToken), userId: id };
});

export const getUser = cache(async () => {
  const session = await verifySession();
  if (!session) return null;
  const { userId, accessToken } = session;

  try {
    const { data: user } = await userApi.getUserUserId(accessToken, userId);

    return user;
  } catch (error) {
    console.error('Failed to fetch user');
    return null;
  }
});
