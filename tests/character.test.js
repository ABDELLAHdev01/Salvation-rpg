import { describe, it, expect } from 'vitest';
import {
  cities,
  getCityById,
  getCityByName,
  getCityPerk,
} from '../src/core/data/citiesData';

describe('Character & City Factions', () => {
  it('contains the three canonical starting cities with unique identities', () => {
    expect(cities.length).toBe(3);
    const cityIds = cities.map((c) => c.id);
    expect(cityIds).toContain('eldoria');
    expect(cityIds).toContain('valoria');
    expect(cityIds).toContain('drakmor');
  });

  it('guarantees each city defines a mechanical faction perk', () => {
    cities.forEach((city) => {
      expect(city.perk).toBeDefined();
      expect(city.perk.id).toBeDefined();
      expect(city.perk.name).toBeDefined();
      expect(city.perk.description).toBeDefined();
      expect(city.perk.type).toBeDefined();
      expect(city.perk.value).toBeGreaterThan(0);
    });
  });

  it('retrieves cities by ID and Name (case-insensitive)', () => {
    expect(getCityById('eldoria')?.name).toBe('Eldoria');
    expect(getCityById('VALORIA')?.name).toBe('Valoria');
    expect(getCityByName('drakmor')?.id).toBe('drakmor');
    expect(getCityById('nonexistent')).toBeNull();
  });

  it('retrieves city perks correctly', () => {
    expect(getCityPerk('eldoria')?.type).toBe('farm-growth');
    expect(getCityPerk('valoria')?.type).toBe('market-sell');
    expect(getCityPerk('drakmor')?.type).toBe('mining-yield');
    expect(getCityPerk('drakmor')?.damageBonus).toBe(5);
    expect(getCityPerk(null)).toBeNull();
  });
});
