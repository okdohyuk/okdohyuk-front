'use client';

import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import Link from '@components/basic/Link';
import { stringToLanguage } from '@utils/localeUtil';
import { cn } from '@utils/cn';
import { fallbackLng } from '~/app/i18n/settings';
import { useTranslation } from '~/app/i18n/client';

// 포켓몬 하위 도구 경로(로케일 프리픽스 제거 기준). 이 경로들에서만 뒤로가기가
// 메뉴 대신 포켓몬 허브(/pokemon)로 향한다. 포켓몬 허브(/pokemon 정확히)와
// 그 외 모든 도구는 기존 '메뉴로 돌아가기' 동작을 그대로 유지한다.
const POKEMON_TOOL_PREFIXES = [
  '/pokemon-weakness',
  '/pokemon-team',
  '/pokemon-type-calculator',
] as const;

const isPokemonToolPath = (normalizedPath: string): boolean =>
  POKEMON_TOOL_PREFIXES.some(
    (prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`),
  );

function BackToMenuNav() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  const { language, normalizedPath } = useMemo(() => {
    const path = pathname ?? '/';
    const localeSegment = path.split('/')[1] ?? fallbackLng;
    const parsedLanguage = stringToLanguage(localeSegment) ?? fallbackLng;
    const withoutLocale = path.replace(/^\/[a-z]{2}(?=\/|$)/, '');

    return {
      language: parsedLanguage,
      normalizedPath: withoutLocale || '/',
    };
  }, [pathname]);

  const { t } = useTranslation(language, 'common');
  const { t: tPokemon } = useTranslation(language, 'pokemon-common');
  const isVisible = normalizedPath !== '/menu' && !normalizedPath.startsWith('/auth');

  // 포켓몬 하위 도구에서만 대상/라벨을 포켓몬 허브로 override.
  const isPokemonTool = isPokemonToolPath(normalizedPath);
  const href = isPokemonTool ? `/${language}/pokemon` : `/${language}/menu`;
  const label = isPokemonTool
    ? tPokemon('navigation.backToPokemonTools')
    : t('navigation.backToMenu');

  if (!isVisible) {
    return null;
  }

  return (
    <motion.div
      className="mb-3"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
    >
      <Link
        href={href}
        prefetch
        className={cn(
          'group inline-flex h-10 items-center gap-2 rounded-2xl border border-basic-3/80 bg-basic-0/80 px-3 text-sm font-semibold text-fg-3 shadow-sm backdrop-blur-md transition-colors',
          'hover:border-point-2/70 hover:text-point-fg',
        )}
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        <span>{label}</span>
      </Link>
    </motion.div>
  );
}

export default BackToMenuNav;
