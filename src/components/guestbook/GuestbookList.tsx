'use client';

import React, { Fragment, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useGetGuestbooks } from '@queries/useGuestbookQueries';
import { Language } from '~/app/i18n/settings';
import { useTranslation } from '~/app/i18n/client';
import GuestbookForm from './GuestbookForm';
import GuestbookItem from './GuestbookItem';

interface GuestbookListProps {
  lng: Language;
}

export default function GuestbookList({ lng }: GuestbookListProps) {
  const { t } = useTranslation(lng, 'guestbook');
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } =
    useGetGuestbooks();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const isEmpty = !isLoading && !!data && data.pages.every((group) => group.length === 0);

  return (
    <div className="w-full space-y-6">
      <GuestbookForm lng={lng} onSuccess={() => refetch()} />

      {isLoading && <p className="py-8 text-center text-sm text-fg-5">{t('list.loading')}</p>}

      {isEmpty && <p className="py-8 text-center text-sm text-fg-5">{t('list.empty')}</p>}

      <div className="space-y-4">
        {data?.pages.map((group, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Fragment key={i}>
            {group.map((guestbook) => (
              <GuestbookItem
                key={guestbook.id}
                guestbook={guestbook}
                onRefresh={() => refetch()}
                lng={lng}
              />
            ))}
          </Fragment>
        ))}
      </div>

      <div ref={ref} className="h-4">
        {isFetchingNextPage && (
          <div className="mx-auto h-4 w-4 animate-spin rounded-full border-2 border-point-2 border-t-transparent" />
        )}
      </div>
    </div>
  );
}
