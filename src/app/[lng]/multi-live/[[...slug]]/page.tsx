import React from 'react';
import { cls } from '@utils/classNameUtils';
import { useTranslation } from '~/app/i18n';
import { platformMapper, getLiveUrl } from '@utils/liveTypes';
import { GenerateMetadata, translationsMetadata } from '@libs/server/customMetadata';
import { MultiLiveProps } from '~/app/[lng]/multi-live/[[...slug]]/layout';

export const generateMetadata: GenerateMetadata = async ({ params }) => {
  return translationsMetadata({ params, ns: 'multi-live' });
};

export default async function MultiLivePage(props: MultiLiveProps) {
  const params = await props.params;

  const { lng, slug } = params;

  const { t } = await useTranslation(lng, 'multi-live');

  if (!slug)
    return (
      <div className={'w-screen h-screen flex flex-col justify-center items-center t-basic-1'}>
        <h1 className="t-t-1 t-basic-1 mb-4">{t('title')}</h1>
        <div className={'whitespace-pre-wrap t-d-1'}>{t('description')}</div>
      </div>
    );

  const liveUrls = slug
    .map((item) => {
      const [shortType, id] = decodeURIComponent(item).split(':');
      return platformMapper[shortType] ? getLiveUrl(platformMapper[shortType], id) : '';
    })
    .filter(Boolean)
    .slice(0, 4);

  return (
    <div className="w-screen min-h-screen flex flex-wrap justify-center items-center content-center">
      {liveUrls.map((url, index) => (
        <iframe
          key={index}
          className={cls(
            'border-0 overflow-hidden',
            liveUrls.length === 1 ? 'w-screen h-screen' : 'aspect-video w-full lg:w-1/2',
            liveUrls.length >= 3 ? 'max-w-screen-lg max-h-[50vh]' : '',
          )}
          src={url}
          title={`Live ${index + 1}`}
          scrolling={'no'}
          allowFullScreen
        ></iframe>
      ))}
    </div>
  );
}
