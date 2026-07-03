import {
  POKEMON_TYPES,
  PokemonType,
  TYPE_CHART,
  computeDefenseChart,
  groupByEffectiveness,
  computeTeamCoverage,
} from '../typeChart';

describe('typeChart', () => {
  describe('TYPE_CHART completeness', () => {
    it('covers all 18 attacking types', () => {
      expect(POKEMON_TYPES).toHaveLength(18);
      expect(Object.keys(TYPE_CHART)).toHaveLength(18);
    });

    it('every attacker has a multiplier for every one of the 18 defenders', () => {
      POKEMON_TYPES.forEach((attacker) => {
        const row = TYPE_CHART[attacker];
        expect(row).toBeDefined();
        expect(Object.keys(row)).toHaveLength(18);
        POKEMON_TYPES.forEach((defender) => {
          const mult = row[defender];
          expect(mult).toBeDefined();
          expect([0, 0.5, 1, 2]).toContain(mult);
        });
      });
    });
  });

  describe('representative multiplier spot checks', () => {
    it('water → fire is 2 (super effective)', () => {
      expect(TYPE_CHART.water.fire).toBe(2);
    });

    it('fire → water is 0.5 (not very effective)', () => {
      expect(TYPE_CHART.fire.water).toBe(0.5);
    });

    it('normal → ghost is 0 (immune)', () => {
      expect(TYPE_CHART.normal.ghost).toBe(0);
    });

    it('ground → flying is 0 (immune)', () => {
      expect(TYPE_CHART.ground.flying).toBe(0);
    });
  });

  describe('computeDefenseChart', () => {
    it('returns the multiplier each attacker deals to a single defending type', () => {
      // water defending: fire 0.5×, grass 2×, electric 2×
      const chart = computeDefenseChart(['water']);
      expect(chart.fire).toBe(0.5);
      expect(chart.grass).toBe(2);
      expect(chart.electric).toBe(2);
    });

    it('multiplies effectiveness across two defending types (4× weakness)', () => {
      // grass/ground both take 2× from ice → 2 * 2 = 4
      const chart = computeDefenseChart(['grass', 'ground']);
      expect(chart.ice).toBe(4);
    });

    it('multiplies effectiveness across two defending types (¼× double resist)', () => {
      // steel/fairy defending: bug deals 0.5× to steel and 0.5× to fairy → 0.5 * 0.5 = 0.25
      const chart = computeDefenseChart(['steel', 'fairy']);
      expect(chart.bug).toBe(0.25);
    });

    it('yields 0 (immunity) when either defending type is immune', () => {
      // flying is immune to ground (0) → any dual type with flying is immune to ground
      const chart = computeDefenseChart(['ground', 'flying']);
      expect(chart.ground).toBe(0);
    });
  });

  describe('groupByEffectiveness', () => {
    it('buckets attacking types by their multiplier', () => {
      const chart = computeDefenseChart(['water']);
      const grouped = groupByEffectiveness(chart);
      // every grouped type belongs to its multiplier bucket
      Object.entries(grouped).forEach(([mult, types]) => {
        (types as PokemonType[]).forEach((type) => {
          expect(chart[type]).toBe(Number(mult));
        });
      });
      // water defending: electric/grass deal 2×; fire/water/ice/steel deal 0.5×
      expect(grouped[2]).toEqual(expect.arrayContaining(['electric', 'grass']));
      expect(grouped[0.5]).toEqual(expect.arrayContaining(['fire', 'ice', 'steel']));
    });

    it('preserves POKEMON_TYPES ordering within a bucket', () => {
      const chart = computeDefenseChart(['normal']);
      const grouped = groupByEffectiveness(chart);
      // normal: only fighting is 2×; the 1× bucket should follow POKEMON_TYPES order
      const oneXBucket = grouped[1];
      const filtered = POKEMON_TYPES.filter((type) => chart[type] === 1);
      expect(oneXBucket).toEqual(filtered);
    });
  });

  describe('computeTeamCoverage', () => {
    it('tallies weak / resist / immune counts per attacking type', () => {
      // Member A: water (weak to electric ×2, grass ×2)
      // Member B: fire (resists fire/grass/ice/bug/steel/fairy ×0.5; weak to water/ground/rock ×2)
      const team: PokemonType[][] = [['water'], ['fire']];
      const coverage = computeTeamCoverage(team);

      const electric = coverage.entries.find((e) => e.attacker === 'electric')!;
      // water weak to electric (2×), fire neutral to electric (1×)
      expect(electric.weakCount).toBe(1);
      expect(electric.resistCount).toBe(0);
      expect(electric.immuneCount).toBe(0);

      const water = coverage.entries.find((e) => e.attacker === 'water')!;
      // water resists water (0.5×), fire weak to water (2×)
      expect(water.weakCount).toBe(1);
      expect(water.resistCount).toBe(1);
    });

    it('identifies shared weaknesses (2+ members weak to the same attacker)', () => {
      // Two grass members are both weak to fire (2×), ice, flying, poison, bug
      const team: PokemonType[][] = [['grass'], ['grass']];
      const coverage = computeTeamCoverage(team);

      expect(coverage.sharedWeaknesses).toContain('fire');
      expect(coverage.sharedWeaknesses).toContain('ice');
      // both grass members resist water (0.5×) → not a shared weakness
      expect(coverage.sharedWeaknesses).not.toContain('water');

      const fire = coverage.entries.find((e) => e.attacker === 'fire')!;
      expect(fire.weakCount).toBe(2);
    });

    it('counts immunity correctly for dual types', () => {
      // ground/flying member is immune to ground (flying nullifies ground)
      const team: PokemonType[][] = [['ground', 'flying']];
      const coverage = computeTeamCoverage(team);
      const ground = coverage.entries.find((e) => e.attacker === 'ground')!;
      expect(ground.immuneCount).toBe(1);
      expect(ground.weakCount).toBe(0);
    });

    it('returns 18 entries ordered by POKEMON_TYPES', () => {
      const coverage = computeTeamCoverage([['normal']]);
      expect(coverage.entries).toHaveLength(18);
      expect(coverage.entries.map((e) => e.attacker)).toEqual([...POKEMON_TYPES]);
    });
  });
});
