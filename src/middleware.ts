import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { userApi } from '@api';
import Jwt from '@utils/jwtUtils';
import { UserRoleEnum } from '@api/User';
import UserTokenUtil from './utils/userTokenUtil';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access_token');

  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!accessToken) return NextResponse.redirect(new URL('/auth/login', request.url));
    const tokenPayload = Jwt.getPayload(accessToken.value);
    if (tokenPayload && !tokenPayload.id) return NextResponse.rewrite(new URL('/404', request.url));

    userApi
      .getUserUserId(UserTokenUtil.getTokenBearer(accessToken.value), tokenPayload.id)
      .then(({ data: user }) => {
        if (user.role === UserRoleEnum.Admin) return NextResponse.next();
        throw new Error('Not admin');
      })
      .catch(() => {
        return NextResponse.rewrite(new URL('/404', request.url));
      });
  }
}

export const config = {
  matcher: ['/admin', '/admin/((?!general).*)'],
};
