import React from 'react';
import Link from '@components/basic/Link';
import Tag from '@components/basic/Tag';
import { useBlogDetail } from 'components/blog/BlogDetail/BlogDetailProvider';

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
      <LikeButton />

      <footer className="w-full mt-8 border-t border-solid border-basic-5">
        <div className="flex flex-wrap gap-2 mt-4 mb-8">
          {tags.map((tag) => (
            <Link key={tag} href={`/blog?tagIn=${tag}`}>
              <Tag tag={tag} />
            </Link>
          ))}
        </div>

        <BlogReplyList urlSlug={urlSlug} lng={lng} />
        <RecommendedPosts urlSlug={urlSlug} lng={lng} />
      </footer>
    </>
  );
}

export default BlogBottom;
