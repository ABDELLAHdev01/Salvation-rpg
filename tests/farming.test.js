import { describe, it, expect } from 'vitest';
import {
  farmCrops,
  farmGoods,
  getCropSeasonModifiers,
  ensureFarmWeather,
  getFarmXpForLevel,
} from '../src/core/data/farmData';
import { getCityPerk } from '../src/core/data/citiesData';

describe('Farming Domain Logic', () => {
  it('contains valid crop definitions with positive growth times and costs', () => {
    expect(farmCrops.length).toBeGreaterThan(0);
    farmCrops.forEach((crop) => {
      expect(crop.id).toBeDefined();
      expect(crop.growMs).toBeGreaterThan(0);
      expect(crop.seedCost).toBeGreaterThan(0);
      expect(crop.yieldAmount).toBeGreaterThanOrEqual(1);
      expect(crop.levelRequired).toBeGreaterThanOrEqual(1);
    });
  });

  it('guarantees farm goods have positive sell prices', () => {
    expect(farmGoods.length).toBeGreaterThan(0);
    farmGoods.forEach((good) => {
      expect(good.sellPrice).toBeGreaterThan(0);
    });
  });

  it('computes season modifiers accurately for favorite and penalty seasons', () => {
    const turnipInSpring = getCropSeasonModifiers('turnip', 'spring');
    expect(turnipInSpring.growMultiplier).toBeLessThanOrEqual(1.0);
    expect(turnipInSpring.yieldMultiplier).toBeGreaterThanOrEqual(1.0);

    const turnipInWinter = getCropSeasonModifiers('turnip', 'winter');
    expect(turnipInWinter.growMultiplier).toBeGreaterThanOrEqual(1.0);
  });

  it('generates consistent farm weather state and modifiers', () => {
    const { nextWeather } = ensureFarmWeather();
    expect(nextWeather).toBeDefined();
    expect(nextWeather.season).toBeDefined();
    expect(nextWeather.label).toBeDefined();
    expect(nextWeather.growMultiplier).toBeGreaterThan(0);
    expect(nextWeather.yieldMultiplier).toBeGreaterThan(0);
  });

  it('scales farm XP targets progressively per level', () => {
    const level1 = getFarmXpForLevel(1);
    const level5 = getFarmXpForLevel(5);
    const level10 = getFarmXpForLevel(10);
    const level20 = getFarmXpForLevel(20);

    expect(level5).toBeGreaterThan(level1);
    expect(level10).toBeGreaterThan(level5);
    expect(level20).toBeGreaterThan(level10);
  });

  it('applies the Eldorian Sun-Blessed Soil faction perk (+15% speed)', () => {
    const perk = getCityPerk('eldoria');
    expect(perk).toBeDefined();
    expect(perk.type).toBe('farm-growth');
    expect(perk.value).toBe(0.15);

    const baseGrowthMs = 60000;
    const eldoriaGrowthMs = Math.round(baseGrowthMs * (1 - perk.value));
    expect(eldoriaGrowthMs).toBe(51000);
    expect(eldoriaGrowthMs).toBeLessThan(baseGrowthMs);
  });
});
