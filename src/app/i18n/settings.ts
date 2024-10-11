export const fallbackLng = 'ko';
export const languages = [fallbackLng, 'en'] as const;

export type Language = (typeof languages)[number];

export const defaultNS = 'type';
export const cookieName = 'i18next';

export function getOptions(lng = fallbackLng, ns: string | string[] = defaultNS) {
  return {
    // debug: true,
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
  };
}
