import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

type Opengraph = {
  isMainPage?: boolean;
  title: string;
  ogTitle: string;
  description: string;
};

function Opengraph({ title, ogTitle, description, isMainPage = false }: Opengraph) {
  const router = useRouter();
  const withMe = ' with okdohyuk';
  const URL = 'https://okdohyuk.dev';

  return (
    <Head>
      <title>{isMainPage ? title : title + withMe}</title>
      <meta name="description" content={isMainPage ? description : description + withMe} />

      <meta property="og:url" content={URL + router.asPath} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={isMainPage ? ogTitle : ogTitle + withMe} />
      <meta property="og:description" content={isMainPage ? description : description + withMe} />
      <meta property="og:image" content="/opengraph_image.png" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta property="twitter:domain" content="okdohyuk.dev" />
      <meta property="twitter:url" content={URL + router.asPath} />
      <meta name="twitter:title" content={isMainPage ? ogTitle : ogTitle + withMe} />
      <meta name="twitter:description" content={isMainPage ? description : description + withMe} />
      <meta name="twitter:image" content="/opengraph_image.png" />
    </Head>
  );
}

export default Opengraph;
