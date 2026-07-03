'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Text } from '@components/basic/Text';
import { Input } from '@components/basic/Input';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import LocalStorage from '@utils/localStorage';
import useDebounce from '@hooks/useDebounce';
import { useToolTracking } from '@hooks/analytics/useToolTracking';
import {
  EFFECTIVENESS_TIERS,
  computeDefenseChart,
  groupByEffectiveness,
} from '@libs/pokemon/typeChart';
import TypeBadge from '@components/complex/Pokemon/TypeBadge';
import EffectivenessGroup from '@components/complex/Pokemon/EffectivenessGroup';
import type { PokemonNames, PokemonSpecies } from '@api/Pokemon';
import { useGetPokemonSpecies, useSearchPokemonSpecies } from '@queries/usePokemonQueries';

interface PokemonWeaknessClientProps {
  lng: Language;
}

// localStorage 키 (최근 선택 목록). slug 와 함께 언어별 names 를 저장해
// 현재 페이지 언어(lng)로 이름을 표시한다(lng 전환 시 해당 언어로 노출).
// 스프라이트/타입 등 언어 무관 필드는 저장하지 않고 표시 시 API 로 보강한다.
const RECENT_KEY = 'pokemon-weakness:recent';
const RECENT_LIMIT = 8;
const SEARCH_MIN_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 350;
const RESULT_LIMIT = 24;

// 최근검색 저장 단위. 과거 포맷(slug 문자열 배열)과 호환하기 위해 names 는 optional.
interface RecentEntry {
  slug: string;
  names?: PokemonNames;
}

const isPokemonNames = (value: unknown): value is PokemonNames => {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.ko === 'string' &&
    typeof candidate.en === 'string' &&
    typeof candidate.ja === 'string' &&
    typeof candidate.zh === 'string'
  );
};

// 저장분 파싱. 과거 포맷(string[])과 신규 포맷(RecentEntry[])을 모두 수용하고
// 인식 불가한 항목은 무시한다.
const readRecent = (): RecentEntry[] => {
  const raw = LocalStorage.getItem(RECENT_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item): RecentEntry | null => {
        // 과거 포맷: slug 문자열만 저장 → names 없이 마이그레이션.
        if (typeof item === 'string') return { slug: item };
        if (typeof item === 'object' && item !== null) {
          const candidate = item as Record<string, unknown>;
          if (typeof candidate.slug === 'string') {
            return {
              slug: candidate.slug,
              names: isPokemonNames(candidate.names) ? candidate.names : undefined,
            };
          }
        }
        return null;
      })
      .filter((entry): entry is RecentEntry => entry !== null)
      .slice(0, RECENT_LIMIT);
  } catch {
    return [];
  }
};

const pickName = (names: PokemonNames | undefined, lng: Language): string | null => {
  if (!names) return null;
  return names[lng] || names.en || null;
};

