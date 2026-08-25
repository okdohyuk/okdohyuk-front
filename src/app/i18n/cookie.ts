import Cookies from 'js-cookie';
import { cookieName, Language } from './settings';

export function getLanguageCookie(): string | undefined {
  if (typeof document === 'undefined') return undefined;
  return Cookies.get(cookieName);
}

export function setLanguageCookie(language: Language): void {
  if (typeof document === 'undefined') return;
  Cookies.set(cookieName, language, { path: '/' });
}
