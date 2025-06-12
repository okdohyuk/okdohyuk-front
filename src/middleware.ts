import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import acceptLanguage from 'accept-language';
import { AxiosError } from 'axios';
import { authApi } from '@api'; // API 클라이언트
import Jwt from '~/utils/jwtUtils';
import { cookieName, fallbackLng, languages } from '~/app/i18n/settings';

acceptLanguage.languages([...languages]);

const ONE_HOUR_IN_MS = 3600000;
const isProduction = process.env.NODE_ENV === 'production';

export async function middleware(req: NextRequest) {
  const response = NextResponse.next(); // 기본 응답 객체

  // 1. i18n 처리
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
  }

  // 2. 세션 ID 생성
  if (!req.cookies.has('session_id')) {
    response.cookies.set('session_id', Math.random().toString(36).slice(2));
  }

  // 3. 토큰 리프레시 로직
  const accessToken = req.cookies.get('access_token')?.value;
  const refreshToken = req.cookies.get('refresh_token')?.value;
  const userInfoRaw = req.cookies.get('user_info')?.value;
  let userId: string | undefined;
  if (userInfoRaw) {
    try {
      const userInfo = JSON.parse(userInfoRaw);
      userId = userInfo?.id;
    } catch (e) {
      console.error('Middleware: Failed to parse user_info cookie', e);
      // user_info 파싱 실패 시 쿠키 삭제 고려
      response.cookies.delete('user_info');
    }
  }

  // 사용자 요청: 리프레시 토큰이 없거나, 사용자 ID가 없는 경우 로그아웃 처리.
  // 이는 액세스 토큰만 있고 필수 정보(리프레시 토큰 또는 사용자 ID)가 없는 경우를 포함합니다.
  // 이 조건은 토큰 리프레시 시도 전에 확인되어야 합니다.
  if (!refreshToken || !userId) {
    // 현재 요청에 인증 관련 쿠키가 하나라도 설정되어 있었다면, 클리어를 진행합니다.
    // 이는 불필요한 쿠키 삭제 연산을 방지하고, 실제로 로그아웃이 필요한 상황인지 명확히 합니다.
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
      console.error('Middleware: Failed to parse access token for expiry check', e);
      needsRefresh = true; // 파싱 실패 시 안전하게 리프레시 시도
    }
  }

  if (needsRefresh && refreshToken && userId) {
    try {
      const refreshResponse = await authApi.putAuthTokenUserId(`Bearer ${refreshToken}`, userId);
      const newAccessToken = refreshResponse.data.access_token;
      const newRefreshTokenValue = refreshResponse.data.refresh_token;

      if (newAccessToken) {
        let accessTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000); // 기본 1일
        try {
          const payload = Jwt.getPayload(newAccessToken);
          if (payload.exp) accessTokenExp = new Date(payload.exp * 1000);
        } catch (e) {
          console.error('Middleware: Failed to parse new access token for expiry', e);
        }

        response.cookies.set({
          name: 'access_token',
          value: newAccessToken,
          path: '/',
          sameSite: 'strict',
          secure: isProduction,
          expires: accessTokenExp,
          // httpOnly: true,
        });

        if (newRefreshTokenValue) {
          let refreshTokenExp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 기본 7일
          try {
            const payload = Jwt.getPayload(newRefreshTokenValue);
            if (payload.exp) refreshTokenExp = new Date(payload.exp * 1000);
          } catch (e) {
            console.error('Middleware: Failed to parse new refresh token for expiry', e);
          }

          response.cookies.set({
            name: 'refresh_token',
            value: newRefreshTokenValue,
            path: '/',
            sameSite: 'strict',
            secure: isProduction,
            expires: refreshTokenExp,
            // httpOnly: true,
          });
        }
      }
    } catch (errUnknown) {
      console.error('Middleware: Token refresh failed:', errUnknown);
      if (errUnknown instanceof AxiosError && errUnknown.response?.status === 401) {
        // 리프레시 실패 (401) 시 쿠키 삭제
        response.cookies.delete('access_token');
        response.cookies.delete('refresh_token');
        response.cookies.delete('user_info');
      }
    }
  }

  return response; // 최종 응답 반환
}

export const config = {
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico|sw.js|site.webmanifest|icons/|splashscreens/|.*\\.[a-zA-Z0-9]).*)',
  ],
};
