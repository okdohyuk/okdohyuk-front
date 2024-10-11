'use client';

import React from 'react';
import Image from 'next/legacy/image';
import { observer } from 'mobx-react';
import useStore from '@hooks/useStore';
import Cookies from 'js-cookie';
import { usePathname, useRouter } from 'next/navigation';
import { Language } from '~/app/i18n/settings';
import { useTranslation } from '~/app/i18n/client';
import useIsClient from '@hooks/useIsClient';
import Skeleton from '@components/basic/Skeleton';

function UserInfoCard({ lng }: { lng: Language }) {
  const { t } = useTranslation(lng, 'menu');
  const { user, logOut, logOutAll } = useStore('userStore');
  const { push } = useRouter();
  const pathname = usePathname();
  const isClient = useIsClient();

  const handleLogin = () => {
    if (pathname) Cookies.set('redirect_uri', pathname);
    push('/auth/login');
  };

  if (!isClient) return <Skeleton className={'mb-4 rounded-md'} h={12} />;

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
