import React, { Suspense } from 'react';
import Link from '@components/basic/Link';
import Tag from '@components/basic/Tag';
import { useBlogDetail } from 'components/blog/BlogDetail/BlogDetailProvider';
import Skeleton from '@components/basic/Skeleton';

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

      <footer className="w-full mt-8 border-t border-solid border-basic-5">
        <div className="flex flex-wrap gap-2 mt-4 mb-8">
          {tags.map((tag) => (
            <Link key={tag} href={`/blog?tagIn=${tag}`}>
              <Tag tag={tag} />
            </Link>
          ))}
        </div>

        <Suspense fallback={<Skeleton className="h-[200px]" />}>
          <BlogReplyList urlSlug={urlSlug} lng={lng} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-[200px]" />}>
          <RecommendedPosts urlSlug={urlSlug} lng={lng} />
        </Suspense>
      </footer>
    </>
  );
}

export default BlogBottom;
