import { describe, it, expect } from 'vitest';
import {
  guildOrders,
  getGuildOrder,
  calculateGuildRank,
  guildTithes,
} from '../src/core/data/guildData';

describe('Guild & Fellowship Domain Logic', () => {
  it('contains the three canonical orders aligned with bastions', () => {
    expect(guildOrders.eldoria).toBeDefined();
    expect(guildOrders.valoria).toBeDefined();
    expect(guildOrders.drakmor).toBeDefined();

    Object.values(guildOrders).forEach((order) => {
      expect(order.orderName).toBeDefined();
      expect(order.bastion).toBeDefined();
      expect(order.motto).toBeDefined();
      expect(order.crest).toBeDefined();
      expect(order.bannerPerk).toBeDefined();
      expect(order.rankThresholds.length).toBeGreaterThanOrEqual(4);
      expect(order.companions.length).toBeGreaterThanOrEqual(3);

      order.companions.forEach((companion) => {
        expect(companion.name).toBeDefined();
        expect(companion.title).toBeDefined();
        expect(companion.role).toBeDefined();
        expect(companion.avatar).toBeDefined();
        expect(companion.status).toBeDefined();
      });
    });
  });

  it('retrieves orders by city ID with case-insensitivity and safe fallbacks', () => {
    expect(getGuildOrder('eldoria').orderName).toBe('Verdant Order of the Spire');
    expect(getGuildOrder('VALORIA').orderName).toBe('Dawnforged Vanguard');
    expect(getGuildOrder('drakmor').orderName).toBe('Deepstone Ironclad');
    expect(getGuildOrder('unknown-city').orderName).toBe('Dawnforged Vanguard');
    expect(getGuildOrder(null).orderName).toBe('Dawnforged Vanguard');
  });

  it('calculates guild rank titles based on renown thresholds', () => {
    const eldoria = guildOrders.eldoria;
    expect(calculateGuildRank(0, eldoria)).toBe('Spire Initiate');
    expect(calculateGuildRank(99, eldoria)).toBe('Spire Initiate');
    expect(calculateGuildRank(100, eldoria)).toBe('Leafwarden');
    expect(calculateGuildRank(299, eldoria)).toBe('Leafwarden');
    expect(calculateGuildRank(300, eldoria)).toBe('Spire Sentinel');
    expect(calculateGuildRank(600, eldoria)).toBe('High Bloomkeeper');
    expect(calculateGuildRank(1200, eldoria)).toBe('High Bloomkeeper');

    const valoria = guildOrders.valoria;
    expect(calculateGuildRank(0, valoria)).toBe('Shieldbearer');
    expect(calculateGuildRank(150, valoria)).toBe('Dawn Knight');
    expect(calculateGuildRank(350, valoria)).toBe('Solar Paladin');
    expect(calculateGuildRank(700, valoria)).toBe('Grand Justiciar');
  });

  it('contains valid tithe options with balanced renown and sigil rewards', () => {
    expect(guildTithes.length).toBeGreaterThan(0);
    guildTithes.forEach((tithe) => {
      expect(tithe.id).toBeDefined();
      expect(tithe.label).toBeDefined();
      expect(tithe.cost).toBeDefined();
      expect(tithe.cost.amount).toBeGreaterThan(0);
      expect(tithe.rewardRenown).toBeGreaterThan(0);
      expect(tithe.rewardSigils).toBeGreaterThanOrEqual(1);
    });
  });
});
