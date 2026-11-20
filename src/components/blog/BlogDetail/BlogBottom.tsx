import React, { Suspense } from 'react';
import Link from '@components/basic/Link';
import Tag from '@components/basic/Tag';
import { useBlogDetail } from 'components/blog/BlogDetail/BlogDetailProvider';
import Skeleton from '@components/basic/Skeleton';

const LikeButton = React.lazy(() => import('./LikeButton'));
const BlogReplyList = React.lazy(() => import('../reply/BlogReplyList'));
const RecommendedPosts = React.lazy(() => import('./RecommendedPosts'));

/*
 * After the article: like, tags, comments, related posts. Sections sit on the canvas and are
 * divided by hairlines — the reply items and post cards inside are the only surfaces.
 */
function BlogBottom() {
  const {
    blog: { tags, urlSlug },
    lng,
  } = useBlogDetail();

  return (
    <>
      <Suspense fallback={<Skeleton className="mx-auto my-10 h-11 w-11 rounded-full" />}>
        <LikeButton />
      </Suspense>

      <footer className="w-full">
        {tags.length > 0 ? (
          <section className="flex flex-wrap gap-2 border-t border-basic-3 py-6">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tagIn=${tag}`}
                className="rounded-sm transition-opacity duration-150 hover:opacity-80 focus-ring"
              >
                <Tag tag={tag} />
              </Link>
            ))}
          </section>
        ) : null}

        <section className="border-t border-basic-3 py-8">
          <Suspense fallback={<Skeleton className="h-48" />}>
            <BlogReplyList urlSlug={urlSlug} lng={lng} />
          </Suspense>
        </section>

        <section className="border-t border-basic-3 py-8">
          <Suspense fallback={<Skeleton className="h-48" />}>
            <RecommendedPosts urlSlug={urlSlug} lng={lng} />
          </Suspense>
        </section>
      </footer>
    </>
  );
}

export default BlogBottom;
