import React from 'react';
import { Metadata } from 'next';
import privacyData from '~/assets/datas/privacyData.json';
import { LanguageParams } from '~/app/[lng]/layout';
import { H1, H2, Text } from '@components/basic/Text';

export const metadata: Metadata = {
  title: privacyData.title,
};

export default async function PrivacyPage({ params }: LanguageParams) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { lng } = await params;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:py-24">
      <H1 className="mb-10 text-center t-basic-1">{privacyData.title}</H1>
      <div className="flex flex-col gap-4">
        {privacyData.content.map((block, index) => {
          if (block.tag === 'h2') {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <H2 key={index} className="mb-2 mt-8 t-basic-1">
                {block.text}
              </H2>
            );
          }
          if (block.tag === 'p') {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <Text asChild key={index} variant="d2" className="t-basic-2 whitespace-pre-line">
                <p>{block.text}</p>
              </Text>
            );
          }
          if (block.tag === 'ol' || block.tag === 'ul') {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <ul key={index} className="flex flex-col gap-1 pl-5 list-disc">
                {block.items?.map((item, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <li key={i} className="whitespace-pre-line">
                    <Text variant="d2" className="t-basic-2">
                      {item}
                    </Text>
                  </li>
                ))}
              </ul>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
