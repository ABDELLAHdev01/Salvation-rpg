import { describe, it, expect } from 'vitest';
import {
  housingTiers,
  getHousingTierById,
  estateAmenities,
  getEstateAmenityById,
  getActiveEstateBuffs,
} from '../src/core/data/housingData';
import { getPlayerStats, basePlayerStats } from '../src/core/data/arenaOpponents';

describe('Housing & Residence Domain Logic', () => {
  it('defines 8 ascending housing tiers with complete lore and mechanical perks', () => {
    expect(housingTiers.length).toBe(8);

    housingTiers.forEach((house) => {
      expect(house.id).toBeDefined();
      expect(house.name).toBeDefined();
      expect(house.tier).toBeDefined();
      expect(house.levelRequired).toBeGreaterThanOrEqual(1);
      expect(house.price).toBeGreaterThanOrEqual(0);
      expect(house.image).toBeDefined();
      expect(house.description).toBeDefined();
      expect(house.description.length).toBeGreaterThan(20);
      expect(house.effect).toBeDefined();
      expect(['Defense', 'Wisdom', 'Attack']).toContain(house.effect.stat);
      expect(house.effect.percent).toBeGreaterThan(0);
    });
  });

  it('guarantees starter cottage is free and accessible at level 1', () => {
    const starter = getHousingTierById('starter-cottage');
    expect(starter).toBeDefined();
    expect(starter?.price).toBe(0);
    expect(starter?.levelRequired).toBe(1);
  });

  it('retrieves housing tiers by ID correctly', () => {
    const palace = getHousingTierById('mythic-palace');
    expect(palace).toBeDefined();
    expect(palace?.name).toBe('Mythic Palace');
    expect(palace?.levelRequired).toBe(30);

    const unknown = getHousingTierById('nonexistent-castle');
    expect(unknown).toBeUndefined();
  });

  it('strictly enforces progression scaling across tiers', () => {
    for (let i = 1; i < housingTiers.length; i++) {
      const prev = housingTiers[i - 1];
      const curr = housingTiers[i];
      expect(curr.levelRequired).toBeGreaterThanOrEqual(prev.levelRequired);
      expect(curr.price).toBeGreaterThan(prev.price);
    }
  });

  it('applies residence stat multipliers accurately to combat profiles', () => {
    // Default / Starter cottage (2% Defense)
    const starterStats = getPlayerStats({ houseId: 'starter-cottage' });
    const defStat = starterStats.find((s) => s.label === 'Defense');
    const baseDef = basePlayerStats.find((s) => s.label === 'Defense')?.value ?? 68;
    expect(defStat?.value).toBe(Math.round(baseDef * 1.02));

    // Noble residence (6% Attack)
    const nobleStats = getPlayerStats({ houseId: 'noble-residence' });
    const atkStat = nobleStats.find((s) => s.label === 'Attack');
    const baseAtk = basePlayerStats.find((s) => s.label === 'Attack')?.value ?? 74;
    expect(atkStat?.value).toBe(Math.round(baseAtk * 1.06));

    // Comfortable house (4% Wisdom)
    const comfyStats = getPlayerStats({ houseId: 'comfortable-house' });
    const wisStat = comfyStats.find((s) => s.label === 'Wisdom');
    const baseWis = basePlayerStats.find((s) => s.label === 'Wisdom')?.value ?? 54;
    expect(wisStat?.value).toBe(Math.round(baseWis * 1.04));

    // Mythic palace (10% Defense)
    const mythicStats = getPlayerStats({ houseId: 'mythic-palace' });
    const mythicDef = mythicStats.find((s) => s.label === 'Defense');
    expect(mythicDef?.value).toBe(Math.round(baseDef * 1.10));
  });

  it('defines 6 interior estate amenities with complete configuration', () => {
    expect(estateAmenities.length).toBe(6);

    estateAmenities.forEach((amenity) => {
      expect(amenity.id).toBeDefined();
      expect(amenity.name).toBeDefined();
      expect(amenity.icon).toBeDefined();
      expect(amenity.category).toBeDefined();
      expect(amenity.price).toBeGreaterThan(0);
      expect(amenity.levelRequired).toBeGreaterThan(0);
      expect(amenity.buff).toBeDefined();
      expect(amenity.stat).toBeDefined();
      expect(amenity.percent).toBeGreaterThan(0);
      expect(amenity.description).toBeDefined();
    });
  });

  it('retrieves estate amenities by ID correctly', () => {
    const hearth = getEstateAmenityById('hearth-fire');
    expect(hearth).toBeDefined();
    expect(hearth?.name).toBe('Eternal Hearthfire');
    expect(hearth?.percent).toBe(5);

    const unknown = getEstateAmenityById('nonexistent-relic');
    expect(unknown).toBeUndefined();
  });

  it('aggregates active estate buffs accurately', () => {
    const emptyBuffs = getActiveEstateBuffs({});
    expect(emptyBuffs.xpBonus).toBe(0);
    expect(emptyBuffs.miningBonus).toBe(0);
    expect(emptyBuffs.attackBonus).toBe(0);

    const profileWithAmenities = {
      estateAmenities: ['hearth-fire', 'delvers-trophy', 'training-dummy'],
    };
    const buffs = getActiveEstateBuffs(profileWithAmenities);
    expect(buffs.xpBonus).toBe(5);
    expect(buffs.miningBonus).toBe(8);
    expect(buffs.attackBonus).toBe(6);
  });

  it('applies interior amenity buffs in conjunction with housing combat stats', () => {
    // Base Attack: 74, Noble Residence: +6% Attack, Training Dummy: +6% Attack -> 74 * 1.12 = 82.88 -> 83
    const profile = {
      houseId: 'noble-residence',
      estateAmenities: ['training-dummy'],
    };
    const stats = getPlayerStats(profile);
    const atkStat = stats.find((s) => s.label === 'Attack');
    expect(atkStat?.value).toBe(Math.round(74 * 1.12));
  });
});
