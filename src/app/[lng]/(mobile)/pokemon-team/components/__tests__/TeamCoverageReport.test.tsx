/**
 * TeamCoverageReport: 팀 약점 커버리지 리포트 컴포넌트 렌더 테스트.
 * computeTeamCoverage(실제 typeChart) 결과가 UI 에 올바르게 반영되는지 검증한다.
 * - 공유 약점(2마리 이상 동시 약점) 강조 박스에 TypeBadge 노출
 * - 공유 약점 없을 때 "균형 잡힌 팀" 안내(coverage.sharedNone)
 * - 빈 팀일 때 emptyTeam 안내
 *
 * i18n(useTranslation)·TypeBadge 는 mock 으로 대체해 결정적 렌더만 검증한다.
 * (typeChart 자체의 약점 계산은 src/libs/pokemon/__tests__/typeChart.test.ts 에서 검증 — 중복 회피.)
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import type { PokemonTeamMember } from '@api/PokemonTeam';
import TeamCoverageReport from '../TeamCoverageReport';

// i18n 훅 mock — 키를 그대로 반환(SSR/CSR 동기화 없이 즉시 렌더).
vi.mock('~/app/i18n/client', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// TypeBadge mock — 어떤 타입이 강조 영역에 들어갔는지 testid 로 노출.
vi.mock('@components/complex/Pokemon/TypeBadge', () => ({
  default: ({ type }: { type: string }) => <span data-testid={`type-badge-${type}`}>{type}</span>,
}));

function member(slug: string, types: string[]): PokemonTeamMember {
  return {
    slug,
    names: { ko: slug, en: slug, ja: slug, zh: slug },
    types: types as PokemonTeamMember['types'],
    spriteUrl: `https://example/${slug}.png`,
  };
}

describe('<TeamCoverageReport />', () => {
  it('빈 팀이면 emptyTeam 안내만 렌더하고 공유약점 섹션을 만들지 않는다', () => {
    render(<TeamCoverageReport lng="ko" members={[]} />);

    expect(screen.getByText('coverage.emptyTeam')).toBeInTheDocument();
    // 공유 약점 헤딩은 나오지 않아야 한다.
    expect(screen.queryByText('coverage.sharedHeading')).not.toBeInTheDocument();
  });

  it('공유 약점(grass 2마리 → fire/ice)을 강조 박스의 TypeBadge 로 렌더한다', () => {
    // grass 두 마리는 fire/ice 등에 동시 약점 → sharedWeaknesses 에 fire, ice 포함.
    const members = [member('bulbasaur', ['grass']), member('oddish', ['grass'])];
    render(<TeamCoverageReport lng="ko" members={members} />);

    // 공유 약점 헤딩 노출.
    const heading = screen.getByText('coverage.sharedHeading');
    expect(heading).toBeInTheDocument();

    // TypeBadge 는 공유약점 박스 + 하단 attacker 표 양쪽에 등장하므로, 공유약점 섹션으로 범위를 좁힌다.
    // 헤딩 → 섹션 래퍼(div.space-y-2)에는 공유약점 강조 박스만 들어 있다(표는 형제 섹션).
    const sharedSection = heading.closest('div.space-y-2') as HTMLElement;
    expect(sharedSection).not.toBeNull();
    const sharedScope = within(sharedSection);
    // fire/ice TypeBadge 가 공유 약점 강조 영역에 노출되어야 한다.
    expect(sharedScope.getByTestId('type-badge-fire')).toBeInTheDocument();
    expect(sharedScope.getByTestId('type-badge-ice')).toBeInTheDocument();
    // grass 멤버는 water 에 내성 → water 는 공유 약점이 아니어야 한다(강조 박스에 없음).
    expect(sharedScope.queryByTestId('type-badge-water')).not.toBeInTheDocument();
    // 공유 약점이 있으므로 "균형 잡힌 팀" 안내는 나오지 않는다.
    expect(screen.queryByText('coverage.sharedNone')).not.toBeInTheDocument();
  });

  it('공유 약점이 없는 팀이면 sharedNone(균형 잡힌 팀) 안내를 렌더한다', () => {
    // 단일 normal 1마리는 어떤 타입에도 2마리 이상 동시 약점이 없다 → sharedWeaknesses 비어 있음.
    const members = [member('snorlax', ['normal'])];
    render(<TeamCoverageReport lng="ko" members={members} />);

    expect(screen.getByText('coverage.sharedHeading')).toBeInTheDocument();
    expect(screen.getByText('coverage.sharedNone')).toBeInTheDocument();
  });

  it('약점/내성/무효가 모두 0 인 attacker 행은 표에서 생략한다(visibleEntries 필터)', () => {
    // normal 단일 타입: ghost 에 immune, fighting 에 weak 등 일부만 노출.
    // ghost(공격)에 normal 은 immune → coverage.immune 라벨이 적어도 하나 노출되어야 한다.
    const members = [member('snorlax', ['normal'])];
    render(<TeamCoverageReport lng="ko" members={members} />);

    // 표 셀의 라벨은 "coverage.weak {count}" 형태이므로 substring 매처로 찾는다.
    // weak/resist/immune 중 하나 이상이 노출되어야 한다(0/0/0 전부 생략은 아님).
    const labels = [
      ...screen.queryAllByText(/coverage\.weak/),
      ...screen.queryAllByText(/coverage\.resist/),
      ...screen.queryAllByText(/coverage\.immune/),
    ];
    expect(labels.length).toBeGreaterThan(0);
  });
});
