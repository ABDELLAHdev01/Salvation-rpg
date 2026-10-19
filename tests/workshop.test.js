import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  workshopStations,
  getWorkshopRecipe,
  getWorkshopItem,
  getWorkshopXpForLevel,
  getWorkshopStationsForLevel,
  getWorkshopRecipesForStation,
  getWorkshopUpgrade,
  getNextWorkshopUpgrade,
} from '../src/core/data/workshopData';
import WorkshopService from '../src/core/services/WorkshopService';

describe('Workshop Domain Logic & Relic Deciphering', () => {
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

  it('contains 5 specialized workstations including Scriptorium & Lapidary', () => {
    expect(workshopStations.length).toBe(5);

    const stationIds = workshopStations.map((s) => s.id);
    expect(stationIds).toContain('smelter');
    expect(stationIds).toContain('kitchen');
    expect(stationIds).toContain('loom');
    expect(stationIds).toContain('alchemy');
    expect(stationIds).toContain('scriptorium');

    const scriptorium = workshopStations.find((s) => s.id === 'scriptorium');
    expect(scriptorium?.unlockLevel).toBe(3);
    expect(scriptorium?.description).toBeDefined();
  });

  it('correctly filters unlocked workstations by player level', () => {
    const level1Stations = getWorkshopStationsForLevel(1);
    expect(level1Stations.length).toBe(1);
    expect(level1Stations[0].id).toBe('smelter');

    const level3Stations = getWorkshopStationsForLevel(3);
    expect(level3Stations.map((s) => s.id)).toContain('scriptorium');

    const level6Stations = getWorkshopStationsForLevel(6);
    expect(level6Stations.length).toBe(5);
  });

  it('contains geode cracking and ancient tablet deciphering recipes', () => {
    const crackGeode = getWorkshopRecipe('crack-mystery-geode');
    expect(crackGeode).toBeDefined();
    expect(crackGeode?.station).toBe('scriptorium');
    expect(crackGeode?.inputs).toEqual([{ source: 'mining', id: 'mystery-geode', amount: 1 }]);
    expect(crackGeode?.outputs).toEqual([{ id: 'gem-amethyst', amount: 1 }]);
    expect(crackGeode?.sellValue).toBe(320);

    const decipherTablet = getWorkshopRecipe('decipher-ancient-tablet');
    expect(decipherTablet).toBeDefined();
    expect(decipherTablet?.station).toBe('scriptorium');
    expect(decipherTablet?.inputs).toEqual([
      { source: 'inventory', id: 'ancient-tablet', amount: 1 },
      { source: 'farm', id: 'herb', amount: 2 },
    ]);
    expect(decipherTablet?.outputs).toEqual([{ id: 'sunforge-codex', amount: 1 }]);
    expect(decipherTablet?.sellValue).toBe(450);
  });

  it('retrieves recipes assigned to specific workstation', () => {
    const scriptoriumRecipes = getWorkshopRecipesForStation('scriptorium', 6);
    expect(scriptoriumRecipes.length).toBe(2);
    expect(scriptoriumRecipes.map((r) => r.id)).toContain('crack-mystery-geode');
    expect(scriptoriumRecipes.map((r) => r.id)).toContain('decipher-ancient-tablet');
  });

  it('retrieves item metadata and sell values correctly', () => {
    const codex = getWorkshopItem('sunforge-codex');
    expect(codex).toBeDefined();
    expect(codex?.name).toBe('Sunforge Codex');
    expect(codex?.sellValue).toBe(450);

    const amethyst = getWorkshopItem('gem-amethyst');
    expect(amethyst).toBeDefined();
    expect(amethyst?.name).toBe('Polished Amethyst');
    expect(amethyst?.sellValue).toBe(320);
  });

  it('computes workshop level thresholds accurately', () => {
    expect(getWorkshopXpForLevel(1)).toBe(120);
    expect(getWorkshopXpForLevel(2)).toBe(190);
    expect(getWorkshopXpForLevel(5)).toBe(400);
    expect(getWorkshopXpForLevel(11)).toBe(120 + 9 * 70 + 110);
  });

  it('retrieves tool upgrade progression stages and speed multipliers', () => {
    const basic = getWorkshopUpgrade(1);
    expect(basic.name).toBe('Basic Tools');
    expect(basic.durationMultiplier).toBe(1);

    const next = getNextWorkshopUpgrade(1);
    expect(next?.name).toBe('Sharpened Tools');
    expect(next?.durationMultiplier).toBeLessThan(1);
    expect(next?.cost).toBe(800);
  });

  it('validates queueing and processing workshop crafting jobs in WorkshopService', () => {
    const mockProfile = {
      workshopLevel: 5,
      workshopXp: 0,
      workshopUpgradeLevel: 1,
      workshopQueue: [],
      inventory: {
        'mystery-geode': 2,
      },
      stats: { gold: 100 },
    };

    // Test queuing a job with valid inventory
    const result = WorkshopService.queueWorkshopJob({
      profile: mockProfile,
      recipeId: 'crack-mystery-geode',
      quantity: 1,
      now: 1000,
    });

    expect(result.ok).toBe(true);
    expect(result.profile.workshopQueue.length).toBe(1);
    expect(result.profile.inventory['mystery-geode']).toBe(1);

    // Test processing finished job
    const finishedJobProfile = {
      ...result.profile,
      workshopQueue: [
        {
          id: 'test-job',
          recipeId: 'crack-mystery-geode',
          quantity: 1,
          startAt: 1000,
          finishAt: 2000,
        },
      ],
    };

    const processResult = WorkshopService.processWorkshopQueue({
      profile: finishedJobProfile,
      now: 3000,
    });

    expect(processResult.completedCount).toBe(1);
    expect(processResult.profile.inventory['gem-amethyst']).toBe(1);
    expect(processResult.profile.workshopXp).toBe(22);
    expect(processResult.profile.workshopQueue.length).toBe(0);
  });
});
