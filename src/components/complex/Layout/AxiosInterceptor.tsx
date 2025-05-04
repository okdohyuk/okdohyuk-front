'use client';

import React, { useEffect } from 'react';
import axios from 'axios';
import { useRouter, usePathname } from 'next/navigation';
import { authApi } from '@api';
import Cookies from 'js-cookie';
import { observer } from 'mobx-react';
import useStore from '@hooks/useStore';

// 중복 요청 취소용 Map 선언
const pendingRequests = new Map<string, () => void>();

function getRequestKey(config: any) {
  return JSON.stringify({
    url: config.url,
    method: config.method,
    data: config.data,
    params: config.params,
  });
}

function AxiosInterceptor() {
  const { push } = useRouter();
  const pathname = usePathname();
  const { user, logOut } = useStore('userStore');

  useEffect(() => {
    const refreshAPI = axios.create({
      headers: { 'Content-type': 'application/json' },
    });

    const logoutAndLogin = () => {
      logOut();
      if (pathname) Cookies.set('redirect_uri', pathname);
      push('/auth/login');
    };

    const refresh = async (originalConfig: any) => {
      const reflashToken = localStorage.getItem('refresh_token');
      try {
        if (user === null) throw new Error('user is null');
        const { data } = await authApi.putAuthTokenUserId('Bearer ' + reflashToken, user.id);
        localStorage.setItem('refresh_token', data.refresh_token);
        Cookies.set('access_token', data.access_token);

        originalConfig.headers['Authorization'] = 'Bearer ' + data.access_token;
        return refreshAPI(originalConfig);
      } catch (err) {
        logoutAndLogin();
      }
    };

    // 요청 인터셉터: 중복 요청 취소
    const requestInterceptor = axios.interceptors.request.use((config) => {
      const key = getRequestKey(config);
      if (pendingRequests.has(key)) {
        // 이전 요청 취소
        const cancel = pendingRequests.get(key);
        if (cancel) cancel();
        pendingRequests.delete(key);
      }
      config.cancelToken = new axios.CancelToken((cancel) => {
        pendingRequests.set(key, cancel);
      });
      return config;
    });

    const interceptor = axios.interceptors.response.use(
      function (response) {
        // 응답이 오면 해당 요청 삭제
        const key = getRequestKey(response.config);
        pendingRequests.delete(key);
        return response;
      },
      async function (error) {
        // 에러 발생 시에도 해당 요청 삭제
        if (error.config) {
          const key = getRequestKey(error.config);
          pendingRequests.delete(key);
        }
        const originalConfig = error.config;
        const {
          status,
          data: { code, errorMessage },
        } = error.response;

        switch (status) {
          case 401: {
            if (code == 6) return await refresh(originalConfig);
            logoutAndLogin();
            break;
          }
          /** TODO custom alert */
          default:
            window.alert(errorMessage);
        }

        return Promise.reject(error);
      },
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, []);
  return <></>;
}

export default observer(AxiosInterceptor);
