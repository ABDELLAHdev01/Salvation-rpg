import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  CURRENT_SAVE_SCHEMA_VERSION,
  MOCK_CHARACTERS_KEY,
  MOCK_PROFILES_KEY,
  SAVE_BACKUP_KEY,
  validateSaveData,
  migrateSavePayload,
  saveService,
} from '../src/core/services/saveService';
import { DEFAULT_CUSTOMIZATION } from '../src/core/phaser/characterCustomizationData';

describe('Versioned Save System & Persistence Service', () => {
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

  describe('Validation & Schema Integrity', () => {
    it('validates non-null payload with username or userId', () => {
      expect(validateSaveData(null).valid).toBe(false);
      expect(validateSaveData({}).valid).toBe(false);
      expect(validateSaveData({ username: 'Eldrin' }).valid).toBe(true);
      expect(validateSaveData({ userId: 'user_42' }).valid).toBe(true);
    });
  });

  describe('Save Payload Migration (Schema v1 -> Schema v2)', () => {
    it('migrates legacy unversioned character and profile to v2 schema', () => {
      const legacyChar = {
        name: 'Aurelia',
        race: 'Elf',
      };
      const legacyProfile = {
        stats: {
          level: 3,
          gold: 450,
        },
      };

      const migrated = migrateSavePayload(legacyChar, legacyProfile);

      expect(migrated.schemaVersion).toBe(CURRENT_SAVE_SCHEMA_VERSION);
      expect(migrated.character.schemaVersion).toBe(CURRENT_SAVE_SCHEMA_VERSION);
      expect(migrated.profile.schemaVersion).toBe(CURRENT_SAVE_SCHEMA_VERSION);

      // Ensures all 10 customization categories are populated
      expect(migrated.character.customization).toBeDefined();
      expect(migrated.character.customization.skinTone).toBe(DEFAULT_CUSTOMIZATION.skinTone);
      expect(migrated.character.customization.equippedTool).toBe(DEFAULT_CUSTOMIZATION.equippedTool);

      // Ensures stats are bounded
      expect(migrated.profile.stats.level).toBe(3);
      expect(migrated.profile.stats.gold).toBe(450);
      expect(migrated.profile.stats.power).toBeGreaterThanOrEqual(50);

      // Generates default farm plots when missing
      expect(Array.isArray(migrated.profile.farmPlots)).toBe(true);
      expect(migrated.profile.farmPlots).toHaveLength(6);
      expect(migrated.profile.lastSavedAt).toBeGreaterThan(0);
    });

    it('clamps negative or corrupted numeric stats', () => {
      const corruptedProfile = {
        stats: {
          level: -5,
          xp: -100,
          power: 10, // below minimum 50
          gold: -999,
        },
      };

      const result = migrateSavePayload({}, corruptedProfile);
      expect(result.profile.stats.level).toBe(1);
      expect(result.profile.stats.xp).toBe(0);
      expect(result.profile.stats.power).toBe(50);
      expect(result.profile.stats.gold).toBe(0);
    });
  });

  describe('Storage Auto-Migration', () => {
    it('upgrades legacy saves in localStorage when migrateStorage is called', () => {
      const unversionedChars = {
        aldor: { name: 'Aldor', race: 'Human' },
      };
      const unversionedProfiles = {
        aldor: { stats: { level: 2, gold: 500 } },
      };

      mockStorage[MOCK_CHARACTERS_KEY] = JSON.stringify(unversionedChars);
      mockStorage[MOCK_PROFILES_KEY] = JSON.stringify(unversionedProfiles);

      saveService.migrateStorage();

      const upgradedChars = JSON.parse(mockStorage[MOCK_CHARACTERS_KEY]);
      const upgradedProfiles = JSON.parse(mockStorage[MOCK_PROFILES_KEY]);

      expect(upgradedChars.aldor.schemaVersion).toBe(CURRENT_SAVE_SCHEMA_VERSION);
      expect(upgradedProfiles.aldor.schemaVersion).toBe(CURRENT_SAVE_SCHEMA_VERSION);
      expect(upgradedChars.aldor.customization).toBeDefined();
    });

    it('does nothing when storage is completely empty', () => {
      saveService.migrateStorage();
      expect(mockStorage[MOCK_CHARACTERS_KEY]).toBeUndefined();
    });
  });

  describe('Save Export & Import', () => {
    it('exports a clean JSON string with application metadata', () => {
      const char = { name: 'Rowan', schemaVersion: 2 };
      const prof = { stats: { level: 5, gold: 1200 }, schemaVersion: 2 };

      mockStorage[MOCK_CHARACTERS_KEY] = JSON.stringify({ rowan: char });
      mockStorage[MOCK_PROFILES_KEY] = JSON.stringify({ rowan: prof });

      const exportedJson = saveService.exportSave('rowan');
      expect(exportedJson).toBeTruthy();

      const parsed = JSON.parse(exportedJson);
      expect(parsed.app).toBe('Salvation-RPG');
      expect(parsed.schemaVersion).toBe(CURRENT_SAVE_SCHEMA_VERSION);
      expect(parsed.username).toBe('rowan');
      expect(parsed.character.name).toBe('Rowan');
      expect(parsed.profile.stats.level).toBe(5);
    });

    it('returns null when exporting non-existent character', () => {
      expect(saveService.exportSave('non_existent')).toBeNull();
      expect(saveService.exportSave('')).toBeNull();
    });

    it('imports and sanitizes an external save payload', () => {
      const externalPayload = {
        app: 'Salvation-RPG',
        schemaVersion: 1,
        username: 'valeria',
        character: { name: 'Valeria', race: 'Elf' },
        profile: { stats: { level: 4, gold: 800 } },
      };

      const result = saveService.importSave(JSON.stringify(externalPayload));
      expect(result.success).toBe(true);
      expect(result.username).toBe('valeria');

      const savedChars = JSON.parse(mockStorage[MOCK_CHARACTERS_KEY]);
      const savedProfiles = JSON.parse(mockStorage[MOCK_PROFILES_KEY]);

      expect(savedChars.valeria).toBeDefined();
      expect(savedChars.valeria.schemaVersion).toBe(CURRENT_SAVE_SCHEMA_VERSION);
      expect(savedProfiles.valeria.stats.level).toBe(4);
    });

    it('rejects invalid or corrupted save payloads gracefully', () => {
      const resultCorrupted = saveService.importSave('not-valid-json{{{');
      expect(resultCorrupted.success).toBe(false);
      expect(resultCorrupted.error).toBeDefined();

      const resultMissingUser = saveService.importSave(JSON.stringify({ stats: {} }));
      expect(resultMissingUser.success).toBe(false);
    });
  });

  describe('Character Reset with Safeguard & Backup', () => {
    it('throws error when confirmation token is incorrect', () => {
      expect(() => {
        saveService.resetCharacter('rowan', 'wrong_token');
      }).toThrow('CONFIRM_RESET');
    });

    it('creates a backup and clears character when CONFIRM_RESET is provided', () => {
      mockStorage[MOCK_CHARACTERS_KEY] = JSON.stringify({
        rowan: { name: 'Rowan' },
      });
      mockStorage[MOCK_PROFILES_KEY] = JSON.stringify({
        rowan: { stats: { level: 5 } },
      });

      const success = saveService.resetCharacter('rowan', 'CONFIRM_RESET');
      expect(success).toBe(true);

      const remainingChars = JSON.parse(mockStorage[MOCK_CHARACTERS_KEY]);
      const remainingProfiles = JSON.parse(mockStorage[MOCK_PROFILES_KEY]);

      expect(remainingChars.rowan).toBeUndefined();
      expect(remainingProfiles.rowan).toBeUndefined();

      // Backup exists in storage
      const backup = JSON.parse(mockStorage[SAVE_BACKUP_KEY]);
      expect(backup.character.name).toBe('Rowan');
      expect(backup.profile.stats.level).toBe(5);
      expect(backup.deletedAt).toBeGreaterThan(0);
    });
  });
});
