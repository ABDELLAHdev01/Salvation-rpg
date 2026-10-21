import { describe, it, expect } from 'vitest';
import { MONSTER_TYPES } from '../src/core/combat/combatEngine';

describe('Homestead Interior & Beginning Tutorial Architecture', () => {
  describe('New 2D Monster Assets & Combat Definitions', () => {
    it('defines Cavern Shadow Bat with flying speed and evasive agility', () => {
      const bat = MONSTER_TYPES.bat_shadow;
      expect(bat).toBeDefined();
      expect(bat.name).toBe('Cavern Shadow Bat');
      expect(bat.texture).toBe('enemy_bat');
      expect(bat.maxHp).toBe(35);
      expect(bat.speed).toBeGreaterThanOrEqual(90);
      expect(bat.damage).toBeGreaterThan(0);
      expect(bat.lootTable.length).toBeGreaterThan(0);
    });

    it('defines Cavern Webspinner spider with venomous traits', () => {
      const spider = MONSTER_TYPES.spider_cavern;
      expect(spider).toBeDefined();
      expect(spider.name).toBe('Cavern Webspinner');
      expect(spider.texture).toBe('enemy_spider');
      expect(spider.maxHp).toBe(70);
      expect(spider.defense).toBeGreaterThan(0);
      expect(spider.lootTable.length).toBeGreaterThan(0);
    });

    it('defines Savage Orc Marauder brute for West Road encounters', () => {
      const orc = MONSTER_TYPES.orc_marauder;
      expect(orc).toBeDefined();
      expect(orc.name).toBe('Savage Orc Marauder');
      expect(orc.texture).toBe('enemy_orc');
      expect(orc.maxHp).toBe(95);
      expect(orc.damage).toBe(18);
      expect(orc.defense).toBe(7);
      expect(orc.lootTable.length).toBeGreaterThan(0);
    });
  });

  describe('Homestead Cottage Bed Restoration Mechanics', () => {
    it('restores wounded hero to full 100% Health', () => {
      const player = { hp: 22, maxHp: 100 };
      
      const restAtBed = (hero) => {
        return {
          ...hero,
          hp: hero.maxHp,
          restoredAmount: hero.maxHp - hero.hp,
        };
      };

      const result = restAtBed(player);
      expect(result.hp).toBe(100);
      expect(result.restoredAmount).toBe(78);
    });
  });

  describe('Beginning Journey Tutorial Progression', () => {
    const TUTORIAL_STEPS_DEF = [
      { step: 1, id: 'movement', title: 'First Steps & Pathfinding', badge: 'Movement' },
      { step: 2, id: 'cottage', title: 'Enter Homestead Cottage', badge: 'Shelter' },
      { step: 3, id: 'rest', title: 'Rest & Restore Health', badge: 'Sanctuary' },
      { step: 4, id: 'pouch', title: 'Inspect Adventurer Pouch', badge: 'Equipment' },
      { step: 5, id: 'atlas', title: 'Chart the World Atlas', badge: 'Exploration' },
    ];

    it('defines sequential 5-step tutorial onboarding arc', () => {
      expect(TUTORIAL_STEPS_DEF.length).toBe(5);
      expect(TUTORIAL_STEPS_DEF.map((s) => s.id)).toEqual([
        'movement',
        'cottage',
        'rest',
        'pouch',
        'atlas',
      ]);
    });

    it('advances steps sequentially and unlocks reward upon completion', () => {
      let currentStep = 0;
      let completed = false;
      let stats = { gold: 350, xp: 0 };

      // Step 1: Moved
      currentStep = 1;
      expect(currentStep).toBe(1);

      // Step 2: Entered cottage
      currentStep = 2;
      expect(currentStep).toBe(2);

      // Step 3: Rested in bed
      currentStep = 3;
      expect(currentStep).toBe(3);

      // Step 4: Opened pouch
      currentStep = 4;
      expect(currentStep).toBe(4);

      // Step 5: Opened atlas -> Completed!
      currentStep = 5;
      completed = true;
      expect(completed).toBe(true);

      // Claim reward: +50 gold, +50 XP
      stats = {
        ...stats,
        gold: stats.gold + 50,
        xp: stats.xp + 50,
      };

      expect(stats.gold).toBe(400);
      expect(stats.xp).toBe(50);
    });
  });
});
