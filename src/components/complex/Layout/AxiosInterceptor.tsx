import React, { useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { authApi } from '@api';
import Cookies from 'js-cookie';
import { observer } from 'mobx-react';
import useStore from '@hooks/useStore';

function AxiosInterceptor() {
  const { push, asPath } = useRouter();
  const { user, logOut } = useStore('userStore');

  useEffect(() => {
    const refreshAPI = axios.create({
      headers: { 'Content-type': 'application/json' },
    });

    const logoutAndLogin = () => {
      logOut();
      Cookies.set('redirect_uri', asPath);
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

    const interceptor = axios.interceptors.response.use(
      function (response) {
        return response;
      },
      async function (error) {
        const originalConfig = error.config;
        const {
          status,
          data: { code, errorMessage },
        } = error.response;

        switch (status) {
          case 401:
            return code == 6 ? await refresh(originalConfig) : logoutAndLogin();
          /** TODO custom alert */
          default:
            window.alert(errorMessage);
        }

        return Promise.reject(error);
      },
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);
  return <></>;
}

export default observer(AxiosInterceptor);
