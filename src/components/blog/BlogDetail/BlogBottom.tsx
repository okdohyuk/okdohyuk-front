import React from 'react';
import Link from '@components/basic/Link';
import Tag from '@components/basic/Tag';
import { useBlogDetail } from 'components/blog/BlogDetail/BlogDetailProvider';

function BlogBottom() {
  const {
    blog: { tags },
  } = useBlogDetail();

  return (
    <footer className="w-full h-48 border-t border-solid border-basic-5">
      <div className="flex flex-wrap gap-2 mt-4">
        {tags.map((tag) => (
          <Link key={tag} href={`/blog?tagIn=${tag}`}>
            <Tag tag={tag} />
          </Link>
        ))}
      </div>
      <div className="font-black text-5xl t-basic-1 text-center mt-8">{'<footer />'}</div>
    </footer>
  );
}

export default BlogBottom;
