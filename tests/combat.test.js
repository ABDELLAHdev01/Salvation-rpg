import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  opponents,
  arenaHazards,
  getOrCreateResult,
  getRivalTaunt,
  incrementRivalRecord,
  basePlayerStats,
  getPlayerStats,
  combatStances,
  getCombatStanceById,
  getStoredStance,
  setStoredStance,
  getPlayerEquippedGear,
} from '../src/core/data/arenaOpponents';
import { gearStatsCatalog, getGearStatTotals } from '../src/core/data/gearData';

describe('Combat & Arena Domain Logic', () => {
  const mockStorage = {};
  const mockSessionStorage = {};

  beforeEach(() => {
    vi.restoreAllMocks();
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
    Object.keys(mockSessionStorage).forEach((k) => delete mockSessionStorage[k]);

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

    vi.stubGlobal('sessionStorage', {
      getItem: (key) => mockSessionStorage[key] ?? null,
      setItem: (key, val) => {
        mockSessionStorage[key] = String(val);
      },
      removeItem: (key) => {
        delete mockSessionStorage[key];
      },
      clear: () => {
        Object.keys(mockSessionStorage).forEach((k) => delete mockSessionStorage[k]);
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
    expect(winResult.combatStats).toBeDefined();
    expect(winResult.combatStats.playerPower).toBeGreaterThan(0);
    expect(winResult.combatStats.opponentPower).toBeGreaterThan(0);
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

  it('correctly aggregates gear statistics from player inventory into combat stats', () => {
    const testProfile = {
      houseId: 'starter-cottage',
      inventory: {
        'gear-runebound-staff': 1,
        'gear-aegis-dawn': 1,
        'gear-shadowleaf-cloak': 1,
      },
    };

    const equipped = getPlayerEquippedGear(testProfile);
    expect(equipped.length).toBe(3);

    const gearTotals = getGearStatTotals(testProfile);
    expect(gearTotals.attack).toBe(
      gearStatsCatalog['gear-runebound-staff'].attack +
      gearStatsCatalog['gear-aegis-dawn'].attack +
      gearStatsCatalog['gear-shadowleaf-cloak'].attack
    );
    expect(gearTotals.wisdom).toBe(
      gearStatsCatalog['gear-runebound-staff'].wisdom +
      gearStatsCatalog['gear-aegis-dawn'].wisdom +
      gearStatsCatalog['gear-shadowleaf-cloak'].wisdom
    );

    const buffedPlayerStats = getPlayerStats(testProfile);
    const atk = buffedPlayerStats.find((s) => s.label === 'Attack');
    const wis = buffedPlayerStats.find((s) => s.label === 'Wisdom');

    expect(atk?.gearBonus).toBe(gearTotals.attack);
    expect(wis?.gearBonus).toBe(gearTotals.wisdom);
    expect(wis?.value).toBe(54 + gearTotals.wisdom);
  });

  it('defines 3 distinct combat stances modifying attack, defense, and wisdom multipliers', () => {
    expect(combatStances.length).toBe(3);

    const assault = getCombatStanceById('blazing-assault');
    expect(assault.modifiers.attack).toBe(1.15);
    expect(assault.modifiers.defense).toBe(0.95);

    const bastion = getCombatStanceById('iron-bastion');
    expect(bastion.modifiers.defense).toBe(1.20);
    expect(bastion.modifiers.attack).toBe(0.90);

    const focus = getCombatStanceById('arcane-focus');
    expect(focus.modifiers.wisdom).toBe(1.25);

    // Test session stance storage
    setStoredStance('iron-bastion');
    expect(getStoredStance()).toBe('iron-bastion');

    // Test player stats under iron-bastion stance
    const bastionStats = getPlayerStats(null, 'iron-bastion');
    const defStat = bastionStats.find((s) => s.label === 'Defense');
    // Base 68 * 1.02 (starter cottage) * 1.20 (bastion) = 83
    expect(defStat?.value).toBe(Math.round(68 * 1.02 * 1.2));
  });

  it('evaluates tactical auto-battler result incorporating player gear, stance advantage, and hazards', () => {
    const opponent = opponents[0];
    const profile = {
      houseId: 'starter-cottage',
      inventory: {
        'gear-embersteel-blade': 1,
        'gear-aegis-dawn': 1,
        'contract-sigil': 2,
      },
    };

    const hazard = { name: 'Searing Wind', effect: 'Burning gusts reduce defense by 6%.' };
    const result = getOrCreateResult(opponent, {
      profile,
      stanceId: 'blazing-assault',
      hazard,
    });

    expect(result.outcome).toBeDefined();
    expect(result.combatStats.stanceUsed).toBe('Blazing Assault');
    expect(result.combatStats.playerPower).toBeGreaterThan(150);
    expect(result.highlightReel.moments.length).toBe(3);
    expect(result.highlightReel.moments[0].detail).toContain('Embersteel Blade');
  });
});
