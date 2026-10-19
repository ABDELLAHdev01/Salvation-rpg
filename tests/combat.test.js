import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  opponents,
  arenaHazards,
  getOrCreateResult,
  getRivalTaunt,
  incrementRivalRecord,
  basePlayerStats,
  getPlayerStats,
} from '../src/core/data/arenaOpponents';

describe('Combat & Arena Domain Logic', () => {
  const mockStorage = {};

  beforeEach(() => {
    vi.restoreAllMocks();
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
    vi.stubGlobal('localStorage', {
      getItem: (key) => mockStorage[key] ?? null,
      setItem: (key, val) => {
        mockStorage[key] = String(val);
      },
      removeItem: (key) => {
        delete mockStorage[key];
      },
      clear: () => {
        Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
      },
    });
  });

  it('contains valid roster of arena opponents with complete combat stats and gear', () => {
    expect(opponents.length).toBeGreaterThan(0);
    opponents.forEach((opponent) => {
      expect(opponent.name).toBeDefined();
      expect(opponent.level).toBeGreaterThan(0);
      expect(opponent.rank).toBeDefined();
      expect(opponent.image).toBeDefined();
      expect(Array.isArray(opponent.gear)).toBe(true);
      expect(opponent.stats.length).toBe(3);

      const labels = opponent.stats.map((s) => s.label);
      expect(labels).toContain('Attack');
      expect(labels).toContain('Defense');
      expect(labels).toContain('Wisdom');
      opponent.stats.forEach((stat) => {
        expect(stat.value).toBeGreaterThan(0);
      });
    });
  });

  it('contains defined combat arena hazards with descriptive effects', () => {
    expect(arenaHazards.length).toBeGreaterThan(0);
    arenaHazards.forEach((hazard) => {
      expect(hazard.name).toBeDefined();
      expect(hazard.effect).toBeDefined();
      expect(hazard.effect.length).toBeGreaterThan(10);
    });
  });

  it('generates deterministic combat result payload structure on victory and defeat', () => {
    const opponent = opponents[0];

    // Simulate victory
    const winSpy = vi.spyOn(Math, 'random').mockReturnValue(0.9);
    const winResult = getOrCreateResult(opponent);
    expect(['Victory', 'Defeat']).toContain(winResult.outcome);
    expect(Array.isArray(winResult.rewards)).toBe(true);
    expect(winResult.rewards.length).toBeGreaterThan(0);
    expect(winResult.highlightReel).toBeDefined();
    expect(winResult.highlightReel.mvpName).toBeDefined();
    expect(winResult.highlightReel.mvpStat).toBeDefined();
    expect(Array.isArray(winResult.highlightReel.moments)).toBe(true);
    winSpy.mockRestore();
  });

  it('returns flavor taunts tailored for rivals once threshold fights are recorded', () => {
    const rivalName = 'Korr the Ironhowl';
    // Initially fewer than 2 fights -> null taunt
    expect(getRivalTaunt(rivalName)).toBeNull();

    // Increment fights to unlock taunt
    incrementRivalRecord(rivalName);
    incrementRivalRecord(rivalName);
    const taunt = getRivalTaunt(rivalName);
    expect(typeof taunt).toBe('string');
    expect(taunt?.length).toBeGreaterThan(5);
  });

  it('scales base combat stats with character housing buffs', () => {
    const defaultStats = getPlayerStats(null);
    const defaultDef = defaultStats.find((s) => s.label === 'Defense');
    // Starter cottage default: +2% Defense (68 * 1.02 = 69)
    expect(defaultDef?.value).toBe(69);

    const houseBuffed = getPlayerStats({ houseId: 'wealthy-house' }); // +5% Defense
    const def = houseBuffed.find((s) => s.label === 'Defense');
    const baseDef = basePlayerStats.find((s) => s.label === 'Defense')?.value ?? 68;
    expect(def?.value).toBe(Math.round(baseDef * 1.05));
  });
});
