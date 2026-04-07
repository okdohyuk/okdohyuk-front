'use client';

import React, { useMemo, useState } from 'react';
import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { X } from 'lucide-react';

interface PokemonTypeCalculatorClientProps {
  lng: Language;
}

// All 18 Pokemon types (Gen 6+)
const POKEMON_TYPES = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
] as const;

type PokemonType = (typeof POKEMON_TYPES)[number];

// PokeAPI type IDs for official sprite images
const TYPE_SPRITE_ID: Record<PokemonType, number> = {
  normal: 1,
  fighting: 2,
  flying: 3,
  poison: 4,
  ground: 5,
  rock: 6,
  bug: 7,
  ghost: 8,
  steel: 9,
  fire: 10,
  water: 11,
  grass: 12,
  electric: 13,
  psychic: 14,
  ice: 15,
  dragon: 16,
  dark: 17,
  fairy: 18,
};

// Official type colors (matching official Pokemon games)
const TYPE_COLORS: Record<PokemonType, string> = {
  normal: '#9FA19F',
  fire: '#E62829',
  water: '#2980EF',
  electric: '#FAC000',
  grass: '#3FA129',
  ice: '#3DCEF3',
  fighting: '#FF8000',
  poison: '#9141CB',
  ground: '#915121',
  flying: '#81B9EF',
  psychic: '#EF4179',
  bug: '#91A119',
  rock: '#AFA981',
  ghost: '#704170',
  dragon: '#5060E1',
  dark: '#624D4E',
  steel: '#60A1B8',
  fairy: '#EF70EF',
};

