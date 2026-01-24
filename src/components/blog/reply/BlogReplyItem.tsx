/* eslint-disable react/require-default-props */
/* eslint-disable no-alert */
import React, { useEffect, useState } from 'react';
import { BlogReply } from '@api/BlogReply';
import { blogReplyApi } from '@api';
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

  const handleReplyClick = async () => {
    if (await checkLogin()) {
      setIsReplying(!isReplying);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('confirm.delete'))) return;
    try {
      const token = `Bearer ${await UserTokenUtil.getAccessToken()}`;
      await blogReplyApi.deleteBlogReply(reply.id, token || '');
      onRefresh();
    } catch (error) {
      console.error('Delete failed', error);
      alert(getErrorMessage(error, t));
    }
  };

  const handleReportClick = async () => {
    if (await checkLogin()) {
      setReportDialogOpen(true);
    }
  };

  const handleReportSubmit = async (reason: any) => {
    try {
      const token = `Bearer ${await UserTokenUtil.getAccessToken()}`;
      await blogReplyApi.postBlogReplyReport(reply.id, token || '', {
        reason,
        description: 'User report',
      });
      alert(t('alert.reported'));
    } catch (error: any) {
      alert(getErrorMessage(error, t));
    }
  };

  const isAuthor = currentUser?.id === reply.author?.id;
  const isAdmin = currentUser?.role === UserRoleEnum.Admin;
  const canEdit = isAuthor;
  const canDelete = isAuthor || isAdmin;

  return (
    <div
      className={`mt-6 ${
        depth > 0 ? 'ml-6 pl-4 border-l-2 border-gray-100 dark:border-gray-800' : ''
      }`}
    >
      <div className="flex justify-between items-start group">
        <div className="flex items-center gap-3">
          {/* Avatar Placeholder or Image */}
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
            {reply.author?.profileImage ? (
              <img
                src={reply.author.profileImage}
                alt={reply.author.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                {reply.author?.name?.charAt(0)}
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {reply.author?.name || 'Unknown'}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(reply.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
        <div className="flex gap-3 text-xs transition-opacity duration-200">
          {depth < 1 && ( // Max depth 1 (root -> child)
            <button
              type="button"
              onClick={handleReplyClick}
              className="text-gray-500 hover:text-point-1 font-medium"
            >
              {t('reply.action.reply')}
            </button>
          )}

          {canEdit &&
            isAuthor && ( // Only author can edit content typically
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-gray-500 hover:text-point-1 font-medium"
              >
                {t('reply.action.edit')}
              </button>
            )}

          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="text-gray-500 hover:text-red-500 font-medium"
            >
              {t('reply.action.delete')}
            </button>
          )}

          <button
            type="button"
            onClick={handleReportClick}
            className="text-gray-400 hover:text-red-400 font-medium"
          >
            {t('reply.action.report')}
          </button>
        </div>
      </div>

      <div className="ml-11 mt-2">
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
            className={`text-base leading-relaxed whitespace-pre-wrap ${
              reply.isDeleted ? 'text-gray-400 italic' : 'text-gray-800 dark:text-gray-200'
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
