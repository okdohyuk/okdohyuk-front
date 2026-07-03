'use client';

import React from 'react';
import Link from '@components/basic/Link';
import { ArrowUpRight } from 'lucide-react';
import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { usePokemonTeamByShareId } from '@queries/usePokemonTeamQueries';
import TeamMemberGrid from '../../../components/TeamMemberGrid';
import TeamCoverageReport from '../../../components/TeamCoverageReport';

interface SharedPokemonTeamClientProps {
  lng: Language;
  shareId: string;
}

// 공유 팀 읽기 전용 보기. shareId 로 공개 단건을 조회해 멤버 + 커버리지를 표시한다.
export default function SharedPokemonTeamClient({ lng, shareId }: SharedPokemonTeamClientProps) {
  const { t } = useTranslation(lng, 'pokemon-team');
  const { data: team, isPending, isError } = usePokemonTeamByShareId(shareId);

  if (isPending) {
    return (
      <section className={cn(SERVICE_PANEL_SOFT, 'p-5 text-center')}>
        <Text variant="c1" color="basic-5">
          {t('shareView.loading')}
        </Text>
      </section>
    );
  }

  if (isError || !team) {
    return (
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-5 text-center')}>
        <Text variant="d2" className="block font-bold">
          {t('shareView.notFound')}
        </Text>
        <Link
          href="/pokemon-team"
          prefetch
          className="inline-flex items-center gap-1 text-sm font-semibold text-point-fg hover:underline"
        >
          {t('shareView.openBuilder')}
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </section>
    );
  }

  return (
    <div className="w-full space-y-5">
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <div className="flex items-center justify-between gap-2">
          <Text variant="d1" className="font-bold">
            {team.name}
          </Text>
          <Link
            href="/pokemon-team"
            prefetch
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-point-fg hover:underline"
          >
            {t('shareView.openBuilder')}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <TeamMemberGrid lng={lng} members={team.members} />
      </section>

      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <Text variant="d2" className="font-semibold">
          {t('coverage.heading')}
        </Text>
        <TeamCoverageReport lng={lng} members={team.members} />
      </section>
    </div>
  );
}
