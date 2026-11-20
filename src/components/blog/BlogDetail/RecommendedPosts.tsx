import React from 'react';
import { useInView } from 'react-intersection-observer';
import { useGetRecommendedPosts } from '@queries/useBlogQueries';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import BlogCardSkeleton from '@components/blog/BlogCardSkeleton';
import { cn } from '@utils/cn';
import BlogCard from '../BlogCard';

interface RecommendedPostsProps {
  urlSlug: string;
  lng: Language;
}

function RecommendedPosts({ urlSlug, lng }: RecommendedPostsProps) {
  const { ref } = useInView({ triggerOnce: true });
  const { t } = useTranslation(lng, 'common');

  const { data: posts } = useGetRecommendedPosts(urlSlug);

  if (posts && posts.length === 0) {
    return null;
  }

  return (
    <div ref={ref} className="w-full">
      <h3 className="mb-4 text-lg font-semibold text-fg-1">{t('recommended_posts')}</h3>
      <div
        className={cn(
          'gap-4 pb-1',
          posts
            ? 'flex overflow-x-auto scrollbar-hide'
            : 'grid h-80 grid-cols-1 overflow-hidden sm:grid-cols-2 md:h-96 lg:grid-cols-3',
        )}
      >
        {posts
          ? posts.map((post) => (
              <div key={post.id} className="w-70 shrink-0 md:w-80">
                <BlogCard blog={post} type="frame" lng={lng} />
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
