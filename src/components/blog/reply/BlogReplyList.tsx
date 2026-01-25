import React, { Fragment, useEffect } from 'react';
import { useGetBlogReplies } from '@queries/useReplyQueries';
import { useInView } from 'react-intersection-observer';
import { Language } from '~/app/i18n/settings';
import { useTranslation } from '~/app/i18n/client';
import BlogReplyItem from './BlogReplyItem';
import BlogReplyForm from './BlogReplyForm';

interface BlogReplyListProps {
  urlSlug: string;
  lng: Language;
}

function BlogReplyList({ urlSlug, lng }: BlogReplyListProps) {
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useGetBlogReplies(urlSlug);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const { t } = useTranslation(lng, 'common');

  return (
    <div className="mt-8 border-t pt-8 border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-bold t-basic-1 mb-4">{t('reply.listTitle')}</h3>

      <BlogReplyForm urlSlug={urlSlug} onSuccess={() => refetch()} lng={lng} />

      <div className="mt-8 space-y-4">
        {data?.pages.map((group, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Fragment key={i}>
            {group.map((reply) => (
              <BlogReplyItem
                key={reply.id}
                reply={reply}
                urlSlug={urlSlug}
                onRefresh={() => refetch()}
                lng={lng}
              />
            ))}
          </Fragment>
        ))}
      </div>

      <div ref={ref} className="h-4">
        {isFetchingNextPage && <div className="text-center text-gray-500">Loading more...</div>}
      </div>
    </div>
  );
}

export default BlogReplyList;
