import { describe, it, expect } from 'vitest';
import { farmCrops } from '../src/core/data/farmData';
import { miningOres } from '../src/core/data/miningData';

describe('2D Interactive World Scene Logic', () => {
  describe('Crop Growth Stage Progression Engine', () => {
    it('computes accurate growth stages corresponding to elapsed game time', () => {
      const turnip = farmCrops.find((c) => c.id === 'turnip');
      expect(turnip).toBeDefined();
      const growDuration = turnip.growMs; // 3 minutes

      const computeStage = (elapsed) => {
        const progress = Math.min(1.0, elapsed / growDuration);
        if (progress >= 1.0) return 4; // Mature / Harvestable
        if (progress >= 0.7) return 3; // Flowering / Budding
        if (progress >= 0.35) return 2; // Seedling
        if (progress > 0) return 1; // Sprout
        return 0; // Empty
      };

      expect(computeStage(0)).toBe(0);
      expect(computeStage(10000)).toBe(1); // 10s elapsed -> Sprout
      expect(computeStage(70000)).toBe(2); // 70s / 180s = ~38% -> Seedling
      expect(computeStage(140000)).toBe(3); // 140s / 180s = ~77% -> Growing plant
      expect(computeStage(180000)).toBe(4); // 180s / 180s = 100% -> Mature
      expect(computeStage(250000)).toBe(4); // Overdue -> Mature
    });

    it('ensures all 5 crop varieties define valid grow times and harvest items', () => {
      expect(farmCrops.length).toBe(5);
      const cropIds = farmCrops.map((c) => c.id);
      expect(cropIds).toEqual(['turnip', 'wheat', 'herb', 'moonberry', 'sunroot']);

      farmCrops.forEach((crop) => {
        expect(crop.growMs).toBeGreaterThan(0);
        expect(crop.yieldAmount).toBeGreaterThanOrEqual(3);
        expect(crop.seedCost).toBeGreaterThan(0);
      });
    });
  });

  describe('2D Cavern Ore Node Durability & Damage Progression', () => {
    it('accurately transitions mineral boulders through visual damage stages', () => {
      const computeDamageState = (current, max) => {
        const pct = Math.round((current / max) * 100);
        if (pct <= 0) return 'depleted';
        if (pct <= 35) return 'deeply_cracked';
        if (pct <= 70) return 'fractured';
        return 'pristine';
      };

      const maxDurability = 100;
      expect(computeDamageState(100, maxDurability)).toBe('pristine');
      expect(computeDamageState(85, maxDurability)).toBe('pristine');
      expect(computeDamageState(65, maxDurability)).toBe('fractured');
      expect(computeDamageState(30, maxDurability)).toBe('deeply_cracked');
      expect(computeDamageState(0, maxDurability)).toBe('depleted');
      expect(computeDamageState(-15, maxDurability)).toBe('depleted');
    });

    it('validates ore node catalog properties for interactive cave veins', () => {
      const iron = miningOres.find((o) => o.id === 'iron');
      expect(iron).toBeDefined();
      expect(iron.durability).toBe(60);
      expect(iron.tier).toBe(1);

      const copper = miningOres.find((o) => o.id === 'copper');
      expect(copper).toBeDefined();
      expect(copper.durability).toBe(65);

      const gold = miningOres.find((o) => o.id === 'gold');
      expect(gold).toBeDefined();
      expect(gold.durability).toBe(115);
      expect(gold.tier).toBe(3);

      const geode = miningOres.find((o) => o.id === 'mystery-geode');
      expect(geode).toBeDefined();
      expect(geode.durability).toBe(95);
    });
  });
});
