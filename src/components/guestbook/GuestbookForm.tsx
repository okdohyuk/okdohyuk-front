'use client';

import React, { useEffect, useState } from 'react';
import { useCreateGuestbook } from '@queries/useGuestbookQueries';
import UserTokenUtil from '@utils/userTokenUtil';
import { getErrorMessage } from '@utils/errorHandler';
import { Language } from '~/app/i18n/settings';
import { useTranslation } from '~/app/i18n/client';
import { Button } from '@components/basic/Button';
import { Input } from '@components/basic/Input';
import { Textarea } from '@components/basic/Textarea';

interface GuestbookFormProps {
  onSuccess: () => void;
  lng: Language;
}

const MAX_CONTENT_LENGTH = 500;
const MAX_NICKNAME_LENGTH = 50;

export default function GuestbookForm({ onSuccess, lng }: GuestbookFormProps) {
  const { t } = useTranslation(lng, 'guestbook');
  const { t: tCommon } = useTranslation(lng, 'common');

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [content, setContent] = useState('');
  const [nickname, setNickname] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [error, setError] = useState('');

  const createMutation = useCreateGuestbook();

  useEffect(() => {
    setIsLoggedIn(!!UserTokenUtil.getAccessToken());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setError(t('validation.contentRequired'));
      return;
    }

    if (!isLoggedIn) {
      if (!nickname.trim()) {
        setError(t('validation.nicknameRequired'));
        return;
      }
      if (!deletePassword.trim()) {
        setError(t('validation.passwordRequired'));
        return;
      }
    }

    const payload = isLoggedIn
      ? { content: trimmedContent }
      : { content: trimmedContent, nickname: nickname.trim(), deletePassword };

    createMutation.mutate(payload, {
      onSuccess: () => {
        setContent('');
        setNickname('');
        setDeletePassword('');
        onSuccess();
      },
      onError: (err) => {
        setError(getErrorMessage(err, tCommon));
      },
    });
  };

  const isSubmitting = createMutation.isPending;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-basic-3/80 bg-basic-0/70 p-4 backdrop-blur-sm"
    >
      {!isLoggedIn && (
        <div className="grid gap-2 sm:grid-cols-2">
          <Input
            aria-label={t('form.nickname')}
            placeholder={t('form.nicknamePlaceholder')}
            maxLength={MAX_NICKNAME_LENGTH}
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            disabled={isSubmitting}
          />
          <Input
            type="password"
            aria-label={t('form.password')}
            placeholder={t('form.passwordPlaceholder')}
            value={deletePassword}
            onChange={(event) => setDeletePassword(event.target.value)}
            disabled={isSubmitting}
          />
        </div>
      )}

      <div className="relative">
        <Textarea
          aria-label={t('form.content')}
          className="min-h-[96px] p-4 pb-8 text-sm"
          maxLength={MAX_CONTENT_LENGTH}
          placeholder={t('placeholder')}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          disabled={isSubmitting}
        />
        <div className="absolute bottom-2 right-4 text-xs text-fg-5">
          {content.length}/{MAX_CONTENT_LENGTH}
        </div>
      </div>

      {error && <p className="text-sm text-danger-2">{error}</p>}

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-fg-5">
          {isLoggedIn ? t('form.loginNotice') : t('form.anonymousNotice')}
        </p>
        <Button
          type="submit"
          className="px-6 py-2 text-sm font-bold"
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? t('form.submitting') : t('form.submit')}
        </Button>
      </div>
    </form>
  );
}