export default function PokemonWeaknessClient({ lng }: PokemonWeaknessClientProps) {
  const { t } = useTranslation(lng, 'pokemon-weakness');
  const { t: tCommon } = useTranslation(lng, 'pokemon-common');
  const { trackInputStarted, trackUse } = useToolTracking('pokemon-weakness', 'calculator');

  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState('');
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  // 검색 결과에서 직접 고른 종(detail fetch 절약용). 딥링크/최근선택은 useGetPokemonSpecies 로 보강.
  const [selectedFromList, setSelectedFromList] = useState<PokemonSpecies | null>(null);
  const [recent, setRecent] = useState<RecentEntry[]>([]);
  const lastTrackedSlugRef = useRef<string | null>(null);
  const didRestoreRef = useRef(false);

  const debouncedQuery = useDebounce(query.trim(), SEARCH_DEBOUNCE_MS);
  const searchEnabled = debouncedQuery.length >= SEARCH_MIN_LENGTH;

  const searchResult = useSearchPokemonSpecies(
    searchEnabled ? debouncedQuery : undefined,
    undefined,
    0,
    RESULT_LIMIT,
    searchEnabled,
  );

  // 선택 종 보강: 리스트에서 고른 경우 그대로, 딥링크/최근선택은 slug 단건 조회.
  const needDetail = !!selectedSlug && selectedFromList?.slug !== selectedSlug;
  const detailResult = useGetPokemonSpecies(selectedSlug ?? '', needDetail);
  const selectedSpecies: PokemonSpecies | null =
    selectedFromList?.slug === selectedSlug ? selectedFromList : (detailResult.data ?? null);

  // 초기 진입: localStorage 최근 목록 + ?q={slug} 딥링크 복원.
  useEffect(() => {
    if (didRestoreRef.current) return;
    didRestoreRef.current = true;
    setRecent(readRecent());
    const slugParam = searchParams.get('q');
    if (slugParam) {
      setSelectedSlug(slugParam);
    }
  }, [searchParams]);

  const persistRecent = useCallback((next: RecentEntry[]) => {
    setRecent(next);
    LocalStorage.setItem(RECENT_KEY, JSON.stringify(next));
  }, []);

  const updateQueryString = useCallback(
    (slug: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (slug) {
        params.set('q', slug);
      } else {
        params.delete('q');
      }
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : '?', { scroll: false });
    },
    [router, searchParams],
  );

  const handleSelect = useCallback(
    (species: PokemonSpecies) => {
      setSelectedSlug(species.slug);
      setSelectedFromList(species);
      updateQueryString(species.slug);
      // 언어별 names 를 함께 저장 → 이후 어떤 lng 에서도 해당 언어 이름으로 표시.
      const entry: RecentEntry = { slug: species.slug, names: species.names };
      const next = [entry, ...recent.filter((r) => r.slug !== species.slug)].slice(0, RECENT_LIMIT);
      persistRecent(next);
    },
    [recent, persistRecent, updateQueryString],
  );

  const handleSelectSlug = useCallback(
    (slug: string) => {
      setSelectedSlug(slug);
      setSelectedFromList(null);
      updateQueryString(slug);
      // 최근 목록 재선택: 기존 항목(names 포함)을 보존해 맨 앞으로 이동.
      const existing = recent.find((r) => r.slug === slug);
      const entry: RecentEntry = existing ?? { slug };
      const next = [entry, ...recent.filter((r) => r.slug !== slug)].slice(0, RECENT_LIMIT);
      persistRecent(next);
    },
    [recent, persistRecent, updateQueryString],
  );

  const handleQueryChange = (value: string) => {
    if (value.length > 0) trackInputStarted();
    setQuery(value);
  };

  const clearQuery = () => setQuery('');
  const clearRecent = () => persistRecent([]);

  const getName = useCallback(
    (species: PokemonSpecies) => species.names[lng] ?? species.names.en,
    [lng],
  );

  // 선택 종 약점 계산.
  const groupedByEffectiveness = useMemo(() => {
    if (!selectedSpecies) return null;
    return groupByEffectiveness(computeDefenseChart(selectedSpecies.types));
  }, [selectedSpecies]);

  // 약점 조회 GA: 새 종 약점이 산출될 때마다 1회.
  useEffect(() => {
    if (!selectedSpecies || !groupedByEffectiveness) return;
    if (lastTrackedSlugRef.current === selectedSpecies.slug) return;
    lastTrackedSlugRef.current = selectedSpecies.slug;
    trackUse({
      action_type: 'lookup',
      success: true,
      species_slug: selectedSpecies.slug,
      type_count: selectedSpecies.types.length,
    });
  }, [selectedSpecies, groupedByEffectiveness, trackUse]);

  // names 없는 최근 항목(과거 포맷/딥링크) 마이그레이션: 상세 조회로 종이 확정되면
  // 저장분에 언어별 names 를 채워 다음부터 현재 언어로 표시되게 한다.
  useEffect(() => {
    if (!selectedSpecies) return;
    setRecent((prev) => {
      const target = prev.find((r) => r.slug === selectedSpecies.slug);
      if (!target || target.names) return prev;
      const next = prev.map((r) =>
        r.slug === selectedSpecies.slug ? { slug: r.slug, names: selectedSpecies.names } : r,
      );
      LocalStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }, [selectedSpecies]);

  const results = searchResult.data?.results ?? [];
  const showResults = searchEnabled && !searchResult.isError;
  const isSearchPending = searchEnabled && searchResult.isPending;

  const renderResultBody = () => {
    if (isSearchPending) {
      return (
        <Text variant="c1" color="basic-5" className="block py-2 text-center">
          {t('result.loading')}
        </Text>
      );
    }
    if (results.length === 0) {
      return (
        <Text variant="c1" color="basic-5" className="block py-2 text-center">
          {t('result.empty')}
        </Text>
      );
    }
    return (
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {results.map((species) => (
          <li key={species.slug} className="list-none">
            <button
              type="button"
              onClick={() => handleSelect(species)}
              className={cn(
                SERVICE_PANEL_SOFT,
                SERVICE_CARD_INTERACTIVE,
                'flex w-full items-center gap-3 rounded-xl p-2.5 text-left',
                selectedSlug === species.slug && 'border-point-2',
              )}
            >
              <Image
                src={species.spriteUrl}
                alt={getName(species)}
                width={48}
                height={48}
                className="h-12 w-12 shrink-0 object-contain"
                unoptimized
              />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-fg-1">
                    {getName(species)}
                  </span>
                  <span className="shrink-0 text-[11px] text-fg-6">#{species.dexId}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {species.types.map((type) => (
                    <TypeBadge key={type} lng={lng} type={type} size="sm" />
                  ))}
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    );
  };

  const renderSelectedBody = () => {
    if (needDetail && detailResult.isPending) {
      return (
        <Text variant="c1" color="basic-5" className="block py-2 text-center">
          {t('selected.loading')}
        </Text>
      );
    }
    if (needDetail && detailResult.isError) {
      return (
        <Text variant="c1" color="basic-5" className="block py-2 text-center">
          {t('selected.error')}
        </Text>
      );
    }
    if (!selectedSpecies) return null;
    return (
      <>
        <div className="flex items-center gap-4">
          <Image
            src={selectedSpecies.spriteUrl}
            alt={getName(selectedSpecies)}
            width={88}
            height={88}
            className="h-[88px] w-[88px] shrink-0 object-contain"
            unoptimized
          />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Text variant="d1" className="font-bold">
              {getName(selectedSpecies)}
            </Text>
            <Text variant="c1" color="basic-5" className="block">
              {t('selected.dex', { dexId: selectedSpecies.dexId })}
            </Text>
            <div className="flex flex-wrap gap-1.5">
              {selectedSpecies.types.map((type) => (
                <TypeBadge key={type} lng={lng} type={type} size="sm" showName />
              ))}
            </div>
          </div>
        </div>

        {groupedByEffectiveness ? (
          <div className="space-y-2">
            <Text variant="d2" className="font-semibold">
              {t('selected.weaknessHeading')}
            </Text>
            <div className="space-y-2">
              {EFFECTIVENESS_TIERS.map((tier) => (
                <EffectivenessGroup
                  key={tier.multiplier}
                  lng={lng}
                  multiplier={tier.multiplier}
                  types={groupedByEffectiveness[tier.multiplier] ?? []}
                  label={tCommon(tier.labelKey)}
                  colorClass={tier.colorClass}
                  bgClass={tier.bgClass}
                />
              ))}
            </div>
          </div>
        ) : null}
      </>
    );
  };

  return (
    <div className="w-full space-y-5">
      {/* Search input */}
      <section className={cn(SERVICE_PANEL_SOFT, 'p-4 space-y-3')}>
        <Text variant="d2" className="font-semibold">
          {t('search.label')}
        </Text>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-6" />
          <Input
            type="text"
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            placeholder={t('search.placeholder')}
            className="min-h-11 rounded-2xl pl-10 pr-10 text-sm md:text-base"
          />
          {query ? (
            <button
              type="button"
              aria-label={t('search.clear')}
              onClick={clearQuery}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-fg-6 transition-colors hover:bg-basic-3 hover:text-fg-3"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        {!searchEnabled ? (
          <Text variant="c1" color="basic-5" className="block">
            {t('search.hint')}
          </Text>
        ) : null}
      </section>

      {/* Recent searches */}
      {recent.length > 0 ? (
        <section className={cn(SERVICE_PANEL_SOFT, 'p-4 space-y-2')}>
          <div className="flex items-center justify-between">
            <Text variant="d2" className="font-semibold">
              {t('recent.heading')}
            </Text>
            <button
              type="button"
              onClick={clearRecent}
              className="text-xs text-fg-5 underline transition-colors hover:text-fg-3"
            >
              {t('recent.clear')}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recent.map((entry) => (
              <button
                key={entry.slug}
                type="button"
                onClick={() => handleSelectSlug(entry.slug)}
                className={cn(
                  'rounded-full border border-basic-3 bg-basic-0/80 px-3 py-1.5 text-xs font-semibold text-fg-3 transition-colors hover:border-point-2/70 hover:text-point-fg',
                  selectedSlug === entry.slug && 'border-point-2 text-point-fg',
                )}
              >
                {pickName(entry.names, lng) ?? entry.slug}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {/* Search results */}
      {showResults ? (
        <section className={cn(SERVICE_PANEL_SOFT, 'p-4 space-y-3')}>
          <div className="flex items-center justify-between">
            <Text variant="d2" className="font-semibold">
              {t('result.heading')}
            </Text>
            {!isSearchPending ? (
              <Text variant="c1" color="basic-5">
                {t('result.count', { count: searchResult.data?.count ?? results.length })}
              </Text>
            ) : null}
          </div>

          {renderResultBody()}
        </section>
      ) : null}

      {searchEnabled && searchResult.isError ? (
        <section className={cn(SERVICE_PANEL_SOFT, 'p-4 text-center')}>
          <Text variant="c1" color="basic-5">
            {t('result.error')}
          </Text>
        </section>
      ) : null}

      {/* Selected species + weaknesses */}
      {selectedSlug ? (
        <section className={cn(SERVICE_PANEL_SOFT, SERVICE_CARD_INTERACTIVE, 'p-4 space-y-4')}>
          {renderSelectedBody()}
        </section>
      ) : (
        <section className={cn(SERVICE_PANEL_SOFT, 'space-y-2 p-5 text-center')}>
          <Text variant="d2" className="block font-bold">
            {t('empty.title')}
          </Text>
          <Text variant="c1" color="basic-5" className="block">
            {t('empty.description')}
          </Text>
        </section>
      )}
    </div>
  );
}
