'use client';

import React, { use } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { userApi } from '@api';
import { User, UserRoleEnum } from '@api/User';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import ServiceInfoNotice from '@components/complex/Service/ServiceInfoNotice';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import { cn } from '@utils/cn';
import UserTokenUtil from '@utils/userTokenUtil';
import { getErrorMessage } from '@utils/errorHandler';
import { RefreshCcw, ShieldCheck, Users } from 'lucide-react';
import { useTranslation } from '~/app/i18n/client';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language } from '~/app/i18n/settings';

export default function AdminUsersPage({ params }: LanguageParams) {
  const { lng } = use(params);
  const { t } = useTranslation(lng as Language, 'common');

  const {
    data: users,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const token = await UserTokenUtil.getAccessToken();
      const res = await userApi.getUsers(`Bearer ${token}`);
      return res.data;
    },
  });

  const { mutate: updateRole, isPending } = useMutation({
    mutationFn: async ({
      userId,
      role,
      currentData,
    }: {
      userId: string;
      role: UserRoleEnum;
      currentData: User;
    }) => {
      const token = await UserTokenUtil.getAccessToken();
      const updatedUser: User = { ...currentData, role };
      await userApi.putUserUserId(`Bearer ${token}`, userId, updatedUser);
    },
    onSuccess: () => {
      // eslint-disable-next-line no-alert
      alert('Role updated successfully');
      refetch();
    },
    onError: (error) => {
      // eslint-disable-next-line no-alert
      alert(getErrorMessage(error, t));
    },
  });

  const handleRoleChange = (userId: string, newRole: string, user: User) => {
    // eslint-disable-next-line no-alert, no-restricted-globals
    if (!confirm(`Change role to ${newRole}?`)) return;
    updateRole({ userId, role: newRole as UserRoleEnum, currentData: user });
  };

  const totalUsers = users?.length ?? 0;

  const getRoleBadgeClass = (role: UserRoleEnum) => {
    if (role === UserRoleEnum.Admin) {
      return 'border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-500/50 dark:bg-amber-500/20 dark:text-amber-100';
    }
    return 'border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-500/50 dark:bg-emerald-500/20 dark:text-emerald-100';
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-2 pb-24 pt-3 sm:px-3 md:px-4">
      <ServicePageHeader
        title="유저 관리"
        description="가입 사용자 정보와 권한(Role)을 확인하고 즉시 변경할 수 있습니다."
        badge="Admin Console"
      />

      <ServiceInfoNotice icon={<ShieldCheck className="h-5 w-5" />}>
        Role 변경은 즉시 반영됩니다. 중요한 계정은 변경 전에 한 번 더 확인하세요.
      </ServiceInfoNotice>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-point-1" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">사용자 목록</h2>
            <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[11px] font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
              {totalUsers}
            </span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading}
            className={cn(
              SERVICE_CARD_INTERACTIVE,
              'inline-flex h-9 items-center gap-1 rounded-lg border border-zinc-200 bg-white/85 px-3 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-200 dark:hover:bg-zinc-700',
            )}
          >
            <RefreshCcw className={cn('h-3.5 w-3.5', isLoading ? 'animate-spin' : '')} />
            새로고침
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300/90 bg-white/70 px-4 py-10 text-sm font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300">
            <RefreshCcw className="h-4 w-4 animate-spin" />
            사용자 목록을 불러오는 중입니다...
          </div>
        ) : null}

        {!isLoading && totalUsers === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300/90 bg-white/70 px-4 py-10 text-center text-sm font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300">
            조회된 사용자가 없습니다.
          </div>
        ) : null}

        {!isLoading && totalUsers > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-zinc-200/80 bg-white/80 dark:border-zinc-700 dark:bg-zinc-900/70">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-100/90 dark:bg-zinc-800/80">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-300">
                    Profile
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-300">
                    Name / Email
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-300">
                    Role
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-300">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/90 dark:divide-zinc-700/80">
                {users?.map((user) => (
                  <tr key={user.id} className="align-middle">
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                        {user.profileImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.profileImage}
                            alt={user.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-zinc-500 dark:text-zinc-300">
                            {user.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-50">
                        {user.name}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">{user.email}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                            getRoleBadgeClass(user.role),
                          )}
                        >
                          {user.role}
                        </span>
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value, user)}
                          disabled={isPending}
                          className="h-8 rounded-md border border-zinc-300 bg-white px-2 text-xs font-medium text-zinc-700 outline-none transition-colors focus:border-point-2 focus:ring-2 focus:ring-point-2/40 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                        >
                          {Object.values(UserRoleEnum).map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}
