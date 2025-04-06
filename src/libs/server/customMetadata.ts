import { Metadata } from 'next';
import { getTranslations } from '~/app/i18n';
import { Language } from '~/app/i18n/settings';
import { FlatNamespace } from 'i18next';
import { OpenGraphType } from 'next/dist/lib/metadata/types/opengraph-types';
import * as process from 'node:process';
import { LanguageParams } from '~/app/[lng]/layout';

type MetaDataProps = {
  title: string;
  description: string;
  keywords?: string | string[];
  image?: string;
  type?: OpenGraphType;
  language: Language;
};

type CustomMetadata = (props: MetaDataProps) => Metadata;

type GenerateMetadata = ({ params }: LanguageParams) => Promise<Metadata>;

type TranslationsMetadataProps = {
  params: { lng: Language };
  ns: FlatNamespace;
  type?: OpenGraphType;
  image?: string;
};

type TranslationsMetadata = ({
  params: { lng },
  ns,
  type,
  image,
}: TranslationsMetadataProps) => Promise<Metadata>;

const translationsMetadata: TranslationsMetadata = async ({
  params,
  ns: namespace,
  type = 'website',
  image,
}) => {
  const { lng: language } = await params;
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
    image: image ? image : '/opengraph_image.png',
    openGraph: {
      type,
      title,
      description,
      language,
      images: image ? image : '/opengraph_image.png',
    },
  };
};

export { translationsMetadata, metadata };

export type { GenerateMetadata };
