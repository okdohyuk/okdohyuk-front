import { Metadata } from 'next';
import { getTranslations } from '~/app/i18n';
import { fallbackLng, Language } from '~/app/i18n/settings';
import { FlatNamespace } from 'i18next';
import { OpenGraphType } from 'next/dist/lib/metadata/types/opengraph-types';
import { SITE_URL } from '@libs/shared/agentDiscovery';

type MetaDataProps = {
  title: string;
  description: string;
  keywords?: string | string[];
  image?: string;
  type?: OpenGraphType;
  language: Language;
  pathname?: string;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  tags?: string[];
  section?: string;
};

type CustomMetadata = (props: MetaDataProps) => Metadata;

type GenerateMetadata = ({ params }: { params: Promise<{ lng: string }> }) => Promise<Metadata>;

type TranslationsMetadataProps = {
  params: Promise<{ lng: string }>;
  ns: FlatNamespace;
  type?: OpenGraphType;
  image?: string;
  pathname?: string;
};

type TranslationsMetadata = ({
  params,
  ns,
  type,
  image,
  pathname,
}: TranslationsMetadataProps) => Promise<Metadata>;

function normalizeMetadataPathname(pathname?: string): string | null {
  if (!pathname) {
    return null;
  }

  const trimmed = pathname.trim();
  if (!trimmed || trimmed === '/') {
    return '';
  }

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeadingSlash.replace(/\/+$/, '');
}

const metadata: CustomMetadata = ({
  title,
  description,
  keywords,
  image,
  type = 'website',
  language,
  pathname,
  publishedTime,
  modifiedTime,
  authors,
  tags,
  section,
}) => {
  const cleanPath = normalizeMetadataPathname(pathname);
  const canonicalUrl = cleanPath !== null ? `${SITE_URL}/${language}${cleanPath}` : undefined;

  const alternates: Metadata['alternates'] =
    cleanPath !== null
      ? {
          canonical: canonicalUrl,
          languages: {
            ko: `${SITE_URL}/ko${cleanPath}`,
            en: `${SITE_URL}/en${cleanPath}`,
            ja: `${SITE_URL}/ja${cleanPath}`,
            zh: `${SITE_URL}/zh${cleanPath}`,
            'x-default': `${SITE_URL}/${fallbackLng}${cleanPath}`,
          },
          types: {
            'application/rss+xml': `${SITE_URL}/rss.xml`,
          },
        }
      : {
          types: {
            'application/rss+xml': `${SITE_URL}/rss.xml`,
          },
        };

  const baseOpenGraph = {
    title,
    description,
    locale: language,
    ...(canonicalUrl ? { url: canonicalUrl } : {}),
    images: image || '/opengraph_image.png',
  };

  const openGraph: Metadata['openGraph'] =
    type === 'article'
      ? {
          ...baseOpenGraph,
          type: 'article',
          ...(publishedTime ? { publishedTime } : {}),
          ...(modifiedTime ? { modifiedTime } : {}),
          ...(authors && authors.length > 0 ? { authors } : {}),
          ...(tags && tags.length > 0 ? { tags } : {}),
          ...(section ? { section } : {}),
        }
      : {
          ...baseOpenGraph,
          type,
        };

  return {
    manifest: '/manifest.json',
    metadataBase: new URL(SITE_URL),
    title,
    description,
    keywords,
    alternates,
    openGraph,
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: [{ url: '/icons/app/apple-icon-180x180.png', sizes: '180x180', type: 'image/png' }],
      other: [
        {
          rel: 'apple-touch-icon-precomposed',
          url: '/icons/app/apple-icon-precomposed.png',
        },
      ],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'okdohyuk',
      startupImage: [
        {
          url: '/splashscreens/ipad_splash.png',
          media:
            '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)',
        },
        {
          url: '/splashscreens/ipadpro1_splash.png',
          media:
            '(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)',
        },
        {
          url: '/splashscreens/ipadpro2_splash.png',
          media:
            '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)',
        },
        {
          url: '/splashscreens/ipadpro3_splash.png',
          media:
            '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)',
        },
        {
          url: '/splashscreens/iphone5_splash.png',
          media:
            '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
        },
        {
          url: '/splashscreens/iphone6_splash.png',
          media:
            '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
        },
        {
          url: '/splashscreens/iphoneplus_splash.png',
          media:
            '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)',
        },
        {
          url: '/splashscreens/iphonex_splash.png',
          media:
            '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
        },
        {
          url: '/splashscreens/iphonexr_splash.png',
          media:
            '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)',
        },
        {
          url: '/splashscreens/iphonexsmax_splash.png',
          media:
            '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)',
        },
      ],
    },
  };
};

const translationsMetadata: TranslationsMetadata = async ({
  params,
  ns: namespace,
  type = 'website',
  image,
  pathname,
}) => {
  const { lng } = await params;
  const language = lng as Language;
  const { t } = await getTranslations(language, namespace);
  const keywords = t('openGraph.keywords', { returnObjects: true }) as string | string[];

  return metadata({
    title: t('openGraph.title'),
    description: t('openGraph.description'),
    keywords: keywords instanceof Array ? keywords : '',
    image,
    type,
    language,
    pathname,
  });
};

export { translationsMetadata, metadata };

export type { GenerateMetadata, MetaDataProps };
