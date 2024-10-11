import React from 'react';
import Link from 'next/link';
import { useTranslation } from '~/app/i18n';
import { cookies } from 'next/headers';
import { getLanguageFromCookies } from '@utils/localeUtil';

export default async function NotFound() {
  const cookieStore = cookies();
  const { t } = await useTranslation(getLanguageFromCookies(cookieStore), 'notFound');

  return (
    <section className="h-screen bg-white dark:bg-zinc-900">
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-sm text-center">
          <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-point-1 dark:text-point-4">
            404
          </h1>
          <p className="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white">
            {t('subTitle')}
          </p>
          <p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400 whitespace-pre-line">
            {t('description')}
          </p>
          <Link href={'/'}>
            <button className="inline-flex text-white bg-point-1 hover:bg-point-2 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-900 my-4">
              {t('goToHome')}
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
