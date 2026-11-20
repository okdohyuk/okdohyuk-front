'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { cn } from '@utils/cn';
import { useSession } from '@hooks/useSession';
import { useGetBlogLike, useToggleBlogLike } from '@queries/useBlogQueries';
import { getErrorMessage } from '@utils/errorHandler';
import logger from '@utils/logger';
import { useTranslation } from '~/app/i18n/client';
import { useBlogDetail } from './BlogDetailProvider';

function LikeButton() {
  const { blog, lng } = useBlogDetail();
  const { t } = useTranslation(lng, 'common');
  // 백엔드 발급 세션 보장 — 쿠키 미존재 시 자동 발급/갱신.
  // Authorization 은 axios 요청 인터셉터가 주입하므로 여기서 토큰을 다루지 않는다.
  const { sessionId } = useSession();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const { data: like } = useGetBlogLike(blog.urlSlug, sessionId ?? undefined);
  const { mutate: toggleLike, isPending } = useToggleBlogLike(blog.urlSlug, sessionId ?? undefined);

  const likeCount = like?.likeCount ?? blog.likeCount ?? 0;
  const isLiked = like?.isLiked ?? false;
  const isLoading = isPending;

  const handleLike = () => {
    if (isPending) return;
    setErrorMessage(null);
    toggleLike(isLiked, {
      // 401 은 더 이상 인터셉터가 로그인 페이지로 튕기지 않으므로(비로그인 정상 흐름),
      // 실패 사유를 화면에서 직접 안내해야 한다. 안내하지 않으면 "눌러도 무반응"이 된다.
      onError: (error) => {
        logger.error('Failed to toggle like', error);
        setErrorMessage(getErrorMessage(error, t));
      },
    });
  };

  return (
    <div className="my-10 flex flex-col items-center justify-center gap-2">
      <motion.button
        type="button"
        onClick={handleLike}
        aria-pressed={isLiked}
        aria-label={isLiked ? t('like.remove') : t('like.add')}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
        className={cn(
          'inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-150',
          'focus-ring',
          isLiked
            ? 'border-danger-3/60 bg-danger-4/40 text-danger-2 dark:bg-danger-1/15'
            : 'border-basic-3 bg-basic-0 text-fg-5 hover:bg-basic-2 hover:text-fg-2 dark:bg-basic-1',
        )}
        disabled={isLoading}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isLiked ? 'liked' : 'unliked'}
            className="inline-flex"
            initial={shouldReduceMotion ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          >
            <Heart
              className={cn('h-5 w-5', isLiked && 'fill-current')}
              strokeWidth={1.75}
              aria-hidden
            />
          </motion.span>
        </AnimatePresence>
      </motion.button>
      <span className="font-mono text-sm tabular-nums text-fg-4">
        {likeCount.toLocaleString('en-US')}
      </span>
      {errorMessage ? (
        <p className="text-center text-sm text-danger-2" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

export default LikeButton;
