import React from 'react';
import Image from 'next/legacy/image';
import { observer } from 'mobx-react';
import useStore from '@hooks/useStore';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

function UserInfoCard() {
  const { t } = useTranslation('menu');
  const { user, logOut, logOutAll } = useStore('userStore');
  const { push, asPath } = useRouter();

  const handleLogin = () => {
    Cookies.set('redirect_uri', asPath);
    push('/auth/login');
  };

  return (
    <section className="mb-4 bg-basic-3 rounded-md p-2 flex items-center">
      {user ? (
        <>
          <Image src={user.profileImage} width={32} height={32} alt="profile" />
          <div className="ml-4 t-d-1 t-basic-1">{user.name}</div>
          <button className="ml-auto t-c-1 t-basic-1" onClick={logOut}>
            {t('login.logout')}
          </button>
          <button className="ml-4 t-c-1 t-basic-1" onClick={logOutAll}>
            {t('login.logoutAll')}
          </button>
        </>
      ) : (
        <button onClick={handleLogin}>
          <div className="t-t-3 text-point-1">{t('login.description')}</div>
        </button>
      )}
    </section>
  );
}

export default observer(UserInfoCard);
