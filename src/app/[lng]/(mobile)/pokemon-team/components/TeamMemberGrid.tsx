'use client';

import React from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import TypeBadge from '@components/complex/Pokemon/TypeBadge';
import type { PokemonTeamMember } from '@api/PokemonTeam';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';

interface TeamMemberGridProps {
  lng: Language;
  members: PokemonTeamMember[];
  /** 제거 핸들러. 미지정 시 읽기 전용(공유 보기). */
  onRemove?: (slug: string) => void;
}

// 팀 멤버 카드 그리드. 빌더(편집 가능)와 공유 보기(읽기 전용) 양쪽에서 재사용한다.
export default function TeamMemberGrid({ lng, members, onRemove }: TeamMemberGridProps) {
  const { t } = useTranslation(lng, 'pokemon-team');

  const getName = (member: PokemonTeamMember) => member.names[lng] ?? member.names.en;

  if (members.length === 0) {
    return (
      <Text variant="c1" color="basic-5" className="block py-4 text-center">
        {t('team.empty')}
      </Text>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {members.map((member) => (
        <li key={member.slug} className="list-none">
          <div
            className={cn(SERVICE_PANEL_SOFT, 'relative flex flex-col items-center gap-1.5 p-3')}
          >
            {onRemove ? (
              <button
                type="button"
                aria-label={t('team.remove')}
                onClick={() => onRemove(member.slug)}
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full text-fg-6 transition-colors hover:bg-basic-3 hover:text-fg-3"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
            <Image
              src={member.spriteUrl}
              alt={getName(member)}
              width={72}
              height={72}
              className="h-[72px] w-[72px] shrink-0 object-contain"
              unoptimized
            />
            <span className="truncate text-center text-sm font-semibold text-fg-1">
              {getName(member)}
            </span>
            <div className="flex flex-wrap justify-center gap-1">
              {member.types.map((type) => (
                <TypeBadge key={type} lng={lng} type={type} size="sm" />
              ))}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

TeamMemberGrid.defaultProps = {
  onRemove: undefined,
};
