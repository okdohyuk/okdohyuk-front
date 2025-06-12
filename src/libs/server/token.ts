import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';
import Jwt from '@utils/jwtUtils';
import { redirect } from 'next/navigation';
import UserTokenUtil from '@utils/userTokenUtil';
import { authApi } from '@api';
import { AxiosError } from 'axios';

export const getTokenServer = cache(async () => {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get('access_token')?.value;
  const refreshToken = cookieStore.get('refresh_token')?.value;
  const userInfoRaw = cookieStore.get('user_info')?.value;
  let userIdFromCookie: string | undefined;

  if (userInfoRaw) {
    try {
      const userInfo = JSON.parse(userInfoRaw);
      userIdFromCookie = userInfo?.id;
    } catch (e) {
      console.error('getTokenServer: Failed to parse user_info cookie', e);
    }
  }

  // 1. 기존 액세스 토큰 유효성 검사
  if (accessToken) {
    try {
      const payload = Jwt.getPayload(accessToken);
      if (payload && payload.id) {
        // 액세스 토큰이 유효하고 사용자 ID 포함
        return { accessToken: UserTokenUtil.getTokenBearer(accessToken), userId: payload.id };
      }
      // 액세스 토큰은 있지만 payload가 유효하지 않음 (예: 만료, 형식 오류)
      // 리프레시 로직으로 진행하기 위해 accessToken을 undefined로 설정
      console.warn('getTokenServer: Existing access token is invalid, attempting refresh.');
      accessToken = undefined;
    } catch (e) {
      console.error(
        'getTokenServer: Failed to parse existing access token, attempting refresh.',
        e,
      );
      accessToken = undefined; // 파싱 오류 시에도 리프레시 시도
    }
  }

  // 2. 액세스 토큰이 없거나 유효하지 않은 경우, 리프레시 시도
  if (refreshToken && userIdFromCookie) {
    try {
      const refreshResponse = await authApi.putAuthTokenUserId(
        `Bearer ${refreshToken}`,
        userIdFromCookie,
      );
      const newAccessToken = refreshResponse.data.access_token;

      if (newAccessToken) {
        // 중요: 여기서 쿠키를 설정하지 않습니다. 쿠키 관리는 미들웨어에서 담당합니다.
        return {
          accessToken: UserTokenUtil.getTokenBearer(newAccessToken),
          userId: userIdFromCookie,
        };
      } else {
        console.error(
          `verifySession: Refresh successful but no new access token received for user ${userIdFromCookie}`,
        );
      }
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 401) {
        console.warn(
          `verifySession: Refresh token expired or invalid for user ${userIdFromCookie}. Redirecting to login.`,
        );
      } else {
        console.error(`verifySession: Token refresh failed for user ${userIdFromCookie}:`, err);
      }
      // 리프레시 중 어떤 오류든 발생하면 로그인 페이지로 리디렉션
    }
  }

  // 3. 모든 시도 실패 시 (유효한 초기 토큰 없음, 리프레시 토큰/사용자 ID 없음, 또는 리프레시 실패)
  redirect('/auth/login');
});
