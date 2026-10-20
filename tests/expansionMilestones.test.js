import { describe, it, expect } from 'vitest';
import { MONSTER_TYPES } from '../src/core/combat/combatEngine';
import { COMPANIONS } from '../src/core/data/companionData';
import { FISH_SPECIES } from '../src/core/data/fishData';
import {
  CONTRACT_REGISTRY,
  recordContractProgress,
} from '../src/core/quests/guildContracts';
import audioManager from '../src/core/audio/AudioManager';

describe('Expansion Milestones: Bosses, Companions, Fishing & Audio', () => {
  describe('World Boss Encounters Domain', () => {
    it('defines Slime King Colossus with multi-phase boss properties', () => {
      const boss = MONSTER_TYPES.boss_slime_king;
      expect(boss).toBeDefined();
      expect(boss.name).toBe('Colossal Slime Sovereign');
      expect(boss.maxHp).toBeGreaterThanOrEqual(400);
      expect(boss.defense).toBeGreaterThanOrEqual(6);
      expect(boss.lootTable).toBeDefined();
      expect(boss.xpReward).toBeGreaterThanOrEqual(180);
      expect(boss.lootTable.some((d) => d.itemId === 'slime-crown')).toBe(true);
    });

    it('defines Drakmor Bone-Lord with deepforge boss properties', () => {
      const boss = MONSTER_TYPES.boss_drakmor;
      expect(boss).toBeDefined();
      expect(boss.name).toBe('Drakmor Bone-Lord');
      expect(boss.maxHp).toBeGreaterThanOrEqual(500);
      expect(boss.defense).toBeGreaterThanOrEqual(10);
      expect(boss.lootTable).toBeDefined();
      expect(boss.goldReward.min).toBeGreaterThanOrEqual(150);
      expect(boss.lootTable.some((d) => d.itemId === 'drakmor-skull')).toBe(true);
    });
  });

  describe('Pet & Companion System Domain', () => {
    it('provides all 3 loyal companions with distinct perks', () => {
      expect(COMPANIONS.length).toBe(3);
      const ids = COMPANIONS.map((c) => c.id);
      expect(ids).toContain('sheepdog');
      expect(ids).toContain('wisp');
      expect(ids).toContain('falcon');

      COMPANIONS.forEach((companion) => {
        expect(companion.name).toBeTruthy();
        expect(companion.perk).toBeTruthy();
        expect(companion.icon).toBeTruthy();
        expect(companion.sound).toBeTruthy();
      });
    });
  });

  describe('Water Mechanics & Fishing Species Domain', () => {
    it('provides 4 balanced fish species across common to epic rarity', () => {
      expect(FISH_SPECIES.length).toBe(4);
      const trout = FISH_SPECIES.find((f) => f.id === 'river-trout');
      const salmon = FISH_SPECIES.find((f) => f.id === 'sylvan-salmon');
      const carp = FISH_SPECIES.find((f) => f.id === 'golden-carp');
      const eel = FISH_SPECIES.find((f) => f.id === 'void-eel');

      expect(trout).toBeDefined();
      expect(salmon).toBeDefined();
      expect(carp).toBeDefined();
      expect(eel).toBeDefined();

      expect(trout.difficulty).toBeLessThan(eel.difficulty);
      expect(eel.sellValue).toBeGreaterThan(trout.sellValue);
      expect(trout.weightRange[0]).toBeLessThan(trout.weightRange[1]);
    });
  });

  describe('Mythic Guild Contracts & Progression', () => {
    it('contains Slime King, Drakmor, and Fishing discovery contracts', () => {
      const slimeKingContract = CONTRACT_REGISTRY.find((c) => c.id === 'guild_boss_01_slime_king');
      const drakmorContract = CONTRACT_REGISTRY.find((c) => c.id === 'guild_boss_02_drakmor');
      const fishingContract = CONTRACT_REGISTRY.find((c) => c.id === 'disc_04_first_catch');

      expect(slimeKingContract).toBeDefined();
      expect(drakmorContract).toBeDefined();
      expect(fishingContract).toBeDefined();

      expect(slimeKingContract.objectives[0].enemyType).toBe('boss_slime_king');
      expect(drakmorContract.objectives[0].enemyType).toBe('boss_drakmor');
      expect(fishingContract.objectives[0].type).toBe('catch_fish');
    });

    it('advances boss bounty progress upon enemy defeat', () => {
      const activeContracts = [
        {
          id: 'guild_boss_01_slime_king',
          objectives: [{ id: 'kill_slime_king', current: 0 }],
        },
      ];

      const res = recordContractProgress(
        'combat:enemy_defeated',
        { enemyType: 'boss_slime_king' },
        activeContracts
      );

      expect(res.updated).toBe(true);
      expect(res.activeContracts[0].objectives[0].current).toBe(1);
    });

    it('advances fishing contract progress upon catch', () => {
      const activeContracts = [
        {
          id: 'disc_04_first_catch',
          objectives: [{ id: 'catch_any_fish', current: 0 }],
        },
      ];

      const res = recordContractProgress(
        'fish:caught',
        { fishId: 'river-trout' },
        activeContracts
      );

      expect(res.updated).toBe(true);
      // Auto completes because target is 1 and requiresTurnIn is false
      expect(res.autoCompleted).toContain('disc_04_first_catch');
    });
  });

  describe('Procedural Web Audio Regional & Ambient Synthesizers', () => {
    it('executes regional theme synthesizers safely without crashing headless test runners', () => {
      expect(() => audioManager.playBGM('homestead')).not.toThrow();
      expect(() => audioManager.playBGM('village')).not.toThrow();
      expect(() => audioManager.playBGM('forest')).not.toThrow();
      expect(() => audioManager.playBGM('mine')).not.toThrow();
      expect(() => audioManager.stopBGM()).not.toThrow();
    });

    it('executes weather and SFX synthesizers safely', () => {
      expect(() => audioManager.startRainAmbience()).not.toThrow();
      expect(() => audioManager.stopRainAmbience()).not.toThrow();
      expect(() => audioManager.playThunder()).not.toThrow();
      expect(() => audioManager.synthSplash()).not.toThrow();
      expect(() => audioManager.synthBite()).not.toThrow();
      expect(() => audioManager.synthReel()).not.toThrow();
      expect(() => audioManager.synthBark()).not.toThrow();
      expect(() => audioManager.synthWisp()).not.toThrow();
      expect(() => audioManager.synthChirp()).not.toThrow();
      expect(() => audioManager.synthBossRoar()).not.toThrow();
      expect(() => audioManager.synthBossTelegraph()).not.toThrow();
      expect(() => audioManager.synthBossSlam()).not.toThrow();
    });
  });
});
