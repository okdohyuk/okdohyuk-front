import React, { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { blogApi } from '@api';
import { BlogSearch } from '@api/Blog';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import BlogCardSkeleton from '@components/blog/BlogCardSkeleton';
import { cls } from '@utils/classNameUtils';
import BlogCard from '../BlogCard';

interface RecommendedPostsProps {
  urlSlug: string;
  lng: Language;
}

function RecommendedPosts({ urlSlug, lng }: RecommendedPostsProps) {
  const { ref, inView } = useInView({ triggerOnce: true });
  const [posts, setPosts] = useState<BlogSearch[] | null>(null);
  const { t } = useTranslation(lng, 'common');

  useEffect(() => {
    if (inView) {
      blogApi
        .getBlogUrlSlugRecommended(urlSlug)
        .then((res) => setPosts(res.data))
        .catch((err) => console.error(err));
    }
  }, [inView, urlSlug]);

  if (inView && posts !== null && posts.length === 0) {
    return null;
  }

  return (
    <div ref={ref} className="mt-12 w-full">
      <h3 className="text-xl font-bold mb-6">{t('recommended_posts')}</h3>
      <div
        className={cls(
          'gap-4 pb-4 mx-4 px-4',
          posts !== null
            ? 'flex overflow-x-auto scrollbar-hide'
            : 'grid grid-cols-2 lg:grid-cols-3 h-80 md:h-96 overflow-hidden',
        )}
      >
        {posts !== null
          ? posts.map((post) => (
              <div key={post.id} className="min-w-[280px] md:min-w-[320px]">
                <BlogCard blog={post} type="frame" />
              </div>
            ))
          : Array.from({ length: 3 }, (_, index) => (
              <BlogCardSkeleton type="frame" key={`skeleton-${index}`} />
            ))}
      </div>
    </div>
  );
}

export default RecommendedPosts;
