'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useCookies } from 'react-cookie';
import { v4 as uuidv4 } from 'uuid';
import { blogApi } from '@api';
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
        console.error('Failed to fetch like status', error);
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
      console.error('Failed to toggle like', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2 my-8">
      <motion.button
        onClick={handleLike}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`p-3 rounded-full shadow-lg transition-colors ${
          isLiked ? 'bg-red-500 text-white' : 'bg-white text-gray-400 border border-gray-200'
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
      <div className="text-sm font-medium text-gray-600">{likeCount ?? 0}</div>
    </div>
  );
}

export default LikeButton;
