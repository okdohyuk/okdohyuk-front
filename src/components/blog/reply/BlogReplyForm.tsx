/* eslint-disable react/require-default-props */
/* eslint-disable no-alert */
import React, { useState } from 'react';
import { blogReplyApi } from '@api';
import { BlogReply } from '@api/BlogReply';
import { useRouter } from 'next/navigation';
import UserTokenUtil from '@utils/userTokenUtil';
import { getErrorMessage } from '@utils/errorHandler';
import { Language } from '~/app/i18n/settings';
import { useTranslation } from '../../../app/i18n/client';

interface BlogReplyFormProps {
  urlSlug: string;
  parentId?: string;
  replyToEdit?: BlogReply;
  onSuccess: () => void;
  onCancel?: () => void;
  lng: Language;
}

function BlogReplyForm({
  urlSlug,
  parentId,
  replyToEdit,
  onSuccess,
  onCancel,
  lng,
}: BlogReplyFormProps) {
  const { t } = useTranslation(lng, 'common');
  const [content, setContent] = useState(replyToEdit?.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    // Check login
    const token = await UserTokenUtil.getAccessToken();
    if (!token) {
      if (window.confirm(t('confirm.loginRequired'))) {
        router.push('/auth/login');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const fullToken = `Bearer ${token}`;

      if (replyToEdit) {
        await blogReplyApi.putBlogReply(replyToEdit.id, fullToken, { urlSlug, content });
      } else {
        await blogReplyApi.postBlogReply(urlSlug, fullToken, {
          urlSlug,
          content,
          parentId: parentId || null,
        });
      }
      setContent('');
      onSuccess();
    } catch (error) {
      console.error('Failed to submit reply', error);
      alert(getErrorMessage(error, t));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
      <div className="relative">
        <textarea
          className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                     focus:ring-2 focus:ring-point-1 focus:border-transparent outline-none
                     transition-all duration-200 resize-none pb-8"
          rows={3}
          maxLength={500}
          placeholder={t('reply.placeholder')}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSubmitting}
        />
        <div className="absolute bottom-2 right-4 text-xs text-gray-400">{content.length}/500</div>
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 
                       hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            {t('reply.cancel')}
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2 text-sm font-bold text-white 
                     bg-point-1 hover:bg-point-2 active:bg-point-3
                     rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting || !content.trim()}
        >
          {(() => {
            if (isSubmitting) return '...';
            if (replyToEdit) return t('reply.action.edit');
            return t('reply.submit');
          })()}
        </button>
      </div>
    </form>
  );
}

export default BlogReplyForm;
