'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Check, Copy, Loader2, Plus, Search, Share2, Trash2, X } from 'lucide-react';
import { Text } from '@components/basic/Text';
import { Input } from '@components/basic/Input';
import { Button } from '@components/basic/Button';
import { cn } from '@utils/cn';
import {
  SERVICE_CARD_INTERACTIVE,
  SERVICE_PANEL_SOFT,
} from '@components/complex/Service/interactiveStyles';
import { useTranslation } from '~/app/i18n/client';
import { Language } from '~/app/i18n/settings';
import useDebounce from '@hooks/useDebounce';
import { useSession } from '@hooks/useSession';
import { useToolTracking } from '@hooks/analytics/useToolTracking';
import { absoluteUrl } from '@libs/shared/agentDiscovery';
import logger from '@utils/logger';
import UserTokenUtil from '@utils/userTokenUtil';
import TypeBadge from '@components/complex/Pokemon/TypeBadge';
import type { PokemonSpecies } from '@api/Pokemon';
import type { PokemonTeam, PokemonTeamMember } from '@api/PokemonTeam';
import { useSearchPokemonSpecies } from '@queries/usePokemonQueries';
import {
  useCreatePokemonTeam,
  useDeletePokemonTeam,
  useMyPokemonTeams,
} from '@queries/usePokemonTeamQueries';
import TeamMemberGrid from './TeamMemberGrid';
import TeamCoverageReport from './TeamCoverageReport';

interface PokemonTeamBuilderClientProps {
  lng: Language;
}

const MAX_TEAM_SIZE = 6;
const SEARCH_MIN_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 350;
const RESULT_LIMIT = 24;

// 공유 링크는 locale prefix 가 포함된 절대 URL 로 구성한다(SITE_URL 기반).
const buildShareLink = (lng: Language, shareId: string) =>
  absoluteUrl(`/${lng}/pokemon-team/share/${shareId}`);

// PokemonSpecies(검색 결과) → PokemonTeamMember(표시·저장용 요약).
// 두 DTO 는 slug/names/types/spriteUrl 필드가 동일하다.
const toMember = (species: PokemonSpecies): PokemonTeamMember => ({
  slug: species.slug,
  names: species.names,
  types: species.types,
  spriteUrl: species.spriteUrl,
});

