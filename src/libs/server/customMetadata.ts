import { Metadata } from 'next';
import { getTranslations } from '~/app/i18n';
import { Language } from '~/app/i18n/settings';
import { FlatNamespace } from 'i18next';
import { OpenGraphType } from 'next/dist/lib/metadata/types/opengraph-types';
import * as process from 'node:process';

type MetaDataProps = {
  title: string;
  description: string;
  keywords?: string | string[];
  image?: string;
  type?: OpenGraphType;
  language: Language;
};

type CustomMetadata = (props: MetaDataProps) => Metadata;

type GenerateMetadata = ({ params }: { params: Promise<{ lng: string }> }) => Promise<Metadata>;

type TranslationsMetadataProps = {
  params: Promise<{ lng: string }>;
  ns: FlatNamespace;
  type?: OpenGraphType;
  image?: string;
};

type TranslationsMetadata = ({
  params,
  ns,
  type,
  image,
}: TranslationsMetadataProps) => Promise<Metadata>;

const metadata: CustomMetadata = ({
  title,
  description,
  keywords,
  image,
  type = 'website',
  language,
}) => {
  return {
    manifest: '/manifest.json',
    metadataBase: new URL(`${process.env.NEXT_PUBLIC_URL}`),
    title,
    description,
    keywords,
    image: image || '/opengraph_image.png',
    openGraph: {
      type,
      title,
      description,
      language,
      images: image || '/opengraph_image.png',
    },
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
  });
};

export { translationsMetadata, metadata };

export type { GenerateMetadata };