// Gen 6+ Type effectiveness chart
// TYPE_CHART[attacker][defender] = multiplier
const TYPE_CHART: Record<PokemonType, Record<PokemonType, number>> = {
  normal: {
    normal: 1,
    fire: 1,
    water: 1,
    electric: 1,
    grass: 1,
    ice: 1,
    fighting: 1,
    poison: 1,
    ground: 1,
    flying: 1,
    psychic: 1,
    bug: 1,
    rock: 0.5,
    ghost: 0,
    dragon: 1,
    dark: 1,
    steel: 0.5,
    fairy: 1,
  },
  fire: {
    normal: 1,
    fire: 0.5,
    water: 0.5,
    electric: 1,
    grass: 2,
    ice: 2,
    fighting: 1,
    poison: 1,
    ground: 1,
    flying: 1,
    psychic: 1,
    bug: 2,
    rock: 0.5,
    ghost: 1,
    dragon: 0.5,
    dark: 1,
    steel: 2,
    fairy: 1,
  },
  water: {
    normal: 1,
    fire: 2,
    water: 0.5,
    electric: 1,
    grass: 0.5,
    ice: 1,
    fighting: 1,
    poison: 1,
    ground: 2,
    flying: 1,
    psychic: 1,
    bug: 1,
    rock: 2,
    ghost: 1,
    dragon: 0.5,
    dark: 1,
    steel: 1,
    fairy: 1,
  },
  electric: {
    normal: 1,
    fire: 1,
    water: 2,
    electric: 0.5,
    grass: 0.5,
    ice: 1,
    fighting: 1,
    poison: 1,
    ground: 0,
    flying: 2,
    psychic: 1,
    bug: 1,
    rock: 1,
    ghost: 1,
    dragon: 0.5,
    dark: 1,
    steel: 1,
    fairy: 1,
  },
  grass: {
    normal: 1,
    fire: 0.5,
    water: 2,
    electric: 1,
    grass: 0.5,
    ice: 1,
    fighting: 1,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    psychic: 1,
    bug: 0.5,
    rock: 2,
    ghost: 1,
    dragon: 0.5,
    dark: 1,
    steel: 0.5,
    fairy: 1,
  },
  ice: {
    normal: 1,
    fire: 0.5,
    water: 0.5,
    electric: 1,
    grass: 2,
    ice: 0.5,
    fighting: 1,
    poison: 1,
    ground: 2,
    flying: 2,
    psychic: 1,
    bug: 1,
    rock: 1,
    ghost: 1,
    dragon: 2,
    dark: 1,
    steel: 0.5,
    fairy: 1,
  },
  fighting: {
    normal: 2,
    fire: 1,
    water: 1,
    electric: 1,
    grass: 1,
    ice: 2,
    fighting: 1,
    poison: 0.5,
    ground: 1,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 2,
    ghost: 0,
    dragon: 1,
    dark: 2,
    steel: 2,
    fairy: 0.5,
  },
  poison: {
    normal: 1,
    fire: 1,
    water: 1,
    electric: 1,
    grass: 2,
    ice: 1,
    fighting: 1,
    poison: 0.5,
    ground: 0.5,
    flying: 1,
    psychic: 1,
    bug: 1,
    rock: 0.5,
    ghost: 0.5,
    dragon: 1,
    dark: 1,
    steel: 0,
    fairy: 2,
  },
  ground: {
    normal: 1,
    fire: 2,
    water: 1,
    electric: 2,
    grass: 0.5,
    ice: 1,
    fighting: 1,
    poison: 2,
    ground: 1,
    flying: 0,
    psychic: 1,
    bug: 0.5,
    rock: 2,
    ghost: 1,
    dragon: 1,
    dark: 1,
    steel: 2,
    fairy: 1,
  },
  flying: {
    normal: 1,
    fire: 1,
    water: 1,
    electric: 0.5,
    grass: 2,
    ice: 1,
    fighting: 2,
    poison: 1,
    ground: 1,
    flying: 1,
    psychic: 1,
    bug: 2,
    rock: 0.5,
    ghost: 1,
    dragon: 1,
    dark: 1,
    steel: 0.5,
    fairy: 1,
  },
  psychic: {
    normal: 1,
    fire: 1,
    water: 1,
    electric: 1,
    grass: 1,
    ice: 1,
    fighting: 2,
    poison: 2,
    ground: 1,
    flying: 1,
    psychic: 0.5,
    bug: 1,
    rock: 1,
    ghost: 1,
    dragon: 1,
    dark: 0,
    steel: 0.5,
    fairy: 1,
  },
  bug: {
    normal: 1,
    fire: 0.5,
    water: 1,
    electric: 1,
    grass: 2,
    ice: 1,
    fighting: 0.5,
    poison: 0.5,
    ground: 1,
    flying: 0.5,
    psychic: 2,
    bug: 1,
    rock: 1,
    ghost: 0.5,
    dragon: 1,
    dark: 2,
    steel: 0.5,
    fairy: 0.5,
  },
  rock: {
    normal: 1,
    fire: 2,
    water: 1,
    electric: 1,
    grass: 1,
    ice: 2,
    fighting: 0.5,
    poison: 1,
    ground: 0.5,
    flying: 2,
    psychic: 1,
    bug: 2,
    rock: 1,
    ghost: 1,
    dragon: 1,
    dark: 1,
    steel: 0.5,
    fairy: 1,
  },
  ghost: {
    normal: 0,
    fire: 1,
    water: 1,
    electric: 1,
    grass: 1,
    ice: 1,
    fighting: 1,
    poison: 1,
    ground: 1,
    flying: 1,
    psychic: 2,
    bug: 1,
    rock: 1,
    ghost: 2,
    dragon: 1,
    dark: 0.5,
    steel: 1,
    fairy: 1,
  },
  dragon: {
    normal: 1,
    fire: 1,
    water: 1,
    electric: 1,
    grass: 1,
    ice: 1,
    fighting: 1,
    poison: 1,
    ground: 1,
    flying: 1,
    psychic: 1,
    bug: 1,
    rock: 1,
    ghost: 1,
    dragon: 2,
    dark: 1,
    steel: 0.5,
    fairy: 0,
  },
  dark: {
    normal: 1,
    fire: 1,
    water: 1,
    electric: 1,
    grass: 1,
    ice: 1,
    fighting: 0.5,
    poison: 1,
    ground: 1,
    flying: 1,
    psychic: 2,
    bug: 1,
    rock: 1,
    ghost: 2,
    dragon: 1,
    dark: 0.5,
    steel: 1,
    fairy: 0.5,
  },
  steel: {
    normal: 1,
    fire: 0.5,
    water: 0.5,
    electric: 0.5,
    grass: 1,
    ice: 2,
    fighting: 1,
    poison: 1,
    ground: 1,
    flying: 1,
    psychic: 1,
    bug: 1,
    rock: 2,
    ghost: 1,
    dragon: 1,
    dark: 1,
    steel: 0.5,
    fairy: 2,
  },
  fairy: {
    normal: 1,
    fire: 0.5,
    water: 1,
    electric: 1,
    grass: 1,
    ice: 1,
    fighting: 2,
    poison: 0.5,
    ground: 1,
    flying: 1,
    psychic: 1,
    bug: 1,
    rock: 1,
    ghost: 1,
    dragon: 2,
    dark: 2,
    steel: 0.5,
    fairy: 1,
  },
};

// Compute defense effectiveness: for each attacking type,
// multiply its effectiveness against each defending type
function computeDefenseChart(defenderTypes: PokemonType[]): Record<PokemonType, number> {
  return POKEMON_TYPES.reduce(
    (acc, attacker) => ({
      ...acc,
      [attacker]: defenderTypes.reduce(
        (multiplier, defender) => multiplier * TYPE_CHART[attacker][defender],
        1,
      ),
    }),
    {} as Record<PokemonType, number>,
  );
}

