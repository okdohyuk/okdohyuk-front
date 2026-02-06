'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useCookies } from 'react-cookie';
import { v4 as uuidv4 } from 'uuid';
import { blogApi } from '@api';
import { Text } from '@components/basic/Text';
import logger from '@utils/logger';
import { useBlogDetail } from './BlogDetailProvider';

function LikeButton() {
  const { blog } = useBlogDetail();
  const [cookies, setCookie] = useCookies(['Authorization', 'SessionId']);

  const [likeCount, setLikeCount] = useState(blog.likeCount || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!cookies.SessionId) {
      setCookie('SessionId', uuidv4(), { path: '/' });
    }
  }, [cookies.SessionId, setCookie]);

  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const { data } = await blogApi.getBlogLike(
          blog.urlSlug,
          cookies.Authorization ?? (undefined as unknown as string),
          cookies.SessionId ?? (undefined as unknown as string),
        );
        setLikeCount(data.likeCount);
        setIsLiked(data.isLiked);
      } catch (error) {
        logger.error('Failed to fetch like status', error);
      }
    };

    fetchLikeStatus();
  }, [blog.urlSlug, cookies.Authorization, cookies.SessionId]);

  const handleLike = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isLiked) {
        const { data } = await blogApi.deleteBlogLike(
          blog.urlSlug,
          cookies.Authorization ?? (undefined as unknown as string),
          cookies.SessionId ?? (undefined as unknown as string),
        );
        setLikeCount(data.likeCount);
        setIsLiked(data.isLiked);
      } else {
        const { data } = await blogApi.postBlogLike(
          blog.urlSlug,
          cookies.Authorization ?? (undefined as unknown as string),
          cookies.SessionId ?? (undefined as unknown as string),
        );
        setLikeCount(data.likeCount);
        setIsLiked(data.isLiked);
      }
    } catch (error) {
      logger.error('Failed to toggle like', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="my-8 flex flex-col items-center justify-center gap-2">
      <motion.button
        onClick={handleLike}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.9 }}
        className={`rounded-full border p-3 shadow-lg transition-colors ${
          isLiked
            ? 'border-red-400 bg-red-500 text-white'
            : 'border-zinc-200 bg-white/90 text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500'
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
        {likeCount ?? 0}
      </Text>
    </div>
  );
}

export default LikeButton;
