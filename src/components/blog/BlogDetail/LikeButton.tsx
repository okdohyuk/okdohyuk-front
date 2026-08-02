'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Text } from '@components/basic/Text';
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
    <div className="my-8 flex flex-col items-center justify-center gap-2">
      <motion.button
        type="button"
        onClick={handleLike}
        aria-pressed={isLiked}
        aria-label={isLiked ? t('like.remove') : t('like.add')}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.9 }}
        className={`rounded-full border p-3 shadow-lg transition-colors ${
          isLiked
            ? 'border-danger-3 bg-danger-2 text-white'
            : 'border-basic-3 bg-basic-0/90 text-fg-6'
        }`}
        disabled={isLoading}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isLiked ? 'liked' : 'unliked'}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Heart className={`w-8 h-8 ${isLiked ? 'fill-current' : ''}`} />
          </motion.div>
        </AnimatePresence>
      </motion.button>
      <Text variant="d3" color="basic-5" className="font-semibold">
        {likeCount}
      </Text>
      {errorMessage ? (
        <Text variant="d3" className="text-center font-semibold text-danger-2" role="alert">
          {errorMessage}
        </Text>
      ) : null}
    </div>
  );
}

export default LikeButton;
