import React from 'react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { getTranslations } from '~/app/i18n';
import { cookieName, fallbackLng, languages, Language } from '~/app/i18n/settings';

// /l/* 라우트는 i18n 외부이므로, 쿠키에 저장된 i18next locale 을 읽어 번역을 적용한다.
async function resolveLanguage(): Promise<Language> {
  const cookieStore = await cookies();
  const stored = cookieStore.get(cookieName)?.value;
  if (stored && (languages as readonly string[]).includes(stored)) {
    return stored as Language;
  }
  return fallbackLng;
}

export default async function ShortLinkNotFound() {
  const language = await resolveLanguage();
  const { t } = await getTranslations(language, 'shortener');

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 py-12 text-center">
      <p className="text-sm font-semibold tracking-wide text-fg-5">{t('notFound.status')}</p>
      <h1 className="text-2xl font-extrabold text-fg-1">{t('notFound.title')}</h1>
      <p className="whitespace-pre-line text-sm leading-relaxed text-fg-4">
        {t('notFound.description')}
      </p>
      <Link
        href={`/${language}/shortener`}
        className="mt-2 inline-flex h-10 items-center rounded-md bg-point-2 px-4 text-sm font-semibold text-white transition hover:bg-point-1"
      >
        {t('notFound.action')}
      </Link>
    </main>
  );
}
