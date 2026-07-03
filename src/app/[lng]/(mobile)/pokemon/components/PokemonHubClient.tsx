'use client';

import React from 'react';
import Link from '@components/basic/Link';
import { ArrowUpRight, ShieldAlert, Swords, Users } from 'lucide-react';
import CursorGlowCard from '@components/complex/Service/CursorGlowCard';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';

type PokemonHubClientProps = {
  lng: Language;
};

type HubCard = {
  toolId: string;
  link: string;
  icon: React.ReactNode;
  title: string;
  description: string;
};

export default function PokemonHubClient({ lng }: PokemonHubClientProps) {
  const { t } = useTranslation(lng, 'pokemon');

  const cards: HubCard[] = [
    {
      toolId: 'pokemon-type-calculator',
      link: '/pokemon-type-calculator',
      icon: <Swords />,
      title: t('card.typeCalculator.title'),
      description: t('card.typeCalculator.description'),
    },
    {
      toolId: 'pokemon-weakness',
      link: '/pokemon-weakness',
      icon: <ShieldAlert />,
      title: t('card.weakness.title'),
      description: t('card.weakness.description'),
    },
    {
      toolId: 'pokemon-team',
      link: '/pokemon-team',
      icon: <Users />,
      title: t('card.teamBuilder.title'),
      description: t('card.teamBuilder.description'),
    },
  ];

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {cards.map((card) => (
        <li key={card.link} className="list-none">
          <CursorGlowCard className="h-full">
            <Link
              href={card.link}
              prefetch
              analyticsKey="tool_open"
              analyticsParams={{
                tool_id: card.toolId,
                tool_category: 'lifestyle',
                from: 'pokemon_hub',
              }}
              className={cn(
                SERVICE_PANEL_SOFT,
                SERVICE_CARD_INTERACTIVE,
                'group flex h-full items-start gap-4 rounded-2xl p-4',
              )}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-basic-3 bg-basic-0/90 text-fg-3">
                {card.icon}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-fg-1 md:text-base">{card.title}</span>
                </div>
                <p className="text-xs leading-relaxed text-fg-5">{card.description}</p>
              </div>
              <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-fg-6 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-point-fg" />
            </Link>
          </CursorGlowCard>
        </li>
      ))}
    </ul>
  );
}
