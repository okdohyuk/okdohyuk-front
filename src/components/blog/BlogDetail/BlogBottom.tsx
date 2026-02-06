import React, { Suspense } from 'react';
import Link from '@components/basic/Link';
import Tag from '@components/basic/Tag';
import { useBlogDetail } from 'components/blog/BlogDetail/BlogDetailProvider';
import Skeleton from '@components/basic/Skeleton';
import { BLOG_GLASS_PANEL_SOFT } from '@components/blog/interactiveStyles';

const LikeButton = React.lazy(() => import('./LikeButton'));
const BlogReplyList = React.lazy(() => import('../reply/BlogReplyList'));
const RecommendedPosts = React.lazy(() => import('./RecommendedPosts'));

function BlogBottom() {
  const {
    blog: { tags, urlSlug },
    lng,
  } = useBlogDetail();

  return (
    <>
      <Suspense fallback={<Skeleton className="w-[100px] h-[40px] rounded-full" />}>
        <LikeButton />
      </Suspense>

      <footer className="mt-8 w-full space-y-6">
        <section className={`${BLOG_GLASS_PANEL_SOFT} px-4 py-4`}>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link key={tag} href={`/blog?tagIn=${tag}`}>
                <Tag tag={tag} />
              </Link>
            ))}
          </div>
        </section>

        <section className={`${BLOG_GLASS_PANEL_SOFT} px-4 py-5 md:px-5`}>
          <Suspense fallback={<Skeleton className="h-[200px]" />}>
            <BlogReplyList urlSlug={urlSlug} lng={lng} />
          </Suspense>
        </section>

        <section className={`${BLOG_GLASS_PANEL_SOFT} px-4 py-5 md:px-5`}>
          <Suspense fallback={<Skeleton className="h-[200px]" />}>
            <RecommendedPosts urlSlug={urlSlug} lng={lng} />
          </Suspense>
        </section>
      </footer>
    </>
  );
}

export default BlogBottom;
