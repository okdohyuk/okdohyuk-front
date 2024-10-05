import { Metadata } from 'next';
import { getTranslations } from '~/app/i18n';
import { Language } from '~/app/i18n/settings';
import { FlatNamespace } from 'i18next';
import { OpenGraphType } from 'next/dist/lib/metadata/types/opengraph-types';
import * as process from 'node:process';

export type GenerateMetadata = ({ params }: { params: { lng: Language } }) => Promise<Metadata>;

type CustomMetadata = ({
  params: { lng },
  ns,
  type,
  image,
}: {
  params: { lng: Language };
  type?: OpenGraphType;
  ns: FlatNamespace;
  image?: string;
}) => Promise<Metadata>;

const metadata: CustomMetadata = async ({
  params: { lng: language },
  ns: namespace,
  type = 'website',
  image,
}) => {
  const { t } = await getTranslations(language, namespace);
  const keywords = t('openGraph.keywords', { returnObjects: true }) as string | string[];
  return {
    metadataBase: new URL(`${process.env.NEXT_PUBLIC_URL}`),
    title: t('openGraph.title'),
    description: t('openGraph.description'),
    keywords: keywords instanceof Array ? keywords : '',
    image: image ? image : '/opengraph_image.png',
    openGraph: {
      type: type,
      title: t('openGraph.title'),
      description: t('openGraph.description'),
      language: language,
      images: image ? image : '/opengraph_image.png',
    },
  };
};

export default metadata;
