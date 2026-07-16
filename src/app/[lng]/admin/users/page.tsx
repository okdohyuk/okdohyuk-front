'use client';

import React, { use } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { userApi } from '@api';
import { User, UserRoleEnum } from '@api/User';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/basic/Table';
import ServiceInfoNotice from '@components/complex/Service/ServiceInfoNotice';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import { cn } from '@utils/cn';
import UserTokenUtil from '@utils/userTokenUtil';
import { getErrorMessage } from '@utils/errorHandler';
import { RefreshCcw, ShieldCheck, Users } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/basic/Select';
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
      return 'border-warn-3 bg-warn-4 text-warn-1 dark:border-warn-2/50 dark:bg-warn-2/20 dark:text-warn-4';
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
            <Users className="h-4 w-4 text-point-fg" />
            <h2 className="text-base font-bold text-fg-1">사용자 목록</h2>
            <span className="rounded-full bg-basic-3 px-2 py-0.5 text-[11px] font-bold text-fg-4">
              {totalUsers}
            </span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading}
            className={cn(
              SERVICE_CARD_INTERACTIVE,
              'inline-flex h-9 items-center gap-1 rounded-lg border border-basic-3 bg-basic-0/85 px-3 text-xs font-semibold text-fg-3 transition-colors hover:bg-basic-2 disabled:cursor-not-allowed disabled:opacity-60',
            )}
          >
            <RefreshCcw className={cn('h-3.5 w-3.5', isLoading ? 'animate-spin' : '')} />
            새로고침
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-basic-3 bg-basic-0/70 px-4 py-10 text-sm font-semibold text-fg-4">
            <RefreshCcw className="h-4 w-4 animate-spin" />
            사용자 목록을 불러오는 중입니다...
          </div>
        ) : null}

        {!isLoading && totalUsers === 0 ? (
          <div className="rounded-xl border border-dashed border-basic-3 bg-basic-0/70 px-4 py-10 text-center text-sm font-semibold text-fg-4">
            조회된 사용자가 없습니다.
          </div>
        ) : null}

        {!isLoading && totalUsers > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3">Profile</TableHead>
                <TableHead className="px-4 py-3">Name / Email</TableHead>
                <TableHead className="px-4 py-3">Role</TableHead>
                <TableHead className="px-4 py-3">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="whitespace-nowrap px-4 py-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full border border-basic-3 bg-basic-2">
                      {user.profileImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.profileImage}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-bold text-fg-5">
                          {user.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3">
                    <div className="font-semibold text-fg-1">{user.name}</div>
                    <div className="text-xs text-fg-5">{user.email}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                          getRoleBadgeClass(user.role),
                        )}
                      >
                        {user.role}
                      </span>
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleChange(user.id, value, user)}
                        disabled={isPending}
                      >
                        <SelectTrigger className="h-8 w-auto min-w-[100px] text-xs font-medium text-fg-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(UserRoleEnum).map((role) => (
                            <SelectItem key={role} value={role} className="text-xs">
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-4 py-3 text-fg-5">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
      </section>
    </div>
  );
}
