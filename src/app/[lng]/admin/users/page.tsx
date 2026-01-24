'use client';

import React, { use } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { userApi } from '@api';
import { User, UserRoleEnum } from '@api/User';
import UserTokenUtil from '@utils/userTokenUtil';
import { getErrorMessage } from '@utils/errorHandler';
import { useTranslation } from '~/app/i18n/client';
import { LanguageParams } from '~/app/[lng]/layout';
import { Language } from '~/app/i18n/settings';

export default function AdminUsersPage({ params }: LanguageParams) {
  const { lng } = use(params);
  const { t } = useTranslation(lng as Language, 'common');

  const { data: users, refetch } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const token = await UserTokenUtil.getAccessToken();
      const res = await userApi.getUsers(`Bearer ${token}`);
      return res.data;
    },
  });

  const { mutate: updateRole } = useMutation({
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
      // We must pass the entire user object or at least the fields required by backend update
      // Backend UserEntity.update updates name, profileImage, role.
      // So we should pass the existing user data but with new role.
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Profile
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Name / Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users?.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-500 font-bold">
                        {user.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value, user)}
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1"
                  >
                    {Object.values(UserRoleEnum).map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
