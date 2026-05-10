/* eslint-disable react/require-default-props */
/* eslint-disable no-alert */
import React, { useEffect, useState } from 'react';
import Image from 'next/legacy/image';
import { BlogReply } from '@api/BlogReply';
import { useDeleteBlogReply, useReportBlogReply } from '@queries/useReplyQueries';
import UserTokenUtil from '@utils/userTokenUtil';
import { useRouter } from 'next/navigation';
import { User, UserRoleEnum } from '@api/User';

import { getErrorMessage } from '@utils/errorHandler';
import { Language } from '~/app/i18n/settings';
import { useTranslation } from '../../../app/i18n/client';

import BlogReplyForm from './BlogReplyForm';
import ReportDialog from './ReportDialog';

interface BlogReplyItemProps {
  reply: BlogReply;
  urlSlug: string;
  onRefresh: () => void;
  depth?: number;
  lng: Language;
}

export default function BlogReplyItem({
  reply,
  urlSlug,
  onRefresh,
  depth = 0,
  lng,
}: BlogReplyItemProps) {
  const { t } = useTranslation(lng, 'common');
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  useEffect(() => {
    const user = UserTokenUtil.getUserInfo();
    setCurrentUser(user);
  }, []);

  const checkLogin = async () => {
    const token = await UserTokenUtil.getAccessToken();
    if (!token) {
      if (window.confirm(t('confirm.loginRequired'))) {
        router.push('/auth/login');
      }
      return false;
    }
    return true;
  };

  const deleteReplyMutation = useDeleteBlogReply(urlSlug);
  const reportReplyMutation = useReportBlogReply();

  const handleReplyClick = async () => {
    if (await checkLogin()) {
      setIsReplying(!isReplying);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('confirm.delete'))) return;
    deleteReplyMutation.mutate(reply.id, {
      onSuccess: () => {
        onRefresh();
      },
      onError: (error) => {
        // eslint-disable-next-line no-console
        console.error('Delete failed', error);
        alert(getErrorMessage(error, t));
      },
    });
  };

  const handleReportClick = async () => {
    if (await checkLogin()) {
      setReportDialogOpen(true);
    }
  };

  const handleReportSubmit = (reason: any) => {
    reportReplyMutation.mutate(
      {
        replyId: reply.id,
        reason,
        description: 'User report',
      },
      {
        onSuccess: () => {
          alert(t('alert.reported'));
          setReportDialogOpen(false);
        },
        onError: (error) => {
          alert(getErrorMessage(error, t));
        },
      },
    );
  };

  const isAuthor = currentUser?.id === reply.author?.id;
  const isAdmin = currentUser?.role === UserRoleEnum.Admin;
  const canEdit = isAuthor;
  const canDelete = isAuthor || isAdmin;

  const actionButtonClass =
    'rounded-md px-2 py-1 font-medium text-fg-5 transition-colors hover:bg-point-4/70 hover:text-point-fg';

  return (
    <div className={`mt-6 ${depth > 0 ? 'ml-6 border-l-2 border-basic-3 pl-4' : ''}`}>
      <div className="group rounded-xl border border-basic-3/80 bg-basic-0/70 p-3 backdrop-blur-sm md:p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-basic-2 dark:bg-basic-3">
              {reply.author?.profileImage ? (
                <div className="relative h-full w-full">
                  <Image
                    src={reply.author.profileImage}
                    alt={reply.author.name}
                    layout="fill"
                    objectFit="cover"
                    unoptimized
                  />
                </div>
              ) : (
                <span className="text-xs font-bold text-fg-5">{reply.author?.name?.charAt(0)}</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-fg-1">{reply.author?.name || 'Unknown'}</span>
              <span className="text-xs text-fg-5">
                {new Date(reply.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex gap-2 text-xs transition-opacity duration-200">
            {depth < 1 && (
              <button type="button" onClick={handleReplyClick} className={actionButtonClass}>
                {t('reply.action.reply')}
              </button>
            )}

            {canEdit && isAuthor ? (
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={actionButtonClass}
              >
                {t('reply.action.edit')}
              </button>
            ) : null}

            {canDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-md px-2 py-1 font-medium text-fg-5 transition-colors hover:bg-danger-4 hover:text-danger-2"
              >
                {t('reply.action.delete')}
              </button>
            )}

            <button
              type="button"
              onClick={handleReportClick}
              className="rounded-md px-2 py-1 font-medium text-fg-6 transition-colors hover:bg-danger-4 hover:text-danger-3"
            >
              {t('reply.action.report')}
            </button>
          </div>
        </div>

        <div className="ml-11 mt-3">
          {isEditing ? (
            <BlogReplyForm
              urlSlug={urlSlug}
              replyToEdit={reply}
              onSuccess={() => {
                setIsEditing(false);
                onRefresh();
              }}
              onCancel={() => setIsEditing(false)}
              lng={lng}
            />
          ) : (
            <div
              className={`whitespace-pre-wrap text-base leading-relaxed ${
                reply.isDeleted ? 'italic text-fg-6' : 'text-fg-2'
              }`}
            >
              {reply.content}
            </div>
          )}

          {isReplying && (
            <div className="mt-4">
              <BlogReplyForm
                urlSlug={urlSlug}
                parentId={reply.id}
                onSuccess={() => {
                  setIsReplying(false);
                  onRefresh();
                }}
                onCancel={() => setIsReplying(false)}
                lng={lng}
              />
            </div>
          )}
        </div>
      </div>

      {reply.children && reply.children.length > 0 && (
        <div className="mt-4">
          {reply.children.map((child) => (
            <BlogReplyItem
              key={child.id}
              reply={child}
              urlSlug={urlSlug}
              onRefresh={onRefresh}
              depth={depth + 1}
              lng={lng}
            />
          ))}
        </div>
      )}

      <ReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        onSubmit={handleReportSubmit}
      />
    </div>
  );
}
