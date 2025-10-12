import Cookies from 'js-cookie';
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import UserTokenUtil from '@utils/userTokenUtil';
import { AuthApi } from './Auth';
import { BlogApi } from './Blog';
import { StorageApi } from './Storage';
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
    if (accessToken && config.headers) {
      const updatedConfig: InternalAxiosRequestConfig = {
        ...config,
        headers: {
          ...config.headers,
          Authorization: accessToken,
        },
      };
      return updatedConfig;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

let isRefreshing = false; // 현재 토큰 리프레시 중인지 여부
// 리프레시 중에 대기 중인 요청 큐 타입 정의
interface FailedQueueItem {
  resolve: (value: string | null) => void;
  reject: (reason?: unknown) => void;
}
let failedQueue: FailedQueueItem[] = [];

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  retryAttempted?: boolean;
};

// 큐에 쌓인 요청들을 처리하는 함수
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 로그아웃 및 로그인 페이지로 이동
const logoutAndLogin = () => {
  if (typeof window !== 'undefined') {
    Cookies.set('redirect_uri', window.location.pathname);
    window.location.href = '/auth/login';
  }
};

// 각 API 인스턴스를 export합니다.
export const authApi = new AuthApi(undefined, API_URL, apiInstance);
export const blogApi = new BlogApi(undefined, API_URL, apiInstance);
export const storageApi = new StorageApi(undefined, API_URL, apiInstance);
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
    const response = await authApi.putAuthTokenUserId(`Bearer ${refreshTokenValue}`, user.id);
    const newAccessToken = response.data.access_token;
    const newRefreshToken = response.data.refresh_token;
    await UserTokenUtil.setAccessToken(newAccessToken);
    if (newRefreshToken) {
      await UserTokenUtil.setRefreshToken(newRefreshToken);
    }
    processQueue(null, newAccessToken);
    return newAccessToken;
  } catch (err) {
    processQueue(err, null);
    logoutAndLogin();
    throw err;
  } finally {
    isRefreshing = false;
  }
};

// response 인터셉터 등록
apiInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    if (!originalRequest) {
      return Promise.reject(error);
    }
    // 401 에러면서 재시도 플래그 없을 때만 동작
    if (error.response && error.response.status === 401 && !originalRequest.retryAttempted) {
      // errorCode === 6인 경우만 리프레시 시도
      const errorCode = error.response.data && error.response.data.errorCode;
      // errorCode가 6이거나, 401이고 리프레시 토큰이 있으면 리프레시 시도
      if (errorCode === 6 || (error.response.status === 401 && UserTokenUtil.getRefreshToken())) {
        if (isRefreshing) {
          // 리프레시 중이면 큐에 추가
          try {
            const token = await new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            });
            originalRequest.headers.Authorization = token;
            return await apiInstance(originalRequest);
          } catch (err) {
            return Promise.reject(err);
          }
        }
        originalRequest.retryAttempted = true;
        try {
          const newAccessToken = await refreshAccessToken();
          originalRequest.headers.Authorization = newAccessToken;
          return await apiInstance(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      } else {
        // errorCode가 6이 아니면 바로 로그아웃 및 로그인 페이지 이동
        logoutAndLogin();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);
