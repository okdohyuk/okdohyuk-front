import React from 'react';
import Link from 'next/link';
import { getTranslations } from '~/app/i18n';
import { cookies } from 'next/headers';
import { getLanguageFromCookies } from '@utils/localeUtil';

export default async function NotFound() {
  const cookieStore = await cookies();
  const { t } = await getTranslations(getLanguageFromCookies(cookieStore), 'notFound');

  return (
    <section className="h-screen bg-basic-0">
      <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
        <div className="mx-auto max-w-screen-sm text-center">
          <h1 className="mb-4 text-7xl font-semibold lg:text-9xl text-point-fg">404</h1>
          <p className="mb-4 text-3xl font-semibold text-fg-1 md:text-4xl">{t('subTitle')}</p>
          <p className="mb-4 text-lg font-light text-fg-5 whitespace-pre-line">
            {t('description')}
          </p>
          <Link
            href="/"
            className="my-4 inline-flex rounded-lg bg-point-2 px-5 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-point-1 focus-ring"
          >
            {t('goToHome')}
          </Link>
        </div>
      </div>
    </section>
  );
}
