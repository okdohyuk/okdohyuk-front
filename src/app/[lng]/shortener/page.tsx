import React from 'react';
import Link from '@components/basic/Link';
import { ListChecks, Sparkles } from 'lucide-react';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import ServiceInfoNotice from '@components/complex/Service/ServiceInfoNotice';
import { LanguageParams } from '~/app/[lng]/layout';
import ShortenerForm from './ShortenerForm';

export default async function ShortenerPage({ params }: LanguageParams) {
  const { lng } = await params;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-2 pb-24 pt-3 sm:px-3 md:px-4">
      <ServicePageHeader
        title="URL 단축기"
        description="긴 링크를 짧고 공유하기 쉬운 URL 로 만들어 보세요."
        badge="Shortener"
      />

      <ServiceInfoNotice icon={<Sparkles className="h-5 w-5" />}>
        로그인하지 않아도 단축 URL 을 만들 수 있어요. 로그인 시 클릭 수 통계와 관리 기능을 이용할 수
        있습니다.
      </ServiceInfoNotice>

      <ShortenerForm />

      <div className="flex justify-end">
        <Link
          href={`/${lng}/shortener/me`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-fg-4 hover:text-point-fg"
        >
          <ListChecks className="h-4 w-4" />내 단축 URL 관리
        </Link>
      </div>
    </div>
  );
}
