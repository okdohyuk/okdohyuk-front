import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import acceptLanguage from 'accept-language';
import { userApi } from '@api';
import Jwt from '@utils/jwtUtils';
import { UserRoleEnum } from '@api/User';
import UserTokenUtil from './utils/userTokenUtil';
import { cookieName, fallbackLng, languages } from '~/app/i18n/settings';

acceptLanguage.languages([...languages]);

export function middleware(req: NextRequest) {
  const accessToken = req.cookies.get('access_token');

  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!accessToken) return NextResponse.redirect(new URL('/auth/login', req.url));
    const tokenPayload = Jwt.getPayload(accessToken.value);
    if (tokenPayload && !tokenPayload.id) return NextResponse.rewrite(new URL('/404', req.url));

    userApi
      .getUserUserId(UserTokenUtil.getTokenBearer(accessToken.value), tokenPayload.id)
      .then(({ data: user }) => {
        if (user.role === UserRoleEnum.Admin) return NextResponse.next();
        throw new Error('Not admin');
      })
      .catch(() => {
        return NextResponse.rewrite(new URL('/404', req.url));
      });
  }

  // Get lng from cookie or Accept-Language header
  let lng;
  if (req.cookies.has(cookieName)) lng = acceptLanguage.get(req.cookies.get(cookieName)!.value);
  if (!lng) lng = acceptLanguage.get(req.headers.get('Accept-Language'));
  if (!lng) lng = fallbackLng;

  // /... -> /[lng]/... if lng is not in the path
  if (
    !languages.some(
      (loc) =>
        req.nextUrl.pathname.split('/')[1] === loc && !req.nextUrl.pathname.startsWith('/_next'),
    )
  ) {
    return NextResponse.redirect(new URL(`/${lng}/${req.nextUrl.pathname}`, req.url));
  }

  if (req.headers.has('referer')) {
    const refererUrl = new URL(req.headers.get('referer')!);
    const lngInReferer = languages.find((l) => refererUrl.pathname.startsWith(`/${l}`));
    const response = NextResponse.next();
    if (lngInReferer) response.cookies.set(cookieName, lngInReferer);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico|sw.js|site.webmanifest|icons/|splashscreens/|auth/|admin/|blog|.*\\.[a-zA-Z0-9]).*)',
  ],
};