export default function PokemonTeamBuilderClient({ lng }: PokemonTeamBuilderClientProps) {
  const { t } = useTranslation(lng, 'pokemon-team');
  const { trackInputStarted, trackUse, trackShare } = useToolTracking('pokemon-team', 'utility');
  const { sessionId } = useSession();

  const [query, setQuery] = useState('');
  const [members, setMembers] = useState<PokemonTeamMember[]>([]);
  const [teamName, setTeamName] = useState('');
  const [saveValidationError, setSaveValidationError] = useState<string | null>(null);
  const [savedTeam, setSavedTeam] = useState<PokemonTeam | null>(null);
  const [copied, setCopied] = useState(false);

  // 로그인 토큰: 하이드레이션 안전을 위해 마운트 후 클라이언트에서 읽는다(ShortUrl 선례).
  const [accessToken, setAccessToken] = useState<string | null>(null);
  useEffect(() => {
    setAccessToken(UserTokenUtil.getAccessToken() || null);
  }, []);

  const debouncedQuery = useDebounce(query.trim(), SEARCH_DEBOUNCE_MS);
  const searchEnabled = debouncedQuery.length >= SEARCH_MIN_LENGTH;
  const searchResult = useSearchPokemonSpecies(
    searchEnabled ? debouncedQuery : undefined,
    undefined,
    0,
    RESULT_LIMIT,
    searchEnabled,
  );

  const createMutation = useCreatePokemonTeam();
  const deleteMutation = useDeletePokemonTeam();
  const myTeams = useMyPokemonTeams(accessToken);

  const memberSlugs = useMemo(() => new Set(members.map((m) => m.slug)), [members]);
  const isTeamFull = members.length >= MAX_TEAM_SIZE;

  const getName = useCallback(
    (member: { names: PokemonTeamMember['names'] }) => member.names[lng] ?? member.names.en,
    [lng],
  );

  const handleQueryChange = (value: string) => {
    if (value.length > 0) trackInputStarted();
    setQuery(value);
  };

  const handleAddMember = useCallback((species: PokemonSpecies) => {
    setSaveValidationError(null);
    setMembers((prev) => {
      if (prev.some((m) => m.slug === species.slug)) return prev; // 중복 가드
      if (prev.length >= MAX_TEAM_SIZE) return prev; // 초과 가드
      return [...prev, toMember(species)];
    });
  }, []);

  const handleRemoveMember = useCallback((slug: string) => {
    setMembers((prev) => prev.filter((m) => m.slug !== slug));
  }, []);

  const handleSave = async () => {
    setSaveValidationError(null);
    if (members.length === 0) {
      setSaveValidationError(t('save.needMember'));
      return;
    }
    const trimmedName = teamName.trim();
    if (!trimmedName) {
      setSaveValidationError(t('save.needName'));
      return;
    }

    try {
      const team = await createMutation.mutateAsync({
        request: { name: trimmedName, members: members.map((m) => m.slug) },
        sessionId,
      });
      setSavedTeam(team);
      setCopied(false);
      trackUse({
        action_type: 'save',
        success: true,
        member_count: members.length,
      });
    } catch (err) {
      logger.error('포켓몬 팀 저장 실패', err);
      trackUse({ action_type: 'save', success: false });
    }
  };

  const handleCopyShareLink = async () => {
    if (!savedTeam) return;
    const link = buildShareLink(lng, savedTeam.shareId);
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
      trackShare({ channel: 'clipboard' });
    } catch (err) {
      logger.error('공유 링크 복사 실패', err);
    }
  };

  const handleLoadTeam = useCallback((team: PokemonTeam) => {
    setMembers(team.members);
    setTeamName(team.name);
    setSavedTeam(null);
    setSaveValidationError(null);
  }, []);

  const handleDeleteTeam = (id: number) => {
    // eslint-disable-next-line no-alert
    if (typeof window !== 'undefined' && !window.confirm(t('myTeams.deleteConfirm'))) return;
    deleteMutation.mutate(id);
  };

  const results = searchResult.data?.results ?? [];
  const showResults = searchEnabled && !searchResult.isError;
  const isSearchPending = searchEnabled && searchResult.isPending;
  const isSaving = createMutation.isPending;
  const shareLink = savedTeam ? buildShareLink(lng, savedTeam.shareId) : '';
  const myTeamsResults = myTeams.data?.results ?? [];

  const renderSearchResultBody = () => {
    if (isSearchPending) {
      return (
        <Text variant="c1" color="basic-5" className="block py-2 text-center">
          {t('search.loading')}
        </Text>
      );
    }
    if (results.length === 0) {
      return (
        <Text variant="c1" color="basic-5" className="block py-2 text-center">
          {t('search.empty')}
        </Text>
      );
    }
    return (
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {results.map((species) => {
          const added = memberSlugs.has(species.slug);
          const disableAdd = added || isTeamFull;
          return (
            <li key={species.slug} className="list-none">
              <button
                type="button"
                onClick={() => handleAddMember(species)}
                disabled={disableAdd}
                className={cn(
                  SERVICE_PANEL_SOFT,
                  SERVICE_CARD_INTERACTIVE,
                  'flex w-full items-center gap-3 rounded-xl p-2.5 text-left',
                  disableAdd && 'cursor-not-allowed opacity-60',
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
                <span className="shrink-0 text-fg-5">
                  {added ? (
                    <Check className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    );
  };

  const renderMyTeamsBody = () => {
    if (!accessToken) {
      return (
        <Text variant="c1" color="basic-5" className="block">
          {t('myTeams.loginHint')}
        </Text>
      );
    }
    if (myTeams.isPending) {
      return (
        <Text variant="c1" color="basic-5" className="block py-2 text-center">
          {t('myTeams.loading')}
        </Text>
      );
    }
    if (myTeams.isError) {
      return (
        <Text variant="c1" color="basic-5" className="block py-2 text-center">
          {t('myTeams.error')}
        </Text>
      );
    }
    if (myTeamsResults.length === 0) {
      return (
        <Text variant="c1" color="basic-5" className="block py-2 text-center">
          {t('myTeams.empty')}
        </Text>
      );
    }
    return (
      <ul className="space-y-2">
        {myTeamsResults.map((team) => (
          <li
            key={team.id}
            className={cn(SERVICE_PANEL_SOFT, 'flex items-center gap-3 rounded-xl p-2.5')}
          >
            <div className="flex -space-x-2">
              {team.members.slice(0, 6).map((member) => (
                <Image
                  key={member.slug}
                  src={member.spriteUrl}
                  alt={getName(member)}
                  width={32}
                  height={32}
                  className="h-8 w-8 shrink-0 rounded-full border border-basic-3 bg-basic-0 object-contain"
                  unoptimized
                />
              ))}
            </div>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-fg-1">
              {team.name}
            </span>
            <button
              type="button"
              onClick={() => handleLoadTeam(team)}
              className="shrink-0 rounded-md border border-basic-3 bg-basic-0/80 px-2.5 py-1.5 text-xs font-semibold text-fg-3 transition-colors hover:border-point-2/70 hover:text-point-fg"
            >
              {t('myTeams.load')}
            </button>
            <button
              type="button"
              aria-label={t('myTeams.delete')}
              onClick={() => handleDeleteTeam(team.id)}
              disabled={deleteMutation.isPending}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-fg-6 transition-colors hover:bg-red-100 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-500/20"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="w-full space-y-5">
      {/* 검색 + 추가 */}
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
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
              onClick={() => setQuery('')}
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
        {isTeamFull ? (
          <Text variant="c1" className="block font-medium text-amber-600 dark:text-amber-400">
            {t('team.full')}
          </Text>
        ) : null}

        {showResults ? <div className="space-y-2">{renderSearchResultBody()}</div> : null}

        {searchEnabled && searchResult.isError ? (
          <Text variant="c1" color="basic-5" className="block py-2 text-center">
            {t('search.error')}
          </Text>
        ) : null}
      </section>

      {/* 내 팀 (멤버 그리드) */}
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <Text variant="d2" className="font-semibold">
          {t('team.heading', { count: members.length })}
        </Text>
        <TeamMemberGrid lng={lng} members={members} onRemove={handleRemoveMember} />
      </section>

      {/* 팀 약점 커버리지 */}
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <Text variant="d2" className="font-semibold">
          {t('coverage.heading')}
        </Text>
        <TeamCoverageReport lng={lng} members={members} />
      </section>

      {/* 저장 + 공유 */}
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <Text variant="d2" className="font-semibold">
          {t('save.heading')}
        </Text>
        <div className="space-y-2">
          <label htmlFor="pokemon-team-name" className="text-sm font-semibold text-fg-1">
            {t('save.nameLabel')}
          </label>
          <Input
            id="pokemon-team-name"
            type="text"
            value={teamName}
            onChange={(event) => setTeamName(event.target.value)}
            placeholder={t('save.namePlaceholder')}
            disabled={isSaving}
            className="min-h-11 rounded-2xl text-sm md:text-base"
          />
          <Text variant="c1" color="basic-5" className="block">
            {t('save.anonymousHint')}
          </Text>
        </div>

        {saveValidationError ? (
          <p className="text-xs text-red-500" role="alert">
            {saveValidationError}
          </p>
        ) : null}
        {createMutation.isError ? (
          <p className="text-sm text-red-500" role="alert">
            {t('save.error')}
          </p>
        ) : null}

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            analyticsKey="pokemon_team_save"
            className="min-w-[120px]"
          >
            {isSaving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('save.submitting')}
              </span>
            ) : (
              t('save.submit')
            )}
          </Button>
        </div>

        {savedTeam ? (
          <div
            className={cn(SERVICE_PANEL_SOFT, 'space-y-2 p-3')}
            aria-label={t('save.shareLabel')}
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              <Check className="h-4 w-4" />
              {t('save.success')}
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-fg-1">
              <Share2 className="h-4 w-4" />
              {t('save.shareLabel')}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <a
                href={shareLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 break-all rounded-md border border-basic-3 bg-basic-0 px-3 py-2 text-sm text-point-fg underline-offset-2 hover:underline"
              >
                {shareLink}
              </a>
              <Button
                type="button"
                onClick={handleCopyShareLink}
                analyticsKey="pokemon_team_copy_share"
                className="sm:min-w-[96px]"
              >
                <span className="inline-flex items-center gap-1">
                  <Copy className="h-4 w-4" />
                  {copied ? t('save.copied') : t('save.copy')}
                </span>
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      {/* 내 저장한 팀 (로그인 시) */}
      <section className={cn(SERVICE_PANEL_SOFT, 'space-y-3 p-4')}>
        <Text variant="d2" className="font-semibold">
          {t('myTeams.heading')}
        </Text>
        {renderMyTeamsBody()}
      </section>
    </div>
  );
}
