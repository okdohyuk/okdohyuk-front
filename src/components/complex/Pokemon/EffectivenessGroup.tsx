'use client';

import React from 'react';
import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import { SERVICE_PANEL_SOFT } from '@components/complex/Service/interactiveStyles';
import { Language } from '~/app/i18n/settings';
import { PokemonType } from '@libs/pokemon/typeChart';
import TypeBadge from './TypeBadge';

interface EffectivenessGroupProps {
  lng: Language;
  multiplier: number;
  types: PokemonType[];
  label: string;
  colorClass: string;
  bgClass: string;
}

export default function EffectivenessGroup({
  lng,
  multiplier,
  types,
  label,
  colorClass,
  bgClass,
}: EffectivenessGroupProps) {
  if (types.length === 0) return null;

  return (
    <div className={cn(SERVICE_PANEL_SOFT, 'p-3 space-y-2')}>
      <div className="flex items-center gap-2">
        <span className={cn('text-sm font-bold px-2 py-0.5 rounded-full', bgClass, colorClass)}>
          {label}
        </span>
        <Text variant="c1" color="basic-5">
          ×{multiplier}
        </Text>
      </div>
      <div className="flex flex-wrap gap-2">
        {types.map((type) => (
          <TypeBadge key={type} lng={lng} type={type} size="sm" showName />
        ))}
      </div>
    </div>
  );
}
