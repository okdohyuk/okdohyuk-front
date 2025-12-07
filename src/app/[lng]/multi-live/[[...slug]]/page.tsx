import React from 'react';
import Link from '@components/basic/Link';
import { cls } from '@utils/classNameUtils';
import { getLiveUrl, platformMapper } from '@utils/liveTypes';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { getTranslations } from '~/app/i18n';
import { MultiLiveProps } from '~/app/[lng]/multi-live/[[...slug]]/layout';

export const generateMetadata: GenerateMetadata = async ({ params }) => {
  return translationsMetadata({ params, ns: 'multi-live' });
};

export default async function MultiLivePage({ params }: MultiLiveProps) {
  const { lng, slug } = await params;

  const { t } = await getTranslations(lng, 'multi-live');

  if (!slug) {
    return (
      <div className="w-screen h-screen flex flex-col justify-center items-center t-basic-1">
        <h1 className="t-t-1 t-basic-1 mb-4">{t('title')}</h1>
        <div className="whitespace-pre-wrap t-d-1">{t('description')}</div>
        <Link href="/menu" className="mt-8 button px-4">
          {t('go-menu')}
        </Link>
      </div>
    );
  }

  const liveUrls = slug
    .map((item) => {
      const [shortType, id] = decodeURIComponent(item).split(':');
      return platformMapper[shortType] ? getLiveUrl(platformMapper[shortType], id) : '';
    })
    .filter(Boolean)
    .slice(0, 4);

  return (
    <div className="w-screen min-h-screen flex flex-wrap justify-center items-center content-center">
      {liveUrls.map((url) => (
        <iframe
          key={url}
          className={cls(
            'border-0 overflow-hidden',
            liveUrls.length === 1 ? 'w-screen h-screen' : 'aspect-video w-full lg:w-1/2',
            liveUrls.length >= 3 ? 'max-w-screen-lg max-h-[50vh]' : '',
          )}
          src={url}
          title={`Live ${url}`}
          scrolling="no"
          allowFullScreen
        />
      ))}
    </div>
  );
}
