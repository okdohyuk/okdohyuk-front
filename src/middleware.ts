import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import acceptLanguage from 'accept-language';
import { cookieName, fallbackLng, languages } from '~/app/i18n/settings';

acceptLanguage.languages([...languages]);

export function middleware(req: NextRequest) {
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
    return NextResponse.redirect(
      new URL(`/${lng}/${req.nextUrl.pathname}${req.nextUrl.search}`, req.url),
    );
  }

  if (req.headers.has('referer')) {
    const refererUrl = new URL(req.headers.get('referer')!);
    const lngInReferer = languages.find((l) => refererUrl.pathname.startsWith(`/${l}`));
    const response = NextResponse.next();
    if (lngInReferer) response.cookies.set(cookieName, lngInReferer);
    return response;
  }

  // session id가 없으면 생성
  if (!req.cookies.has('session_id')) {
    const res = NextResponse.next();
    res.cookies.set('session_id', Math.random().toString(36).slice(2));
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico|sw.js|site.webmanifest|icons/|splashscreens/|.*\\.[a-zA-Z0-9]).*)',
  ],
};
