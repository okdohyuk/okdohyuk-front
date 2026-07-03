// Pure Pokemon type-chart logic (no React, no 'use client').
// Extracted verbatim from PokemonTypeCalculatorClient.tsx — values unchanged.

// All 18 Pokemon types (Gen 6+)
export const POKEMON_TYPES = [
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

export type PokemonType = (typeof POKEMON_TYPES)[number];

// Official type colors (matching official Pokemon games)
export const TYPE_COLORS: Record<PokemonType, string> = {
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
export const TYPE_CHART: Record<PokemonType, Record<PokemonType, number>> = {
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
export function computeDefenseChart(defenderTypes: PokemonType[]): Record<PokemonType, number> {
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

export function getCellColorClass(mult: number): string {
  if (mult === 4) return 'bg-red-500 text-white';
  if (mult === 2) return 'bg-orange-400 text-white';
  if (mult === 0.5) return 'bg-blue-400 text-white';
  if (mult === 0.25) return 'bg-indigo-500 text-white';
  if (mult === 0) return 'bg-basic-4 text-fg-0';
  return 'text-fg-6';
}

export function getCellLabel(mult: number): string {
  if (mult === 0.5) return '½';
  if (mult === 0.25) return '¼';
  return String(mult);
}

export const EFFECTIVENESS_TIERS = [
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
    colorClass: 'text-fg-4',
    bgClass: 'bg-basic-2',
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
    colorClass: 'text-fg-5',
    bgClass: 'bg-basic-3',
  },
] as const;

/**
 * Group a defense chart by its damage multiplier.
 *
 * Extracted from the calculator's inline `groupedByEffectiveness` memo so the
 * same grouping can be reused by the weakness/team views.
 *
 * @param chart - A defense chart (`computeDefenseChart` output): multiplier per attacking type.
 * @returns Map keyed by multiplier value to the list of attacking types at that multiplier.
 *          Iteration order of types follows `POKEMON_TYPES`.
 */
export function groupByEffectiveness(
  chart: Record<PokemonType, number>,
): Record<number, PokemonType[]> {
  return POKEMON_TYPES.reduce<Record<number, PokemonType[]>>((groups, type) => {
    const mult = chart[type];
    return {
      ...groups,
      [mult]: [...(groups[mult] ?? []), type],
    };
  }, {});
}

/** Per-attacking-type coverage tally for a team. */
export interface TeamCoverageEntry {
  /** The attacking type this entry describes. */
  attacker: PokemonType;
  /** Number of team members whose defense multiplier against this attacker is > 1 (weak). */
  weakCount: number;
  /** Number of team members whose defense multiplier against this attacker is < 1 but > 0 (resist). */
  resistCount: number;
  /** Number of team members whose defense multiplier against this attacker is exactly 0 (immune). */
  immuneCount: number;
}

/** Aggregate defensive coverage for a whole team (max 6 members). */
export interface TeamCoverage {
  /** One entry per attacking type, ordered by `POKEMON_TYPES`. */
  entries: TeamCoverageEntry[];
  /**
   * Attacking types that 2 or more members are simultaneously weak to (shared weaknesses).
   * Ordered by `POKEMON_TYPES`. These are the gaps a Marriland-style team builder flags.
   */
  sharedWeaknesses: PokemonType[];
}

/**
 * Aggregate the defensive type coverage of a team.
 *
 * For each of the 18 attacking types this tallies, across all members, how many are
 * weak (multiplier > 1), resistant (0 < multiplier < 1), and immune (multiplier === 0).
 * It also surfaces "shared weaknesses": attacking types that 2+ members are weak to at once.
 *
 * Pure data only — no UI, no i18n. The caller renders the result.
 *
 * @param memberTypes - Up to 6 members, each described by 1 or 2 defending types
 *                       (e.g. `[['water'], ['fire', 'flying']]`). Inputs beyond 6 are tallied as-is;
 *                       callers should cap the team size before calling.
 * @returns A {@link TeamCoverage} with per-type weak/resist/immune counts and shared weaknesses.
 */
export function computeTeamCoverage(memberTypes: PokemonType[][]): TeamCoverage {
  const memberCharts = memberTypes.map((types) => computeDefenseChart(types));

  const entries: TeamCoverageEntry[] = POKEMON_TYPES.map((attacker) => {
    let weakCount = 0;
    let resistCount = 0;
    let immuneCount = 0;

    memberCharts.forEach((chart) => {
      const mult = chart[attacker];
      if (mult === 0) {
        immuneCount += 1;
      } else if (mult > 1) {
        weakCount += 1;
      } else if (mult < 1) {
        resistCount += 1;
      }
    });

    return { attacker, weakCount, resistCount, immuneCount };
  });

  const sharedWeaknesses = entries
    .filter((entry) => entry.weakCount >= 2)
    .map((entry) => entry.attacker);

  return { entries, sharedWeaknesses };
}
