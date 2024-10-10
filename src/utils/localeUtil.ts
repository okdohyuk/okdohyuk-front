import { fallbackLng, Language, languages } from '~/app/i18n/settings';
import { RequestCookies, ResponseCookies } from 'next/dist/compiled/@edge-runtime/cookies';

export function stringToLanguage(value: string): Language | null {
  return languages.some((lng) => value === lng) ? (value as Language) : null;
}

export function getLanguageFromCookies(
  cookieStore: Omit<RequestCookies, 'set' | 'clear' | 'delete'> &
    Pick<ResponseCookies, 'set' | 'delete'>,
): Language {
  const i18nextCookie = cookieStore.get('i18next');
  return i18nextCookie && stringToLanguage(i18nextCookie.value) !== null
    ? (i18nextCookie.value as Language)
    : fallbackLng;
}
