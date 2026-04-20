import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import acceptLanguage from 'accept-language';
import { AxiosError } from 'axios';
import { authApi } from '@api';
import {
  appendAgentDiscoveryHeaders,
  buildRouteMarkdown,
  estimateMarkdownTokens,
  isDiscoveryBypassPath,
  isMarkdownRequest,
} from '@libs/shared/agentDiscovery';
import Jwt from '~/utils/jwtUtils';
import { cookieName, fallbackLng, languages, type Language } from '~/app/i18n/settings';
import logger from '@utils/logger';

acceptLanguage.languages([...languages]);

const ONE_HOUR_IN_MS = 3600000;
const isProduction = process.env.NODE_ENV === 'production';

function resolvePreferredLanguage(req: NextRequest): Language {
  let lng;
  if (req.cookies.has(cookieName)) lng = acceptLanguage.get(req.cookies.get(cookieName)!.value);
  if (!lng) lng = acceptLanguage.get(req.headers.get('Accept-Language'));
  if (!lng) lng = fallbackLng;

  return lng as Language;
}

function normalizePathname(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

function isHomepagePath(pathname: string) {
  const normalizedPathname = normalizePathname(pathname);

  return (
    normalizedPathname === '/' ||
    languages.some((language) => normalizedPathname === `/${language}`)
  );
}

function attachHomepageHeadersIfNeeded(pathname: string, response: NextResponse) {
  if (isHomepagePath(pathname)) {
    appendAgentDiscoveryHeaders(response.headers);
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const [, pathnameLocale] = pathname.split('/');

  if (isDiscoveryBypassPath(pathname)) {
    return NextResponse.next();
  }

  const lng = resolvePreferredLanguage(req);

  if (isMarkdownRequest(req.headers.get('accept'))) {
    const requestedLanguage = languages.find(
      (language) => pathname === `/${language}` || pathname.startsWith(`/${language}/`),
    );
    const markdownLanguage = requestedLanguage ?? lng;
    let localizedPath = pathname;
    if (!requestedLanguage) {
      localizedPath = pathname === '/' ? `/${markdownLanguage}` : `/${markdownLanguage}${pathname}`;
    }
    const markdown = buildRouteMarkdown(markdownLanguage, localizedPath);
    const response = new NextResponse(markdown, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'x-markdown-tokens': estimateMarkdownTokens(markdown).toString(),
      },
    });

    appendAgentDiscoveryHeaders(response.headers);
    return response;
  }

  const response = NextResponse.next();

  if (!languages.some((loc) => pathnameLocale === loc && !pathname.startsWith('/_next'))) {
    const redirectResponse = NextResponse.redirect(
      new URL(`/${lng}${pathname === '/' ? '' : pathname}${req.nextUrl.search}`, req.url),
    );
    attachHomepageHeadersIfNeeded(pathname, redirectResponse);
    return redirectResponse;
  }

  if (req.headers.has('referer')) {
    const refererUrl = new URL(req.headers.get('referer')!);
    const lngInReferer = languages.find((language) =>
      refererUrl.pathname.startsWith(`/${language}`),
    );
    if (lngInReferer) response.cookies.set(cookieName, lngInReferer);
  }

  if (!req.cookies.has('SessionId')) {
    response.cookies.set('SessionId', crypto.randomUUID());
  }

  const accessToken = req.cookies.get('access_token')?.value;
  const refreshToken = req.cookies.get('refresh_token')?.value;
  const userInfoRaw = req.cookies.get('user_info')?.value;
  let userId: string | undefined;
  if (userInfoRaw) {
    try {
      const userInfo = JSON.parse(userInfoRaw);
      userId = userInfo?.id;
    } catch (e) {
      logger.error('Middleware: Failed to parse user_info cookie', e);
      response.cookies.delete('user_info');
    }
  }

  if (!refreshToken || !userId) {
    if (
      req.cookies.has('access_token') ||
      req.cookies.has('refresh_token') ||
      req.cookies.has('user_info')
    ) {
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
      response.cookies.delete('user_info');
    }
  }

  let needsRefresh = !accessToken;
  if (accessToken) {
    try {
      const payload = Jwt.getPayload(accessToken);
      if (payload && payload.exp) {
        const expiresIn = payload.exp * 1000 - Date.now();
        if (expiresIn < ONE_HOUR_IN_MS) {
          needsRefresh = true;
        }
      }
    } catch (e) {
      logger.error('Middleware: Failed to parse access token for expiry check', e);
      needsRefresh = true;
    }
  }

  if (needsRefresh && refreshToken && userId) {
    try {
      const refreshResponse = await authApi.putAuthTokenUserId(`Bearer ${refreshToken}`, userId);
      const newAccessToken = refreshResponse.data.access_token;
      const newRefreshTokenValue = refreshResponse.data.refresh_token;

      if (newAccessToken) {
        let accessTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000);
        try {
          const payload = Jwt.getPayload(newAccessToken);
          if (payload.exp) accessTokenExp = new Date(payload.exp * 1000);
        } catch (e) {
          logger.error('Middleware: Failed to parse new access token for expiry', e);
        }

        response.cookies.set({
          name: 'access_token',
          value: newAccessToken,
          path: '/',
          sameSite: 'strict',
          secure: isProduction,
          expires: accessTokenExp,
        });

        if (newRefreshTokenValue) {
          let refreshTokenExp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          try {
            const payload = Jwt.getPayload(newRefreshTokenValue);
            if (payload.exp) refreshTokenExp = new Date(payload.exp * 1000);
          } catch (e) {
            logger.error('Middleware: Failed to parse new refresh token for expiry', e);
          }

          response.cookies.set({
            name: 'refresh_token',
            value: newRefreshTokenValue,
            path: '/',
            sameSite: 'strict',
            secure: isProduction,
            expires: refreshTokenExp,
          });
        }
      }
    } catch (errUnknown) {
      logger.error('Middleware: Token refresh failed:', errUnknown);
      if (errUnknown instanceof AxiosError && errUnknown.response?.status === 401) {
        response.cookies.delete('access_token');
        response.cookies.delete('refresh_token');
        response.cookies.delete('user_info');
      }
    }
  }

  attachHomepageHeadersIfNeeded(pathname, response);
  return response;
}

export const config = {
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico|sw.js|site.webmanifest|icons/|splashscreens/|.*\\.[a-zA-Z0-9]).*)',
  ],
};
