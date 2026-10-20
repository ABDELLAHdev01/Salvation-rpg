/**
 * Salvation Save System & Offline Persistence Service
 * Versioned schema, backward-compatible migration, integrity validation,
 * and corruption recovery.
 */

import { sanitizeCustomization, DEFAULT_CUSTOMIZATION } from '../phaser/characterCustomizationData';

export const CURRENT_SAVE_SCHEMA_VERSION = 4;
export const MOCK_CHARACTERS_KEY = 'mockCharacters';
export const MOCK_PROFILES_KEY = 'mockProfiles';
export const SAVE_BACKUP_KEY = 'salvation_save_backup_v4';

/**
 * Validates save data integrity
 */
export function validateSaveData(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Save payload must be a non-null object.'] };
  }

  const errors = [];
  if (!data.username && !data.userId) {
    errors.push('Missing character username or userId.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Migrates any character and profile object up to the current schema version
 */
export function migrateSavePayload(characterData, profileData) {
  const safeChar = characterData && typeof characterData === 'object' ? { ...characterData } : {};
  const safeProfile = profileData && typeof profileData === 'object' ? { ...profileData } : {};

  // 1. Ensure Character Customization has all 10 categories
  safeChar.customization = sanitizeCustomization(safeChar.customization || DEFAULT_CUSTOMIZATION);

  // 2. Ensure Stats exist with sensible bounds
  safeProfile.stats = {
    level: Math.max(1, Number(safeProfile.stats?.level || 1)),
    xp: Math.max(0, Number(safeProfile.stats?.xp || 0)),
    power: Math.max(50, Number(safeProfile.stats?.power || 120)),
    gold: Math.max(0, Number(safeProfile.stats?.gold || 350)),
    quests: Number(safeProfile.stats?.quests || 0),
    victories: Number(safeProfile.stats?.victories || 0),
    renown: Number(safeProfile.stats?.renown || 10),
    expeditionsCompleted: Number(safeProfile.stats?.expeditionsCompleted || 0),
  };

  // 3. Ensure Inventory is a valid dictionary
  safeProfile.inventory = safeProfile.inventory && typeof safeProfile.inventory === 'object'
    ? { ...safeProfile.inventory }
    : {};
  if (!safeProfile.inventory['health-potion'] && Object.keys(safeProfile.inventory).length === 0) {
    safeProfile.inventory['health-potion'] = 3;
  }

  // 4. Ensure Farm Plots have valid timestamps
  if (!Array.isArray(safeProfile.farmPlots)) {
    safeProfile.farmPlots = [
      { id: 0, cropId: 'turnip', plantedAt: Date.now() - 200000 },
      { id: 1, cropId: 'wheat', plantedAt: Date.now() - 300000 },
      { id: 2, cropId: null, plantedAt: 0 },
      { id: 3, cropId: 'herb', plantedAt: Date.now() - 100000 },
      { id: 4, cropId: 'moonberry', plantedAt: Date.now() - 50000 },
      { id: 5, cropId: null, plantedAt: 0 },
    ];
  }

  // 5. Ensure Adventurers' Guild Contracts, Discovered Regions & Home Position
  if (!Array.isArray(safeProfile.activeContracts)) {
    safeProfile.activeContracts = [
      {
        id: 'main_01_homestead_foundations',
        acceptedAt: Date.now(),
        objectives: [
          { id: 'harvest_turnip', current: 0 },
          { id: 'stock_chest', current: 0 },
        ],
      },
    ];
  }
  if (!safeProfile.completedContracts || typeof safeProfile.completedContracts !== 'object') {
    safeProfile.completedContracts = {};
  }
  if (!Array.isArray(safeProfile.discoveredRegions)) {
    safeProfile.discoveredRegions = ['homestead'];
  }
  if (!safeProfile.discoveredRegions.includes('homestead')) {
    safeProfile.discoveredRegions.unshift('homestead');
  }
  if (!safeProfile.homePosition || typeof safeProfile.homePosition !== 'object') {
    safeProfile.homePosition = { zone: 'homestead', x: 15 * 32, y: 14 * 32 };
  }

  // 6. Ensure Companions, Fishing & World Simulation State
  safeProfile.equippedPet = safeProfile.equippedPet || 'sheepdog';
  safeProfile.unlockedPets = Array.isArray(safeProfile.unlockedPets)
    ? safeProfile.unlockedPets
    : ['sheepdog', 'wisp', 'falcon'];
  safeProfile.fishCaught = Number(safeProfile.fishCaught || 0);
  safeProfile.bossesDefeated = safeProfile.bossesDefeated && typeof safeProfile.bossesDefeated === 'object'
    ? safeProfile.bossesDefeated
    : {};
  safeProfile.gameTime = safeProfile.gameTime && typeof safeProfile.gameTime === 'object'
    ? safeProfile.gameTime
    : { hour: 8, minute: 0 };

  // 7. Schema version marker
  safeChar.schemaVersion = CURRENT_SAVE_SCHEMA_VERSION;
  safeProfile.schemaVersion = CURRENT_SAVE_SCHEMA_VERSION;
  safeProfile.lastSavedAt = Date.now();

  return {
    character: safeChar,
    profile: safeProfile,
    schemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
  };
}

class SaveService {
  /**
   * Automatically migrates legacy saves in storage on app launch
   */
  migrateStorage() {
    try {
      const rawChars = localStorage.getItem(MOCK_CHARACTERS_KEY);
      const rawProfiles = localStorage.getItem(MOCK_PROFILES_KEY);

      if (!rawChars && !rawProfiles) return;

      const characters = rawChars ? JSON.parse(rawChars) : {};
      const profiles = rawProfiles ? JSON.parse(rawProfiles) : {};

      let hasChanges = false;
      Object.keys(characters).forEach((user) => {
        const char = characters[user];
        const prof = profiles[user] || {};

        if (char.schemaVersion !== CURRENT_SAVE_SCHEMA_VERSION) {
          const migrated = migrateSavePayload(char, prof);
          characters[user] = migrated.character;
          profiles[user] = migrated.profile;
          hasChanges = true;
        }
      });

      if (hasChanges) {
        localStorage.setItem(MOCK_CHARACTERS_KEY, JSON.stringify(characters));
        localStorage.setItem(MOCK_PROFILES_KEY, JSON.stringify(profiles));
      }
    } catch (err) {
      console.warn('[SaveService] Failed to auto-migrate storage:', err);
    }
  }

  /**
   * Generates a portable, versioned JSON backup payload
   */
  exportSave(username) {
    if (!username) return null;
    try {
      const rawChars = localStorage.getItem(MOCK_CHARACTERS_KEY);
      const rawProfiles = localStorage.getItem(MOCK_PROFILES_KEY);

      const characters = rawChars ? JSON.parse(rawChars) : {};
      const profiles = rawProfiles ? JSON.parse(rawProfiles) : {};

      const character = characters[username];
      const profile = profiles[username];

      if (!character) return null;

      const payload = {
        app: 'Salvation-RPG',
        schemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        username,
        character,
        profile,
      };

      return JSON.stringify(payload, null, 2);
    } catch (err) {
      console.error('[SaveService] Export failed:', err);
      return null;
    }
  }

  /**
   * Imports and validates an external save payload
   */
  importSave(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid JSON save structure.');
      }

      const username = parsed.username || parsed.character?.name;
      if (!username) {
        throw new Error('Save file does not contain a valid character username.');
      }

      const migrated = migrateSavePayload(parsed.character, parsed.profile);

      const rawChars = localStorage.getItem(MOCK_CHARACTERS_KEY);
      const rawProfiles = localStorage.getItem(MOCK_PROFILES_KEY);

      const characters = rawChars ? JSON.parse(rawChars) : {};
      const profiles = rawProfiles ? JSON.parse(rawProfiles) : {};

      characters[username] = migrated.character;
      profiles[username] = migrated.profile;

      localStorage.setItem(MOCK_CHARACTERS_KEY, JSON.stringify(characters));
      localStorage.setItem(MOCK_PROFILES_KEY, JSON.stringify(profiles));

      return { success: true, username };
    } catch (err) {
      console.error('[SaveService] Import failed:', err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Explicit reset of a character requiring confirmation
   */
  resetCharacter(username, confirmation) {
    if (confirmation !== 'CONFIRM_RESET') {
      throw new Error('Reset requires explicit confirmation token "CONFIRM_RESET".');
    }

    try {
      const rawChars = localStorage.getItem(MOCK_CHARACTERS_KEY);
      const rawProfiles = localStorage.getItem(MOCK_PROFILES_KEY);

      const characters = rawChars ? JSON.parse(rawChars) : {};
      const profiles = rawProfiles ? JSON.parse(rawProfiles) : {};

      // Backup before deletion
      if (characters[username] || profiles[username]) {
        const backup = {
          character: characters[username],
          profile: profiles[username],
          deletedAt: Date.now(),
        };
        localStorage.setItem(SAVE_BACKUP_KEY, JSON.stringify(backup));
      }

      delete characters[username];
      delete profiles[username];

      localStorage.setItem(MOCK_CHARACTERS_KEY, JSON.stringify(characters));
      localStorage.setItem(MOCK_PROFILES_KEY, JSON.stringify(profiles));

      return true;
    } catch (err) {
      console.error('[SaveService] Reset failed:', err);
      return false;
    }
  }
}

export const saveService = new SaveService();

export function exportSavePayloadJSON(username) {
  try {
    const rawChars = localStorage.getItem(MOCK_CHARACTERS_KEY);
    const rawProfiles = localStorage.getItem(MOCK_PROFILES_KEY);
    const characters = rawChars ? JSON.parse(rawChars) : {};
    const profiles = rawProfiles ? JSON.parse(rawProfiles) : {};

    const targetUser = username || Object.keys(characters)[0] || 'Warden';
    const character = characters[targetUser] || Object.values(characters)[0] || {};
    const profile = profiles[targetUser] || Object.values(profiles)[0] || {};

    const payload = {
      app: 'Salvation-RPG',
      schemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      username: targetUser,
      character,
      profile,
    };
    return JSON.stringify(payload, null, 2);
  } catch (err) {
    console.error('[SaveService] exportSavePayloadJSON failed:', err);
    return null;
  }
}

export function importSavePayloadJSON(jsonString) {
  return saveService.importSave(jsonString);
}

export default saveService;
