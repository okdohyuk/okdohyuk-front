'use client';

import { useEffect, useState } from 'react';
import i18next, { FlatNamespace, KeyPrefix } from 'i18next';
import {
  FallbackNs,
  initReactI18next,
  useTranslation as useTranslationOrg,
  UseTranslationOptions,
  UseTranslationResponse,
} from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { getOptions, Language, languages } from './settings';
import { getLanguageCookie, setLanguageCookie } from './cookie';

const runsOnServerSide = typeof window === 'undefined';

//
i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`../../assets/locales/${language}/${namespace}.json`),
    ),
  )
  .init({
    ...getOptions(),
    lng: undefined, // let detect the language on client side
    detection: {
      order: ['path', 'htmlTag', 'cookie', 'navigator'],
    },
    preload: runsOnServerSide ? languages : [],
  });

export function useTranslation<
  Ns extends FlatNamespace,
  KPrefix extends KeyPrefix<FallbackNs<Ns>> = undefined,
>(
  lng: Language,
  ns?: Ns,
  options?: UseTranslationOptions<KPrefix>,
): UseTranslationResponse<FallbackNs<Ns>, KPrefix> {
  const ret = useTranslationOrg(ns, options);
  const { i18n } = ret;
  if (runsOnServerSide && lng && i18n.resolvedLanguage !== lng) {
    i18n.changeLanguage(lng);
  } else {
    const [activeLng, setActiveLng] = useState(i18n.resolvedLanguage);

    useEffect(() => {
      if (activeLng === i18n.resolvedLanguage) return;
      setActiveLng(i18n.resolvedLanguage);
    }, [activeLng, i18n.resolvedLanguage]);

    useEffect(() => {
      if (!lng || i18n.resolvedLanguage === lng) return;
      i18n.changeLanguage(lng);
    }, [lng, i18n]);

    useEffect(() => {
      if (!lng || getLanguageCookie() === lng) return;
      setLanguageCookie(lng);
    }, [lng]);
  }
  return ret;
}

export default i18next;
