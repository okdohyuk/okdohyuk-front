import React from 'react';
import { Metadata } from 'next';
import privacyData from '~/assets/datas/privacyData.json';
import { LanguageParams } from '~/app/[lng]/layout';

export const metadata: Metadata = {
  title: privacyData.title,
};

export default async function PrivacyPage({ params }: LanguageParams) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { lng } = await params;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 lg:py-24">
      <h1 className="t-t-1 mb-10 text-center t-basic-1">{privacyData.title}</h1>
      <div className="flex flex-col gap-4">
        {privacyData.content.map((block, index) => {
          if (block.tag === 'h2') {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <h2 key={index} className="t-t-2 mt-8 mb-2 t-basic-1">
                {block.text}
              </h2>
            );
          }
          if (block.tag === 'p') {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <p key={index} className="t-d-2 t-basic-2 whitespace-pre-line">
                {block.text}
              </p>
            );
          }
          if (block.tag === 'ol' || block.tag === 'ul') {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <ul key={index} className="list-disc pl-5 flex flex-col gap-1 t-d-2 t-basic-2">
                {block.items?.map((item, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <li key={i} className="whitespace-pre-line">
                    {item}
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
