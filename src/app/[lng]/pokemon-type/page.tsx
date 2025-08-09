import React from 'react';
import { LanguageParams } from '~/app/[lng]/layout';
import TypeCalculator from '@components/pokemon/TypeCalculator';
import { Metadata } from 'next';

export async function generateMetadata({ params }: LanguageParams): Promise<Metadata> {
  const { lng } = await params;
  const title = lng === 'ko' ? '포켓몬 타입 상성 계산기' : 'Pokémon Type Calculator';
  const description =
    lng === 'ko'
      ? '최신 포켓몬 타입 상성표로 약점을 확인하세요.'
      : 'Check weaknesses with the latest Pokémon type chart.';
  const url = `${process.env.NEXT_PUBLIC_URL}/${lng}/pokemon-type`;
  return {
    metadataBase: new URL(`${process.env.NEXT_PUBLIC_URL}`),
    title,
    description,
    keywords: ['pokemon', 'type chart', 'calculator'],
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: 'Pokémon Type Calculator',
      locale: lng,
      images: [
        {
          url: '/opengraph_image.png',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
  };
}

export default async function Page({ params }: LanguageParams) {
  const { lng } = await params;
  return <TypeCalculator lng={lng} />;
}
