import axios, { AxiosError, AxiosHeaders, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as Sentry from '@sentry/nextjs';
import UserTokenUtil from '@utils/userTokenUtil';
import { rememberLoginRedirect } from '@utils/loginRedirect';
import { ApiKeyApi } from './ApiKey';
import { AuthApi } from './Auth';
import { BlogApi } from './Blog';
import { BlogReplyApi } from './BlogReply';
import { CopykillerApi } from './Copykiller';
import { GuestbookApi } from './Guestbook';
import { PokemonApi } from './Pokemon';
import { PokemonTeamApi } from './PokemonTeam';
import { SessionApi } from './Session';
import { ShortUrlApi } from './ShortUrl';
import { SolveApi } from './Solve';
import { StorageApi } from './Storage';
import { SurveyApi } from './Survey';
import { UserApi } from './User';

// 환경 변수에서 API URL을 가져옵니다.
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 커스텀 axios 인스턴스를 생성합니다.
export const apiInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터에서 UserTokenUtil을 통해 토큰을 읽어 Authorization 헤더에 자동 첨부합니다.
// 비동기 방식으로 토큰을 받아오기 위해 인터셉터를 async 함수로 변경합니다.
apiInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const accessToken = await UserTokenUtil.getAccessToken();
    if (accessToken) {
      const headers = AxiosHeaders.from(config.headers ?? {});
      headers.set('Authorization', accessToken);

      const updatedConfig: InternalAxiosRequestConfig = {
        ...config,
        headers,
      };

      return updatedConfig;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

/*
 * 백엔드 BaseException.code (= enums/ErrorMessage 의 code) 중 "사용자 토큰" 문제로 401 이 난 경우.
 * - 3 ACCESS_TOKEN_INVALID_EXCEPTION: 토큰 파싱/서명 실패 (401)
 * - 4 ACCESS_TOKEN_NULL_EXCEPTION:    Authorization 헤더 누락 (401)
 * - 6 TOKEN_EXPIRED_EXCEPTION:        access token 만료 (401)
 * 이 세 코드에 한해서만 refresh 재시도/로그아웃 같은 전역 처리를 수행한다.
 * 그 외 401(예: 47 API_KEY_INVALID_EXCEPTION)은 호출 측이 처리하도록 그대로 reject 한다.
 */
const TOKEN_ERROR_CODES = [3, 4, 6] as const;
const isTokenErrorCode = (code: number | undefined): boolean =>
  code !== undefined && (TOKEN_ERROR_CODES as readonly number[]).includes(code);

/*
 * Sentry 캡처 정책(allowlist).
 * 4xx 는 클라이언트/사용자 책임이라 노이즈이므로 제외하고, 서버 오류(5xx)만 캡처한다.
 * denylist(400/401/403/404/409) 방식은 422/429 등이 추가될 때마다 새므로 allowlist 로 둔다.
 * 응답이 없는 오류(오프라인/타임아웃)는 캡처하되, 요청 취소(ERR_CANCELED)는 정상 흐름이라 제외한다.
 */
const shouldCaptureToSentry = (error: AxiosError): boolean => {
  if (axios.isCancel(error) || error.code === 'ERR_CANCELED') return false;
  const status = error.response?.status;
  return status === undefined || status >= 500;
};

/*
 * 리프레시 endpoint(PUT /auth/token/{userId}) 자신이 401 을 받는 경우는
 * 절대 재시도/큐 대상이 아니다. 큐에 넣으면 processQueue 를 호출할 주체(=이 요청)가
 * 영영 끝나지 않아 자기 참조 데드락에 빠진다(스피너 무한 + 강제 로그아웃 미실행).
 * 백엔드 AuthServiceImpl.refresh 는 refresh token 무효 시 code 3 / 401 을 던지므로 실제로 발생한다.
 */
const isTokenRefreshRequest = (config: InternalAxiosRequestConfig): boolean =>
  config.method?.toLowerCase() === 'put' && /\/auth\/token\//.test(config.url ?? '');

let isRefreshing = false; // 현재 토큰 리프레시 중인지 여부
// 리프레시 중에 대기 중인 요청 큐 타입 정의.
// resolve 는 항상 새 access token(raw)만 전달한다(실패 시엔 reject 이므로 null 경로 없음).
interface FailedQueueItem {
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
}
let failedQueue: FailedQueueItem[] = [];

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  retryAttempted?: boolean;
};

// 큐에 쌓인 요청들을 처리하는 함수
const processQueue = (error: unknown, token?: string) => {
  failedQueue.forEach((prom) => {
    if (error || !token) {
      prom.reject(error ?? new Error('토큰 리프레시 실패'));
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/*
 * 강제 로그아웃. 세션을 회복할 수 없다고 판단했을 때만 호출한다.
 * 사용자를 로그인 페이지로 튕기는 사건은 운영상 반드시 보여야 하므로 Sentry 에 명시적으로 남긴다
 * (4xx 를 캡처하지 않게 되면서 이 사건이 조용히 묻히는 것을 방지).
 */
const logoutAndLogin = (reason: string) => {
  Sentry.captureMessage(`forced logout: ${reason}`, 'warning');
  if (typeof window !== 'undefined') {
    rememberLoginRedirect(window.location.pathname);
    window.location.href = '/auth/login';
  }
};

// 각 API 인스턴스를 export합니다.
export const apiKeyApi = new ApiKeyApi(undefined, API_URL, apiInstance);
export const authApi = new AuthApi(undefined, API_URL, apiInstance);
export const blogApi = new BlogApi(undefined, API_URL, apiInstance);
export const blogReplyApi = new BlogReplyApi(undefined, API_URL, apiInstance);
export const copykillerApi = new CopykillerApi(undefined, API_URL, apiInstance);
export const guestbookApi = new GuestbookApi(undefined, API_URL, apiInstance);
export const pokemonApi = new PokemonApi(undefined, API_URL, apiInstance);
export const pokemonTeamApi = new PokemonTeamApi(undefined, API_URL, apiInstance);
export const sessionApi = new SessionApi(undefined, API_URL, apiInstance);
export const shortUrlApi = new ShortUrlApi(undefined, API_URL, apiInstance);
export const solveApi = new SolveApi(undefined, API_URL, apiInstance);
export const storageApi = new StorageApi(undefined, API_URL, apiInstance);
export const surveyApi = new SurveyApi(undefined, API_URL, apiInstance);
export const userApi = new UserApi(undefined, API_URL, apiInstance);

// access token을 refresh하는 함수
const refreshAccessToken = async (): Promise<string> => {
  isRefreshing = true;
  const user = await UserTokenUtil.getUserInfo();
  const refreshTokenValue = await UserTokenUtil.getRefreshToken();
  try {
    if (!user || !refreshTokenValue) {
      throw new Error('User 또는 refresh token 없음');
    }
    // 실제 리프레시 API 호출
    const response = await authApi.putAuthTokenUserId(
      UserTokenUtil.getTokenBearer(refreshTokenValue),
      user.id,
    );
    const newAccessToken = response.data.access_token;
    const newRefreshToken = response.data.refresh_token;
    await UserTokenUtil.setAccessToken(newAccessToken);
    if (newRefreshToken) {
      await UserTokenUtil.setRefreshToken(newRefreshToken);
    }
    processQueue(null, newAccessToken);
    return newAccessToken;
  } catch (err) {
    processQueue(err);
    logoutAndLogin('token refresh failed');
    throw err;
  } finally {
    isRefreshing = false;
  }
};

// response 인터셉터 등록
apiInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (shouldCaptureToSentry(error)) {
      Sentry.captureException(error);
    }
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    if (!originalRequest) {
      return Promise.reject(error);
    }
    // 401 에러면서 재시도 플래그 없을 때만 동작
    if (error.response && error.response.status === 401 && !originalRequest.retryAttempted) {
      // 리프레시 요청 자신의 401 은 refreshAccessToken 의 catch 가 처리한다(로그아웃).
      // 여기서 큐/재시도에 태우면 데드락이므로 즉시 넘긴다.
      if (isTokenRefreshRequest(originalRequest)) {
        return Promise.reject(error);
      }

      // 백엔드 BaseException 의 필드명은 `code` 다(errorCode 아님).
      const responseData = error.response.data as { code?: number } | undefined;
      const { code } = responseData ?? {};

      // 토큰과 무관한 401(예: code 47 API_KEY_INVALID)은 호출 측이 처리한다.
      if (!isTokenErrorCode(code)) {
        return Promise.reject(error);
      }

      if (!UserTokenUtil.getRefreshToken()) {
        // 토큰 오류 401 인데 갱신 수단이 없다 = 복구 불가.
        // access token 을 들고 있었다면(=로그인 상태로 보였다면) 세션을 정리해 어긋난 상태를 끊는다.
        // 반대로 토큰이 아예 없는 비로그인 사용자의 401(비로그인 댓글 작성 시도 등)은
        // 전역 부작용 없이 호출 측으로 넘겨 화면에서 안내하게 둔다.
        if (UserTokenUtil.getAccessToken()) {
          logoutAndLogin('token error without refresh token');
        }
        return Promise.reject(error);
      }

      // 재시도는 1회만. 큐 대기 경로에서도 플래그를 세우지 않으면
      // 재시도가 또 401 일 때 새 리프레시 사이클이 무한히 시작될 수 있다.
      originalRequest.retryAttempted = true;

      if (isRefreshing) {
        // 리프레시 중이면 큐에 추가
        try {
          const token = await new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          // 요청 인터셉터가 쿠키 값으로 Authorization 을 다시 덮어쓰므로 사실상 방어적 코드다.
          // (쿠키 반영이 늦는 경우를 대비해 새 토큰을 명시적으로 실어 보낸다)
          const headers = AxiosHeaders.from(originalRequest.headers ?? {});
          headers.set('Authorization', UserTokenUtil.getTokenBearer(token));
          originalRequest.headers = headers;
          return await apiInstance(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      try {
        const newAccessToken = await refreshAccessToken();
        // 위와 동일 — 요청 인터셉터가 덮어쓰지만 방어적으로 새 토큰을 실어 보낸다.
        const headers = AxiosHeaders.from(originalRequest.headers ?? {});
        headers.set('Authorization', UserTokenUtil.getTokenBearer(newAccessToken));
        originalRequest.headers = headers;
        return await apiInstance(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  },
);
