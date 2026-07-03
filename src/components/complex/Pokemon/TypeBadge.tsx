'use client';

import React from 'react';
import { cn } from '@utils/cn';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import { PokemonType, TYPE_COLORS } from '@libs/pokemon/typeChart';
import {
  Bug,
  Crown,
  Droplet,
  Eye,
  Flame,
  Ghost,
  Gem,
  Leaf,
  Minus,
  Moon,
  Mountain,
  Shield,
  Skull,
  Snowflake,
  Sparkles,
  Swords,
  Wind,
  Zap,
} from 'lucide-react';

// Lucide icon per type (white, centered inside colored circle)
export const TYPE_ICONS: Record<PokemonType, React.ReactNode> = {
  normal: <Minus />,
  fire: <Flame />,
  water: <Droplet />,
  electric: <Zap />,
  grass: <Leaf />,
  ice: <Snowflake />,
  fighting: <Swords />,
  poison: <Skull />,
  ground: <Mountain />,
  flying: <Wind />,
  psychic: <Eye />,
  bug: <Bug />,
  rock: <Gem />,
  ghost: <Ghost />,
  dragon: <Crown />,
  dark: <Moon />,
  steel: <Shield />,
  fairy: <Sparkles />,
};

interface TypeBadgeProps {
  lng: Language;
  type: PokemonType;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  showName?: boolean;
}

export default function TypeBadge({
  lng,
  type,
  size = 'md',
  selected = false,
  disabled = false,
  onClick = undefined,
  showName = false,
}: TypeBadgeProps) {
  const { t } = useTranslation(lng, 'pokemon-common');
  const name = t(`types.${type}`);
  const color = TYPE_COLORS[type];

  const sizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-9 h-9 sm:w-11 sm:h-11',
    lg: 'w-14 h-14',
  };

  // CSS-based icon sizing: overrides Lucide default via class (no size prop passed)
  const iconContainerClasses = {
    sm: '[&>svg]:w-[16px] [&>svg]:h-[16px]',
    md: '[&>svg]:w-[15px] [&>svg]:h-[15px] sm:[&>svg]:w-[20px] sm:[&>svg]:h-[20px]',
    lg: '[&>svg]:w-[26px] [&>svg]:h-[26px]',
  };

  const buttonPaddingClass = {
    sm: 'p-0.5',
    md: 'p-0.5 sm:p-1',
    lg: 'p-1',
  };

  const nameSizeClass = {
    sm: 'text-[9px]',
    md: 'text-[9px] sm:text-[10px]',
    lg: 'text-[10px]',
  };

  // onClick 이 없으면 순수 표시용 배지 → 비인터랙티브 <span> 으로 렌더한다.
  // (인터랙티브 부모(예: 검색 결과 행 <button>) 안에 중첩될 때 button-in-button
  //  하이드레이션 에러를 방지하고 유효한 HTML 을 보장한다.)
  const interactive = typeof onClick === 'function';

  const content = (
    <>
      <div
        className={cn(
          'rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-200',
          sizeClasses[size],
        )}
        style={{
          backgroundColor: color,
          boxShadow: selected ? `0 0 0 3px white, 0 0 0 5px ${color}` : undefined,
        }}
      >
        <span
          className={cn('text-white flex items-center justify-center', iconContainerClasses[size])}
        >
          {React.cloneElement(TYPE_ICONS[type] as React.ReactElement, { strokeWidth: 1.8 })}
        </span>
      </div>
      {showName && (
        <span
          className={cn('font-semibold text-fg-4 leading-none text-center', nameSizeClass[size])}
        >
          {name}
        </span>
      )}
    </>
  );

  const layoutClass = cn(
    'flex flex-col items-center gap-1 rounded-xl transition-all duration-200',
    buttonPaddingClass[size],
  );

  if (!interactive) {
    return (
      <span className={layoutClass} title={name}>
        {content}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled && !selected}
      title={name}
      className={cn(
        layoutClass,
        'focus:outline-none',
        disabled && !selected ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
      )}
    >
      {content}
    </button>
  );
}

TypeBadge.defaultProps = {
  size: 'md',
  selected: false,
  disabled: false,
  onClick: undefined,
  showName: false,
};
