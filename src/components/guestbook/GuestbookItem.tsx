/* eslint-disable no-alert */

'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/legacy/image';
import { useRouter } from 'next/navigation';
import { Guestbook, GuestbookReportRequestReasonEnum } from '@api/Guestbook';
import { User, UserRoleEnum } from '@api/User';
import { useDeleteGuestbook, useReportGuestbook } from '@queries/useGuestbookQueries';
import UserTokenUtil from '@utils/userTokenUtil';
import { getErrorMessage } from '@utils/errorHandler';
import { rememberLoginRedirect } from '@utils/loginRedirect';
import { Language } from '~/app/i18n/settings';
import { useTranslation } from '~/app/i18n/client';
import { Input } from '@components/basic/Input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@components/ui/dialog';
import GuestbookReportDialog from './GuestbookReportDialog';

interface GuestbookItemProps {
  guestbook: Guestbook;
  onRefresh: () => void;
  lng: Language;
}

export default function GuestbookItem({ guestbook, onRefresh, lng }: GuestbookItemProps) {
  const { t } = useTranslation(lng, 'guestbook');
  const { t: tCommon } = useTranslation(lng, 'common');
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    setCurrentUser(UserTokenUtil.getUserInfo());
  }, []);

  const deleteMutation = useDeleteGuestbook();
  const reportMutation = useReportGuestbook();

  const isAnonymous = !guestbook.author;
  const isOwner = !!currentUser && !!guestbook.author && currentUser.id === guestbook.author.id;
  const isAdmin = currentUser?.role === UserRoleEnum.Admin;
  const displayName = guestbook.author?.name ?? guestbook.nickname ?? t('anonymous');

  const canDeleteWithConfirm = isOwner || isAdmin;
  const showDelete = !guestbook.isDeleted && (isAnonymous || canDeleteWithConfirm);
  const showReport = !guestbook.isDeleted && !isOwner;

  const checkLogin = async () => {
    const token = UserTokenUtil.getAccessToken();
    if (!token) {
      if (window.confirm(tCommon('confirm.loginRequired'))) {
        rememberLoginRedirect(window.location.pathname);
        router.push('/auth/login');
      }
      return false;
    }
    return true;
  };

  const handleDeleteClick = () => {
    setDeleteError('');
    if (isAnonymous) {
      setDeletePassword('');
      setDeleteDialogOpen(true);
      return;
    }
    if (!window.confirm(tCommon('confirm.delete'))) return;
    deleteMutation.mutate(
      { id: guestbook.id },
      {
        onSuccess: () => onRefresh(),
        onError: (error) => alert(getErrorMessage(error, tCommon)),
      },
    );
  };

  const handleDeleteWithPassword = () => {
    setDeleteError('');
    if (!deletePassword.trim()) {
      setDeleteError(t('validation.passwordRequired'));
      return;
    }
    deleteMutation.mutate(
      { id: guestbook.id, deletePassword },
      {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setDeletePassword('');
          onRefresh();
        },
        onError: (error) => setDeleteError(getErrorMessage(error, tCommon)),
      },
    );
  };

  const handleReportClick = async () => {
    if (await checkLogin()) {
      setReportDialogOpen(true);
    }
  };

  const handleReportSubmit = (reason: GuestbookReportRequestReasonEnum, description?: string) => {
    reportMutation.mutate(
      { id: guestbook.id, reason, description },
      {
        onSuccess: () => {
          alert(tCommon('alert.reported'));
          setReportDialogOpen(false);
        },
        onError: (error) => alert(getErrorMessage(error, tCommon)),
      },
    );
  };

  const actionButtonClass =
    'rounded-md px-2 py-1 text-xs font-medium text-fg-5 transition-colors hover:bg-danger-4 hover:text-danger-2';

  return (
    <div className="group rounded-xl border border-basic-3/80 bg-basic-0/70 p-3 backdrop-blur-sm md:p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-basic-2 dark:bg-basic-3">
            {guestbook.author?.profileImage ? (
              <div className="relative h-full w-full">
                <Image
                  src={guestbook.author.profileImage}
                  alt={displayName}
                  layout="fill"
                  objectFit="cover"
                  unoptimized
                />
              </div>
            ) : (
              <span className="text-xs font-bold text-fg-5">{displayName.charAt(0)}</span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-fg-1">{displayName}</span>
            <span className="text-xs text-fg-5">
              {new Date(guestbook.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        {!guestbook.isDeleted && (
          <div className="flex gap-2">
            {showReport && (
              <button type="button" onClick={handleReportClick} className={actionButtonClass}>
                {t('report.button')}
              </button>
            )}
            {showDelete && (
              <button type="button" onClick={handleDeleteClick} className={actionButtonClass}>
                {t('delete.button')}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="ml-11 mt-3">
        <p
          className={`whitespace-pre-wrap break-words text-base leading-relaxed ${
            guestbook.isDeleted ? 'italic text-fg-6' : 'text-fg-2'
          }`}
        >
          {guestbook.isDeleted ? t('deletedMessage') : guestbook.content}
        </p>
      </div>

      <GuestbookReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        onSubmit={handleReportSubmit}
        lng={lng}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-2xl border-basic-3 bg-basic-0/95 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-fg-1">{t('delete.passwordPrompt')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            <Input
              type="password"
              aria-label={t('delete.passwordPrompt')}
              placeholder={t('delete.passwordPlaceholder')}
              value={deletePassword}
              onChange={(event) => setDeletePassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleDeleteWithPassword();
              }}
            />
            {deleteError && <p className="text-sm text-danger-2">{deleteError}</p>}
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setDeleteDialogOpen(false)}
              className="rounded-md px-4 py-2 text-sm font-medium text-fg-4 transition-colors hover:bg-basic-2"
            >
              {t('delete.cancel')}
            </button>
            <button
              type="button"
              onClick={handleDeleteWithPassword}
              disabled={deleteMutation.isPending}
              className="rounded-md bg-danger-2 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-danger-1 disabled:opacity-50"
            >
              {t('delete.submit')}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
