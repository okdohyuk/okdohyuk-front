import React from 'react';
import { Html, Main, NextScript, Head } from 'next/document';
import Script from 'next/script';

function Document() {
  return (
    <Html lang="ko">
      <Head>
        <meta charSet="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />

        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
        />
        <meta name="description" content="Description" />
        <meta name="keywords" content="Keywords" />

        <link rel="shortcut icon" href="/favicon.ico" />

        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="57x57" href="/icons/app/apple-icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/icons/app/apple-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/icons/app/apple-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/icons/app/apple-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/icons/app/apple-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/app/apple-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/app/apple-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/app/apple-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/app/apple-icon-180x180.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/icons/app/android-icon-192x192.png"
        />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/icons/favicon/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon/favicon-16x16.png" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="/icons/app/ms-icon-144x144.png" />
        <meta name="theme-color" content="#ffffff" />

        <title>developer okdohyuk</title>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

export default Document;
