import React from 'react';
import { getTranslations } from '~/app/i18n';
import { Language } from '~/app/i18n/settings';
import SolveUnitsClient from './SolveUnitsClient';

type SolveSubjectParams = {
  params: Promise<{ lng: string; slug: string }>;
};

export default async function SolveSubjectPage({ params }: SolveSubjectParams) {
  const { lng, slug } = await params;
  const language = lng as Language;
  // 헤더(과목명)는 클라이언트가 useSubjectDetail 응답으로 채운다(과목 제목이 한국어 DB 원문).
  await getTranslations(language, 'solve');

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-2 pb-24 pt-3 sm:px-3 md:px-4">
      <SolveUnitsClient lng={language} slug={slug} />
    </div>
  );
}
