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
import { cn } from '@utils/cn';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';

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

  if (!isClient) {
    return (
      <section className={cn(SERVICE_PANEL_SOFT, 'mb-4 p-3')}>
        <Skeleton className="h-11 w-full rounded-xl" />
      </section>
    );
  }

  return (
    <section className={cn(SERVICE_PANEL_SOFT, 'mb-4 flex flex-wrap items-center gap-3 p-3')}>
      {user ? (
        <>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-200 dark:border-zinc-700">
            <Image
              src={user.profileImage}
              width={40}
              height={40}
              alt="profile"
              className="block h-full w-full object-cover"
            />
          </div>
          <Text className="mr-auto t-basic-1" variant="d1">
            {user.name}
          </Text>
          <button
            type="button"
            className="rounded-lg border border-zinc-200 bg-white/85 px-2.5 py-1 text-xs font-semibold text-zinc-700 transition-colors hover:border-point-2 hover:text-point-1 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-200"
            onClick={logOut}
          >
            {t('login.logout')}
          </button>
          <button
            type="button"
            className="rounded-lg border border-zinc-200 bg-white/85 px-2.5 py-1 text-xs font-semibold text-zinc-700 transition-colors hover:border-point-2 hover:text-point-1 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-200"
            onClick={logOutAll}
          >
            {t('login.logoutAll')}
          </button>
          {/* 어드민이면 /admin 이동 버튼 노출 */}
          {user.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="rounded-lg border border-point-2/60 bg-point-4/40 px-2.5 py-1 text-xs font-semibold text-point-1 transition-colors hover:bg-point-4/70 dark:border-point-1/50 dark:bg-point-1/20"
            >
              관리자
            </Link>
          )}
        </>
      ) : (
        <button
          type="button"
          className="flex h-11 w-full items-center rounded-xl bg-point-1 px-4 text-left text-sm font-semibold text-white transition-colors hover:bg-point-2"
          onClick={handleLogin}
        >
          {t('login.description')}
        </button>
      )}
    </section>
  );
}

export default observer(UserInfoCard);
