import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { getTranslations } from '~/app/i18n';
import { translationsMetadata } from '@libs/server/customMetadata';
import { Language } from '~/app/i18n/settings';
import ServicePageHeader from '@components/complex/Service/ServicePageHeader';
import { getServiceCategoryBadge } from '@assets/datas/serviceCategories';
import SharedPokemonTeamClient from './components/SharedPokemonTeamClient';

type ShareParams = { params: Promise<{ lng: string; shareId: string }> };

// 공유 단건은 동적(shareId)이므로 정적 사전 생성 대상에서 제외(런타임 렌더).
// OG 는 가능 범위 내에서 ns 기반 정적 메타로 구성한다(팀 이름 동적 OG 는 범위 밖).
export async function generateMetadata({ params }: ShareParams): Promise<Metadata> {
  const { lng } = await params;
  return translationsMetadata({ params: Promise.resolve({ lng }), ns: 'pokemon-team' });
}

export default async function SharedPokemonTeamPage({ params }: ShareParams) {
  const { lng, shareId } = await params;
  const language = lng as Language;

  const { t } = await getTranslations(language, 'pokemon-team');
  const badge = getServiceCategoryBadge(language, '/pokemon-team');

  return (
    <div className="space-y-4">
      <ServicePageHeader
        title={t('shareView.title')}
        description={t('shareView.description')}
        badge={badge}
      />
      <Suspense fallback={null}>
        <SharedPokemonTeamClient lng={language} shareId={shareId} />
      </Suspense>
    </div>
  );
}
