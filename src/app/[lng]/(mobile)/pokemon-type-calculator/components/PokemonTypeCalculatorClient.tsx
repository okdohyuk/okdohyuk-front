'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Text } from '@components/basic/Text';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import GoogleAd from '@components/google/GoogleAd';
import { useToolTracking } from '@hooks/analytics/useToolTracking';
import {
  POKEMON_TYPES,
  PokemonType,
  TYPE_COLORS,
  TYPE_CHART,
  EFFECTIVENESS_TIERS,
  computeDefenseChart,
  getCellColorClass,
  getCellLabel,
  groupByEffectiveness,
} from '@libs/pokemon/typeChart';
import TypeBadge from '@components/complex/Pokemon/TypeBadge';
import EffectivenessGroup from '@components/complex/Pokemon/EffectivenessGroup';
import { X } from 'lucide-react';

interface PokemonTypeCalculatorClientProps {
  lng: Language;
}

export default function PokemonTypeCalculatorClient({ lng }: PokemonTypeCalculatorClientProps) {
  const { t } = useTranslation(lng, 'pokemon-type-calculator');
  const { t: tCommon } = useTranslation(lng, 'pokemon-common');
  const { trackInputStarted, trackUse } = useToolTracking('pokemon-type-calculator', 'calculator');
  const [selectedTypes, setSelectedTypes] = useState<PokemonType[]>([]);
  const lastTrackedKeyRef = useRef<string | null>(null);

  const toggleType = (type: PokemonType) => {
    trackInputStarted();
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
    return groupByEffectiveness(defenseChart);
  }, [defenseChart]);

  const isMaxSelected = selectedTypes.length >= 3;
  const getTypeName = (type: PokemonType) => tCommon(`types.${type}`);

  useEffect(() => {
    if (selectedTypes.length > 0) {
      const key = selectedTypes.join(',');
      if (lastTrackedKeyRef.current !== key) {
        lastTrackedKeyRef.current = key;
        trackUse({
          action_type: 'calculate',
          success: true,
          type_count: selectedTypes.length,
        });
      }
    }
  }, [selectedTypes, trackUse]);

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

        <div className="grid grid-cols-6 gap-1 sm:gap-2 sm:grid-cols-9">
          {POKEMON_TYPES.map((type) => (
            <TypeBadge
              key={type}
              lng={lng}
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
              className="text-xs text-fg-5 hover:text-fg-3 transition-colors underline"
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
                <span>{getTypeName(type)}</span>
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
                  lng={lng}
                  multiplier={multiplier}
                  types={types}
                  label={tCommon(labelKey)}
                  colorClass={colorClass}
                  bgClass={bgClass}
                />
              );
            })}
          </div>
        </section>
      )}

      {groupedByEffectiveness && <GoogleAd slotId="7911066601" className="w-full mt-4" />}

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
          <table className="border-collapse mx-auto min-w-max">
            <thead>
              <tr>
                <th className="p-1 text-fg-6 font-normal text-left sticky left-0 bg-basic-0 z-10 min-w-[56px]">
                  <span className="text-xs">{t('chart.atkVsDef')}</span>
                </th>
                {POKEMON_TYPES.map((type) => (
                  <th key={type} className="p-0.5 font-normal">
                    <div
                      className="rounded w-6 h-6 mx-auto flex items-center justify-center text-white text-[9px] font-bold"
                      style={{ backgroundColor: TYPE_COLORS[type] }}
                      title={getTypeName(type)}
                    >
                      {getTypeName(type).slice(0, 2)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {POKEMON_TYPES.map((attacker) => (
                <tr key={attacker} className="hover:bg-basic-1">
                  <td className="p-1 sticky left-0 bg-basic-0 z-10">
                    <div
                      className="rounded px-1 py-0.5 text-white text-xs font-bold text-center"
                      style={{ backgroundColor: TYPE_COLORS[attacker] }}
                    >
                      {getTypeName(attacker).slice(0, 2)}
                    </div>
                  </td>
                  {POKEMON_TYPES.map((defender) => {
                    const mult = TYPE_CHART[attacker][defender];
                    const cellColor = getCellColorClass(mult);
                    return (
                      <td key={defender} className="p-0.5 text-center">
                        <span
                          className={cn(
                            'rounded text-xs font-medium tabular-nums px-0.5',
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
