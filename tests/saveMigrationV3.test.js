import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CURRENT_SAVE_SCHEMA_VERSION,
  migrateSavePayload,
  exportSavePayloadJSON,
  importSavePayloadJSON,
} from '../src/core/services/saveService';

describe('Save System Schema v3 Migration', () => {
  const mockStorage = {};

  beforeEach(() => {
    vi.restoreAllMocks();
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
    vi.stubGlobal('localStorage', {
      getItem: (key) => mockStorage[key] ?? null,
      setItem: (key, val) => {
        mockStorage[key] = String(val);
      },
      removeItem: (key) => {
        delete mockStorage[key];
      },
      clear: () => {
        Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
      },
    });
  });
  it('migrates a v1/v2 payload into schema v3 with guild contracts and home position', () => {
    const legacyChar = {
      characterName: 'Valen',
      schemaVersion: 2,
    };
    const legacyProfile = {
      username: 'offline-hero',
      stats: { level: 3, gold: 500, renown: 45 },
      inventory: { iron: 5 },
      schemaVersion: 2,
    };

    const migrated = migrateSavePayload(legacyChar, legacyProfile);
    expect(migrated.schemaVersion).toBe(3);
    expect(migrated.character.schemaVersion).toBe(3);
    expect(migrated.profile.schemaVersion).toBe(3);
    expect(migrated.profile.stats.renown).toBe(45);

    // Guild Contracts & Discovered Regions
    expect(Array.isArray(migrated.profile.activeContracts)).toBe(true);
    expect(migrated.profile.activeContracts.length).toBeGreaterThan(0);
    expect(migrated.profile.activeContracts[0].id).toBe('main_01_homestead_foundations');
    expect(migrated.profile.completedContracts).toEqual({});
    expect(migrated.profile.discoveredRegions).toContain('homestead');

    // Safe home position
    expect(migrated.profile.homePosition).toEqual({
      zone: 'homestead',
      x: 15 * 32,
      y: 14 * 32,
    });
  });

  it('safely round-trips via JSON export and import', () => {
    const legacyChar = { characterName: 'Aria' };
    const legacyProfile = {
      username: 'aria_hero',
      stats: { level: 4, gold: 1200, renown: 80 },
      inventory: { 'iron-bar': 4 },
      activeContracts: [
        {
          id: 'guild_01_slime_cull',
          objectives: [{ id: 'kill_slimes', current: 2 }],
        },
      ],
      completedContracts: {
        main_01_homestead_foundations: 1700000000000,
      },
    };

    const migrated = migrateSavePayload(legacyChar, legacyProfile);
    localStorage.setItem('mockCharacters', JSON.stringify({ aria_hero: migrated.character }));
    localStorage.setItem('mockProfiles', JSON.stringify({ aria_hero: migrated.profile }));

    const exportedJson = exportSavePayloadJSON();
    expect(exportedJson).toContain('"schemaVersion": 3');
    expect(exportedJson).toContain('guild_01_slime_cull');

    const importRes = importSavePayloadJSON(exportedJson);
    expect(importRes.success).toBe(true);
    expect(importRes.username).toBe('aria_hero');
  });
});
