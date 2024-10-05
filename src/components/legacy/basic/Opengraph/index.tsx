import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

type OpengraphProps = {
  title: string;
  ogTitle: string;
  description: string;
  keywords?: string[];

  isMainPage?: boolean;
  image?: string;
  contentType?: 'website' | 'article';
  isAds?: boolean;
};

type OpengraphComponent = (props: OpengraphProps) => JSX.Element;

/**
 * page route
 * OpengraphComponent is responsible for handling the Open Graph and Twitter metadata for the web application.
 * It dynamically sets the metadata tags for the webpage based on the provided properties.
 *
 * @param {Object} props - The properties object.
 * @param {string} props.title - The title of the page.
 * @param {string} [props.ogTitle] - The Open Graph title of the page.
 * @param {string} props.description - The description of the page.
 * @param {boolean} [props.isMainPage=false] - Flag indicating if the page is the main page.
 * @param {string} [props.image] - The URL of the image to be used in the Open Graph and Twitter metadata.
 * @param {Array<string>} [props.keywords] - The keywords for the page.
 * @param {string} [props.contentType='website'] - The content type of the page for Open Graph metadata.
 *
 * @returns {JSX.Element} Returns a Head component containing meta tags for SEO and social media sharing.
 */
const Opengraph: OpengraphComponent = ({
  title,
  ogTitle,
  description,
  isMainPage = false,
  image,
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
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image ? image : '/opengraph_image.png'} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta property="twitter:domain" content="okdohyuk.dev" />
      <meta property="twitter:url" content={URL + router.asPath} />
      <meta name="twitter:title" content={isMainPage ? ogTitle : ogTitle + tempWithMe} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image ? image : '/opengraph_image.png'} />

      <meta
        name="viewport"
        content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
      />
    </Head>
  );
};

export default Opengraph;
