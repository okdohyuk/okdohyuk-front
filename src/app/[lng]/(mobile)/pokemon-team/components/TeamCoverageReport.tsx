'use client';

import React, { useMemo } from 'react';
import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import TypeBadge from '@components/complex/Pokemon/TypeBadge';
import { computeTeamCoverage, type PokemonType } from '@libs/pokemon/typeChart';
import type { PokemonTeamMember } from '@api/PokemonTeam';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';

interface TeamCoverageReportProps {
  lng: Language;
  members: PokemonTeamMember[];
}

// 팀 약점 커버리지 리포트(Marriland식).
// computeTeamCoverage 로 공유 약점(sharedWeaknesses) 을 강조하고,
// attacker별 weak/resist/immune 카운트를 표로 보여준다.
export default function TeamCoverageReport({ lng, members }: TeamCoverageReportProps) {
  const { t } = useTranslation(lng, 'pokemon-team');
  const { t: tCommon } = useTranslation(lng, 'pokemon-common');

  // PokemonTeamMember.types 는 PokemonTypeEnum[](typeChart 의 PokemonType 과 동일 문자열 유니온).
  const coverage = useMemo(
    () => computeTeamCoverage(members.map((member) => member.types as PokemonType[])),
    [members],
  );

  if (members.length === 0) {
    return (
      <Text variant="c1" color="basic-5" className="block py-4 text-center">
        {t('coverage.emptyTeam')}
      </Text>
    );
  }

  // 약점/내성/무효 중 하나라도 있는 attacker 만 표에 노출(0/0/0 행 생략).
  const visibleEntries = coverage.entries.filter(
    (entry) => entry.weakCount > 0 || entry.resistCount > 0 || entry.immuneCount > 0,
  );

  return (
    <div className="space-y-4">
      {/* 공유 약점 강조 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Text variant="d2" className="font-semibold">
            {t('coverage.sharedHeading')}
          </Text>
        </div>
        <Text variant="c1" color="basic-5" className="block">
          {t('coverage.sharedDescription')}
        </Text>
        {coverage.sharedWeaknesses.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-red-300/60 bg-red-50/60 p-2.5 dark:border-red-500/30 dark:bg-red-500/10">
            {coverage.sharedWeaknesses.map((type) => (
              <TypeBadge key={type} lng={lng} type={type} size="sm" showName />
            ))}
          </div>
        ) : (
          <Text variant="c1" className="block font-medium text-emerald-600 dark:text-emerald-400">
            {t('coverage.sharedNone')}
          </Text>
        )}
      </div>

      {/* attacker별 카운트 표 */}
      <div className="space-y-2">
        <Text variant="c1" color="basic-5" className="block">
          {t('coverage.description')}
        </Text>
        <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {visibleEntries.map((entry) => (
            <li
              key={entry.attacker}
              className={cn(
                SERVICE_PANEL_SOFT,
                'flex items-center gap-3 rounded-xl p-2',
                entry.weakCount >= 2 && 'border-red-300/70 dark:border-red-500/40',
              )}
            >
              <TypeBadge lng={lng} type={entry.attacker} size="sm" />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-fg-2">
                {tCommon(`types.${entry.attacker}`)}
              </span>
              <div className="flex shrink-0 items-center gap-1.5 text-xs font-semibold">
                {entry.weakCount > 0 ? (
                  <span
                    title={t('coverage.weak')}
                    className="rounded-md bg-red-100 px-1.5 py-0.5 text-red-700 dark:bg-red-500/20 dark:text-red-300"
                  >
                    {t('coverage.weak')} {entry.weakCount}
                  </span>
                ) : null}
                {entry.resistCount > 0 ? (
                  <span
                    title={t('coverage.resist')}
                    className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                  >
                    {t('coverage.resist')} {entry.resistCount}
                  </span>
                ) : null}
                {entry.immuneCount > 0 ? (
                  <span
                    title={t('coverage.immune')}
                    className="rounded-md bg-basic-3 px-1.5 py-0.5 text-fg-3"
                  >
                    {t('coverage.immune')} {entry.immuneCount}
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