function getTypeSpriteUrl(type: PokemonType): string {
  const id = TYPE_SPRITE_ID[type];
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-ix/scarlet-violet/${id}.png`;
}

function getCellColorClass(mult: number): string {
  if (mult === 4) return 'bg-red-500 text-white';
  if (mult === 2) return 'bg-orange-400 text-white';
  if (mult === 0.5) return 'bg-blue-400 text-white';
  if (mult === 0.25) return 'bg-indigo-500 text-white';
  if (mult === 0) return 'bg-zinc-400 text-white';
  return 'text-zinc-400 dark:text-zinc-600';
}

function getCellLabel(mult: number): string {
  if (mult === 0.5) return '½';
  if (mult === 0.25) return '¼';
  return String(mult);
}

interface TypeBadgeProps {
  type: PokemonType;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  showName?: boolean;
}

function TypeBadge({
  type,
  size = 'md',
  selected = false,
  disabled = false,
  onClick = undefined,
  showName = false,
}: TypeBadgeProps) {
  const color = TYPE_COLORS[type];
  const spriteUrl = getTypeSpriteUrl(type);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
  };

  const imgSizes = {
    sm: 28,
    md: 42,
    lg: 50,
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled && !selected}
      title={type}
      className={cn(
        'flex flex-col items-center gap-1 rounded-xl p-1.5 transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
        selected ? 'ring-2 ring-offset-2 scale-110 shadow-lg' : 'hover:scale-105 hover:shadow-md',
        disabled && !selected ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
      )}
      style={selected ? { backgroundColor: `${color}30`, outlineColor: color } : undefined}
    >
      <div
        className={cn(
          'rounded-full overflow-hidden flex items-center justify-center',
          sizeClasses[size],
        )}
        style={{ backgroundColor: color }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={spriteUrl}
          alt={type}
          width={imgSizes[size]}
          height={imgSizes[size]}
          className="object-contain p-0.5"
          onError={(e) => {
            // fallback: hide broken image, show colored circle only
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
      {showName && (
        <span className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-300 capitalize leading-none">
          {type}
        </span>
      )}
    </button>
  );
}

interface EffectivenessGroupProps {
  multiplier: number;
  types: PokemonType[];
  label: string;
  colorClass: string;
  bgClass: string;
}

TypeBadge.defaultProps = {
  size: 'md',
  selected: false,
  disabled: false,
  onClick: undefined,
  showName: false,
};

function EffectivenessGroup({
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
          <TypeBadge key={type} type={type} size="sm" showName />
        ))}
      </div>
    </div>
  );
}

const EFFECTIVENESS_TIERS = [
  {
    multiplier: 4,
    labelKey: 'effectiveness.x4',
    colorClass: 'text-red-700 dark:text-red-300',
    bgClass: 'bg-red-100 dark:bg-red-900/40',
  },
  {
    multiplier: 2,
    labelKey: 'effectiveness.x2',
    colorClass: 'text-orange-700 dark:text-orange-300',
    bgClass: 'bg-orange-100 dark:bg-orange-900/40',
  },
  {
    multiplier: 1,
    labelKey: 'effectiveness.x1',
    colorClass: 'text-zinc-600 dark:text-zinc-300',
    bgClass: 'bg-zinc-100 dark:bg-zinc-800',
  },
  {
    multiplier: 0.5,
    labelKey: 'effectiveness.x05',
    colorClass: 'text-blue-700 dark:text-blue-300',
    bgClass: 'bg-blue-100 dark:bg-blue-900/40',
  },
  {
    multiplier: 0.25,
    labelKey: 'effectiveness.x025',
    colorClass: 'text-indigo-700 dark:text-indigo-300',
    bgClass: 'bg-indigo-100 dark:bg-indigo-900/40',
  },
  {
    multiplier: 0,
    labelKey: 'effectiveness.x0',
    colorClass: 'text-zinc-500 dark:text-zinc-400',
    bgClass: 'bg-zinc-200 dark:bg-zinc-700',
  },
] as const;

export default function PokemonTypeCalculatorClient({ lng }: PokemonTypeCalculatorClientProps) {
  const { t } = useTranslation(lng, 'pokemon-type-calculator');
  const [selectedTypes, setSelectedTypes] = useState<PokemonType[]>([]);

  const toggleType = (type: PokemonType) => {
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((item) => item !== type);
      }
      if (prev.length >= 3) return prev;
      return [...prev, type];
    });
  };

  const removeType = (type: PokemonType) => {
    setSelectedTypes((prev) => prev.filter((item) => item !== type));
  };

  const clearAll = () => setSelectedTypes([]);

  const defenseChart = useMemo(() => {
    if (selectedTypes.length === 0) return null;
    return computeDefenseChart(selectedTypes);
  }, [selectedTypes]);

  const groupedByEffectiveness = useMemo(() => {
    if (!defenseChart) return null;
    return POKEMON_TYPES.reduce<Record<number, PokemonType[]>>((groups, type) => {
      const mult = defenseChart[type];
      return {
        ...groups,
        [mult]: [...(groups[mult] ?? []), type],
      };
    }, {});
  }, [defenseChart]);

  const isMaxSelected = selectedTypes.length >= 3;

  return (
    <div className="w-full space-y-5">
      {/* Type selector */}
      <section className={cn(SERVICE_PANEL_SOFT, 'p-4 space-y-3')}>
        <div className="flex items-center justify-between">
          <Text variant="d2" className="font-semibold">
            {t('section.selectType')}
          </Text>
          <Text variant="c1" color="basic-5">
            {selectedTypes.length} / 3
          </Text>
        </div>

        <div className="grid grid-cols-6 gap-2 sm:grid-cols-9">
          {POKEMON_TYPES.map((type) => (
            <TypeBadge
              key={type}
              type={type}
              size="md"
              selected={selectedTypes.includes(type)}
              disabled={isMaxSelected}
              onClick={() => toggleType(type)}
              showName
            />
          ))}
        </div>

        {isMaxSelected && (
          <Text variant="c1" color="basic-5" className="block text-center">
            {t('message.maxTypes')}
          </Text>
        )}
      </section>

      {/* Selected types display */}
      {selectedTypes.length > 0 && (
        <section className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'p-4 space-y-3')}>
          <div className="flex items-center justify-between">
            <Text variant="d2" className="font-semibold">
              {t('section.selectedTypes')}
            </Text>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors underline"
            >
              {t('action.clear')}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedTypes.map((type) => (
              <div
                key={type}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-white text-sm font-semibold"
                style={{ backgroundColor: TYPE_COLORS[type] }}
              >
                <span className="capitalize">{t(`types.${type}`)}</span>
                <button
                  type="button"
                  onClick={() => removeType(type)}
                  className="opacity-80 hover:opacity-100 transition-opacity"
                  aria-label={`Remove ${type}`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Effectiveness results */}
      {groupedByEffectiveness && (
        <section className="space-y-3">
          <Text variant="d2" className="font-semibold px-1">
            {t('section.results')}
          </Text>

          <div className="space-y-2">
            {EFFECTIVENESS_TIERS.map(({ multiplier, labelKey, colorClass, bgClass }) => {
              const types = groupedByEffectiveness[multiplier] ?? [];
              if (types.length === 0) return null;
              return (
                <EffectivenessGroup
                  key={multiplier}
                  multiplier={multiplier}
                  types={types}
                  label={t(labelKey)}
                  colorClass={colorClass}
                  bgClass={bgClass}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Empty state */}
      {selectedTypes.length === 0 && (
        <div className={cn(SERVICE_PANEL_SOFT, 'p-6 text-center')}>
          <Text variant="d2" color="basic-5" className="block">
            {t('message.selectPrompt')}
          </Text>
        </div>
      )}

      {/* Type chart reference */}
      <section className={cn(SERVICE_PANEL_SOFT, 'p-4 space-y-2')}>
        <Text variant="d2" className="font-semibold">
          {t('section.typeChart')}
        </Text>
        <Text variant="c1" color="basic-5" className="block">
          {t('section.typeChartDesc')}
        </Text>
        <div className="overflow-x-auto mt-2">
          <table className="text-[10px] border-collapse min-w-max">
            <thead>
              <tr>
                <th className="p-1 text-zinc-400 dark:text-zinc-500 font-normal text-left sticky left-0 bg-white dark:bg-zinc-900 z-10 min-w-[60px]">
                  {t('chart.atkVsDef')}
                </th>
                {POKEMON_TYPES.map((type) => (
                  <th key={type} className="p-0.5 font-normal">
                    <div
                      className="rounded w-5 h-5 mx-auto flex items-center justify-center text-white text-[8px] font-bold"
                      style={{ backgroundColor: TYPE_COLORS[type] }}
                      title={type}
                    >
                      {type.slice(0, 2).toUpperCase()}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {POKEMON_TYPES.map((attacker) => (
                <tr key={attacker} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="p-1 sticky left-0 bg-white dark:bg-zinc-900 z-10">
                    <div
                      className="rounded px-1 py-0.5 text-white text-[8px] font-bold text-center"
                      style={{ backgroundColor: TYPE_COLORS[attacker] }}
                    >
                      {attacker.slice(0, 3).toUpperCase()}
                    </div>
                  </td>
                  {POKEMON_TYPES.map((defender) => {
                    const mult = TYPE_CHART[attacker][defender];
                    const cellColor = getCellColorClass(mult);
                    return (
                      <td key={defender} className="p-0.5 text-center">
                        <span
                          className={cn(
                            'rounded px-0.5 text-[9px] font-medium tabular-nums',
                            cellColor,
                          )}
                        >
                          {getCellLabel(mult)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
