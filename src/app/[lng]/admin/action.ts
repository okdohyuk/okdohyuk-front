'use server';

import { cookies } from 'next/headers';
import { authApi, userApi } from '@api';
import { User } from '@api/User';
import { AxiosError } from 'axios';

// 모든 주석 한글

interface AuthResult {
  ok: boolean;
  user?: User | null;
  error?: string;
}

export async function authenticateAdminAction(): Promise<AuthResult> {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get('access_token')?.value;
  const refreshToken = cookieStore.get('refresh_token')?.value;
  const userInfoRaw = cookieStore.get('user_info')?.value;
  const userInfo = userInfoRaw ? JSON.parse(userInfoRaw) : null;
  const userId = userInfo?.id;

  if (!accessToken && refreshToken && userId) {
    try {
      const response = await authApi.putAuthTokenUserId(`Bearer ${refreshToken}`, userId);
      accessToken = response.data.access_token;
      // const newRefreshToken = response.data.refresh_token;

      // const isProduction = process.env.NODE_ENV === 'production';
      // cookieStore.set({
      //   name: 'access_token',
      //   value: accessToken,
      //   sameSite: 'strict',
      //   secure: isProduction,
      //   maxAge: 60 * 60 * 24,
      // });

      // if (newRefreshToken) {
      //   cookieStore.set({
      //     name: 'refresh_token',
      //     value: newRefreshToken,
      //     sameSite: 'strict',
      //     secure: isProduction,
      //     maxAge: 60 * 60 * 24 * 7,
      //   });
      // }
    } catch (errUnknown) {
      // 타입 any 대신 unknown 사용
      const errorMessage = '토큰 리프레시 실패';
      if (errUnknown instanceof AxiosError && errUnknown.response) {
        // Axios 에러인 경우 추가 정보 로깅 가능
      }
      return { ok: false, error: errorMessage };
    }
  }

  if (accessToken && userId) {
    try {
      const userResponse = await userApi.getUserUserId(`Bearer ${accessToken}`, userId);
      if (userResponse.data) {
        return { ok: true, user: userResponse.data };
      }
      return { ok: false, error: '사용자 정보 조회 실패 (데이터 없음)' };
    } catch (errUnknown) {
      // 타입 any 대신 unknown 사용
      // console.error('Server Action - 사용자 정보 조회 실패:', errUnknown); // console.error 주석 처리
      let errorMessage = '사용자 정보 조회 중 오류 발생';
      if (errUnknown instanceof AxiosError && errUnknown.response) {
        if (errUnknown.response.status === 401) {
          errorMessage = '인증 실패 (토큰 만료 또는 무효)';
        }
      }
      return { ok: false, error: errorMessage };
    }
  }

  return { ok: false, error: '인증 정보 부족 (토큰 또는 사용자 ID 없음)' };
}
