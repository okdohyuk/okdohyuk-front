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
import Link from '@components/basic/Link';
import Skeleton from '@components/basic/Skeleton';
import { Text } from '@components/basic/Text';

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

  if (!isClient) return <Skeleton className="mb-4 rounded-md" h={12} />;

  return (
    <section className="mb-4 flex items-center rounded-md bg-basic-3 p-2">
      {user ? (
        <>
          <Image src={user.profileImage} width={32} height={32} alt="profile" />
          <Text className="ml-4 t-basic-1" variant="d1">
            {user.name}
          </Text>
          <button type="button" className="ml-auto" onClick={logOut}>
            <Text variant="c1" className="t-basic-1">
              {t('login.logout')}
            </Text>
          </button>
          <button type="button" className="ml-4" onClick={logOutAll}>
            <Text variant="c1" className="t-basic-1">
              {t('login.logoutAll')}
            </Text>
          </button>
          {/* 어드민이면 /admin 이동 버튼 노출 */}
          {user.role === 'ADMIN' && (
            <Link href="/admin" className="ml-4 underline">
              <Text variant="c1" className="text-point-1">
                관리자 페이지
              </Text>
            </Link>
          )}
        </>
      ) : (
        <button type="button" onClick={handleLogin}>
          <Text variant="t3" className="text-point-1">
            {t('login.description')}
          </Text>
        </button>
      )}
    </section>
  );
}

export default observer(UserInfoCard);
