import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

type OpengraphProps = {
  isMainPage?: boolean;
  title: string;
  ogTitle: string;
  description: string;
  image?: string;
  isAds?: boolean;
  keywords?: string[];
  contentType?: 'website' | 'article';
};

type OpengraphComponent = (props: OpengraphProps) => JSX.Element;

const Opengraph: OpengraphComponent = ({
  title,
  ogTitle,
  description,
  isMainPage = false,
  image,
  isAds,
  keywords,
  contentType = 'website',
}) => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const withMe = t('openGraph.withMe');
  const tempWithMe = withMe === 'openGraph.withMe' ? ' - 개발자 유도혁' : withMe;
  const URL = 'https://okdohyuk.dev';

  return (
    <Head>
      <title>{isMainPage ? title : title + withMe}</title>
      <meta name="description" content={isMainPage ? description : description + tempWithMe} />
      {keywords && <meta name="keywords" content={keywords.join(',')} />}

      <meta property="og:url" content={URL + router.asPath} />
      <meta property="og:type" content={contentType} />
      <meta property="og:title" content={isMainPage ? ogTitle : ogTitle + tempWithMe} />
      <meta
        property="og:description"
        content={isMainPage ? description : description + tempWithMe}
      />
      <meta property="og:image" content={image ? image : '/opengraph_image.png'} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta property="twitter:domain" content="okdohyuk.dev" />
      <meta property="twitter:url" content={URL + router.asPath} />
      <meta name="twitter:title" content={isMainPage ? ogTitle : ogTitle + tempWithMe} />
      <meta
        name="twitter:description"
        content={isMainPage ? description : description + tempWithMe}
      />
      <meta name="twitter:image" content={image ? image : '/opengraph_image.png'} />

      <meta
        name="viewport"
        content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
      />

      {isAds && (
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID}`}
          crossOrigin="anonymous"
        ></script>
      )}
    </Head>
  );
};

export default Opengraph;
