/* eslint-disable react/require-default-props */
/* eslint-disable no-alert */
import React, { useState } from 'react';
import { useCreateBlogReply, useUpdateBlogReply } from '@queries/useReplyQueries';
import { BlogReply } from '@api/BlogReply';
import { useRouter } from 'next/navigation';
import UserTokenUtil from '@utils/userTokenUtil';
import { getErrorMessage } from '@utils/errorHandler';
import { rememberLoginRedirect } from '@utils/loginRedirect';
import { Button } from '@components/basic/Button';
import { Language } from '~/app/i18n/settings';
import { useTranslation } from '../../../app/i18n/client';

const REPLY_MAX_LENGTH = 500;

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
        rememberLoginRedirect(window.location.pathname);
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
          aria-label={t('reply.listTitle')}
          className="w-full resize-none rounded-lg border border-basic-3 bg-basic-0 px-3 pb-8 pt-3 text-sm leading-relaxed text-fg-1 outline-none transition-colors duration-150 placeholder:text-fg-5 focus:border-focus focus:ring-2 focus:ring-point-2/25 dark:bg-basic-1 md:text-base"
          rows={3}
          maxLength={REPLY_MAX_LENGTH}
          placeholder={t('reply.placeholder')}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSubmitting}
        />
        <div className="pointer-events-none absolute bottom-2 right-3 font-mono text-xs tabular-nums text-fg-5">
          {content.length}/{REPLY_MAX_LENGTH}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            {t('reply.cancel')}
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || !content.trim()}>
          {(() => {
            if (isSubmitting) return '...';
            if (replyToEdit) return t('reply.action.edit');
            return t('reply.submit');
          })()}
        </Button>
      </div>
    </form>
  );
}

export default BlogReplyForm;
