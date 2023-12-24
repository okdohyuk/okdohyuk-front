import React from 'react';
import Document, { Html, Main, NextScript, Head } from 'next/document';
import Script from 'next/script';
import i18nextConfig from '../../next-i18next.config';

class MyDocument extends Document {
  render() {
    const currentLocale = this.props.__NEXT_DATA__.locale || i18nextConfig.i18n.defaultLocale;

    return (
      <Html lang={currentLocale}>
        <Head>
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="mobile-web-app-capable" content="yes" />

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
          <link
            href="/splashscreens/iphone5_splash.png"
            media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
            rel="apple-touch-startup-image"
          />
          <link
            href="/splashscreens/iphone6_splash.png"
            media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
            rel="apple-touch-startup-image"
          />
          <link
            href="/splashscreens/iphoneplus_splash.png"
            media="(device-width: 621px) and (device-height: 1104px) and (-webkit-device-pixel-ratio: 3)"
            rel="apple-touch-startup-image"
          />
          <link
            href="/splashscreens/iphonex_splash.png"
            media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
            rel="apple-touch-startup-image"
          />
          <link
            href="/splashscreens/iphonexr_splash.png"
            media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)"
            rel="apple-touch-startup-image"
          />
          <link
            href="/splashscreens/iphonexsmax_splash.png"
            media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)"
            rel="apple-touch-startup-image"
          />
          <link
            href="/splashscreens/ipad_splash.png"
            media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)"
            rel="apple-touch-startup-image"
          />
          <link
            href="/splashscreens/ipadpro1_splash.png"
            media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)"
            rel="apple-touch-startup-image"
          />
          <link
            href="/splashscreens/ipadpro3_splash.png"
            media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)"
            rel="apple-touch-startup-image"
          />
          <link
            href="/splashscreens/ipadpro2_splash.png"
            media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)"
            rel="apple-touch-startup-image"
          />
          <link
            rel="stylesheet"
            as="style"
            href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.5/dist/web/static/pretendard.css"
          />

          <Script
            src={
              'https://www.googletagmanager.com/gtag/js?id=' +
              `${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_TRACKING_ID}`
            }
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){window.dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_TRACKING_ID}', {page_path: window.location.pathname});
        `}
          </Script>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
