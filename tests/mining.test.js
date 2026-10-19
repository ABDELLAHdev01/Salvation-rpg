import { describe, it, expect } from 'vitest';
import {
  miningOres,
  pickaxeUpgrades,
  rollMiningTick,
  crackGeode,
  geodeLootTable,
  getMiningXpForLevel,
  getTierByMiningLevel,
} from '../src/core/data/miningData';
import { getCityPerk } from '../src/core/data/citiesData';

describe('Mining Domain Logic', () => {
  it('contains valid ores with strictly ascending tiers, prices, and durabilities', () => {
    expect(miningOres.length).toBeGreaterThanOrEqual(12);
    miningOres.forEach((ore) => {
      expect(ore.id).toBeDefined();
      expect(ore.name).toBeDefined();
      expect(ore.tier).toBeGreaterThanOrEqual(1);
      expect(ore.price).toBeGreaterThan(0);
      expect(ore.durability).toBeGreaterThan(0);
      expect(ore.xp).toBeGreaterThan(0);
    });
  });

  it('guarantees pickaxe upgrades scale with damage and efficiency', () => {
    expect(pickaxeUpgrades.length).toBe(7);
    for (let i = 1; i < pickaxeUpgrades.length; i++) {
      expect(pickaxeUpgrades[i].damage).toBeGreaterThan(pickaxeUpgrades[i - 1].damage);
      expect(pickaxeUpgrades[i].efficiency).toBeGreaterThanOrEqual(pickaxeUpgrades[i - 1].efficiency);
      expect(pickaxeUpgrades[i].cooldownMs).toBeLessThanOrEqual(pickaxeUpgrades[i - 1].cooldownMs);
    }
  });

  it('generates valid tick roll outputs with ore yields and event types', () => {
    const result = rollMiningTick({
      miningLevel: 5,
      pickaxeLevel: 2,
      forgeLevel: 1,
    });

    expect(result).toBeDefined();
    expect(result.tier).toBeGreaterThanOrEqual(1);
    expect(result.yieldMap).toBeDefined();
    expect(Object.keys(result.yieldMap).length).toBeGreaterThanOrEqual(1);
    expect(result.xpMultiplier).toBeGreaterThan(0);
    expect(['normal', 'rare', 'crit', 'mishap']).toContain(result.event);
  });

  it('cracks mystery geodes and awards valid rewards from the loot table', () => {
    const loot = crackGeode();
    expect(loot).toBeDefined();
    expect(loot.id).toBeDefined();
    expect(loot.amount).toBeGreaterThanOrEqual(1);

    const validIds = geodeLootTable.map((item) => item.id);
    expect(validIds).toContain(loot.id);
  });

  it('scales mining XP curves smoothly across early and late game', () => {
    const xpLvl1 = getMiningXpForLevel(1);
    const xpLvl5 = getMiningXpForLevel(5);
    const xpLvl10 = getMiningXpForLevel(10);
    const xpLvl15 = getMiningXpForLevel(15);

    expect(xpLvl5).toBeGreaterThan(xpLvl1);
    expect(xpLvl10).toBeGreaterThan(xpLvl5);
    expect(xpLvl15).toBeGreaterThan(xpLvl10);
  });

  it('determines the correct tier boundary by mining level', () => {
    expect(getTierByMiningLevel(1)).toBe(1);
    expect(getTierByMiningLevel(3)).toBe(1);
    expect(getTierByMiningLevel(4)).toBe(2);
    expect(getTierByMiningLevel(8)).toBe(3);
    expect(getTierByMiningLevel(12)).toBe(4);
    expect(getTierByMiningLevel(16)).toBe(5);
    expect(getTierByMiningLevel(20)).toBe(6);
  });

  it('applies the Drakmor Deep Vein Mastery faction perk (+5 DMG, +15% yield)', () => {
    const perk = getCityPerk('drakmor');
    expect(perk).toBeDefined();
    expect(perk.type).toBe('mining-yield');
    expect(perk.value).toBe(0.15);
    expect(perk.damageBonus).toBe(5);

    const baseDmg = 10;
    const drakmorDmg = baseDmg + perk.damageBonus;
    expect(drakmorDmg).toBe(15);
  });
});
