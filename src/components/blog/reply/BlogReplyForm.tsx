/* eslint-disable react/require-default-props */
/* eslint-disable no-alert */
import React, { useState } from 'react';
import { useCreateBlogReply, useUpdateBlogReply } from '@queries/useReplyQueries';
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

  const createMutation = useCreateBlogReply(urlSlug);
  const updateMutation = useUpdateBlogReply(urlSlug);

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

    const handleSuccess = () => {
      setContent('');
      onSuccess();
      setIsSubmitting(false);
    };

    const handleError = (error: any) => {
      // eslint-disable-next-line no-console
      console.error('Failed to submit reply', error);
      alert(getErrorMessage(error, t));
      setIsSubmitting(false);
    };

    if (replyToEdit) {
      updateMutation.mutate(
        { id: replyToEdit.id, content },
        { onSuccess: handleSuccess, onError: handleError },
      );
    } else {
      createMutation.mutate(
        { content, parentId },
        { onSuccess: handleSuccess, onError: handleError },
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
      <div className="relative">
        <textarea
          className="w-full resize-none rounded-xl border border-zinc-200 bg-white/90 p-4 pb-8 text-gray-900 outline-none transition-all duration-200 focus:border-point-2 focus:ring-2 focus:ring-point-2/40 dark:border-zinc-700 dark:bg-zinc-800/90 dark:text-gray-100"
          rows={3}
          maxLength={500}
          placeholder={t('reply.placeholder')}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSubmitting}
        />
        <div className="absolute bottom-2 right-4 text-xs text-zinc-400">{content.length}/500</div>
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            disabled={isSubmitting}
          >
            {t('reply.cancel')}
          </button>
        )}
        <button
          type="submit"
          className="rounded-lg bg-point-1 px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-point-2 active:bg-point-3 disabled:cursor-not-allowed disabled:opacity-50"
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
