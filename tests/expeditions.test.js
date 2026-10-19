import { describe, it, expect, vi } from 'vitest';
import {
  expeditionLocations,
  getExpeditionLocation,
  rollExpeditionRewards,
} from '../src/core/data/expeditionData';
import { getActiveEstateBuffs } from '../src/core/data/housingData';

describe('Expedition Domain Logic', () => {
  it('contains valid location configurations with consistent tiers and durations', () => {
    expect(expeditionLocations.length).toBeGreaterThan(0);
    expeditionLocations.forEach((location) => {
      expect(location.id).toBeDefined();
      expect(location.name).toBeDefined();
      expect(location.levelRequired).toBeGreaterThanOrEqual(1);
      expect(location.durationMs).toBeGreaterThan(0);
      expect(location.minGold).toBeLessThanOrEqual(location.maxGold);
      expect(location.minXp).toBeLessThanOrEqual(location.maxXp);
      expect(location.minGold).toBeGreaterThan(0);
      expect(location.minXp).toBeGreaterThan(0);
    });
  });

  it('retrieves locations correctly by ID and handles invalid queries', () => {
    const ridge = getExpeditionLocation('sunken-ridge');
    expect(ridge).toBeDefined();
    expect(ridge?.name).toBe('Sunken Ridge');

    const invalid = getExpeditionLocation('nonexistent-abyss');
    expect(invalid).toBeNull();
  });

  it('rolls rewards strictly within defined min and max boundaries', () => {
    const ridge = getExpeditionLocation('sunken-ridge');
    expect(ridge).toBeDefined();

    for (let i = 0; i < 20; i++) {
      const reward = rollExpeditionRewards(ridge);
      expect(reward.gold).toBeGreaterThanOrEqual(ridge.minGold);
      expect(reward.gold).toBeLessThanOrEqual(ridge.maxGold);
      expect(reward.xp).toBeGreaterThanOrEqual(ridge.minXp);
      expect(reward.xp).toBeLessThanOrEqual(ridge.maxXp);
      expect(typeof reward.items).toBe('object');
    }
  });

  it('returns zeroed payload when given invalid location input', () => {
    const emptyResult = rollExpeditionRewards(null);
    expect(emptyResult).toEqual({ gold: 0, xp: 0, items: {} });
  });

  it('awards biome-specific items when rolling expedition salvage', () => {
    const fen = getExpeditionLocation('luminous-fen');
    expect(fen).toBeDefined();
    const fenReward = rollExpeditionRewards(fen);
    expect(fenReward.items['turnip-stew']).toBe(1);

    const ridge = getExpeditionLocation('sunken-ridge');
    const ridgeReward = rollExpeditionRewards(ridge);
    expect(ridgeReward.items['silver']).toBeGreaterThanOrEqual(1);
  });

  it('rolls mystery geode discoveries when rng threshold is met', () => {
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const location = expeditionLocations[0];
    const reward = rollExpeditionRewards(location);
    expect(reward.items['mystery-geode']).toBe(1);
    spy.mockRestore();
  });

  it('correctly calculates amplified rewards with estate interior buffs', () => {
    const location = getExpeditionLocation('sunken-ridge');
    expect(location).toBeDefined();

    const mockProfileWithAmenities = {
      estateAmenities: ['hearth-fire', 'vault-coffer'],
    };
    const buffs = getActiveEstateBuffs(mockProfileWithAmenities);
    expect(buffs.xpBonus).toBe(5);
    expect(buffs.goldBonus).toBe(5);

    const baseReward = { gold: 200, xp: 100 };
    const adjustedGold = Math.round(baseReward.gold * (1 + buffs.goldBonus / 100));
    const adjustedXp = Math.round(baseReward.xp * (1 + buffs.xpBonus / 100));

    expect(adjustedGold).toBe(210);
    expect(adjustedXp).toBe(105);
  });
});
