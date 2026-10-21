import { describe, it, expect } from 'vitest';
import { MONSTER_TYPES, generateMonsterLoot } from '../src/core/combat/combatEngine';
import {
  GUILD_RANKS,
  CONTRACT_REGISTRY,
  recordContractProgress,
  getGuildRankProgress,
} from '../src/core/quests/guildContracts';
import { ITEM_ICON_MAP, getItemIcon } from '../src/core/data/itemIcons';

describe('CraftPix Purchased Assets Integration Tests', () => {
  describe('Hunt Wildlife & Encounter Monsters', () => {
    it('registers Bristleback Boar with correct combat stats, animations and loot tables', () => {
      const boar = MONSTER_TYPES['boar_bristleback'];
      expect(boar).toBeDefined();
      expect(boar.id).toBe('boar_bristleback');
      expect(boar.name).toBe('Bristleback Boar');
      expect(boar.texture).toBe('boar_walk');
      expect(boar.maxHp).toBeGreaterThanOrEqual(50);
      expect(boar.damage).toBeGreaterThanOrEqual(10);
      expect(boar.lootTable.some((l) => l.itemId === 'boar-meat')).toBe(true);
      expect(boar.lootTable.some((l) => l.itemId === 'beast-hide')).toBe(true);
    });

    it('registers Amber Fox with high mobility, cunning stats and pelt loot', () => {
      const fox = MONSTER_TYPES['fox_amber'];
      expect(fox).toBeDefined();
      expect(fox.id).toBe('fox_amber');
      expect(fox.name).toBe('Amber Fox');
      expect(fox.texture).toBe('fox_walk');
      expect(fox.speed).toBeGreaterThanOrEqual(80);
      expect(fox.lootTable.some((l) => l.itemId === 'fox-pelt')).toBe(true);
    });

    it('generates valid monster loot with gold and item drops for new creatures', () => {
      const boar = MONSTER_TYPES['boar_bristleback'];
      const loot = generateMonsterLoot(boar);
      expect(loot).toBeDefined();
      expect(loot.gold).toBeGreaterThanOrEqual(boar.goldReward.min);
      expect(loot.gold).toBeLessThanOrEqual(boar.goldReward.max);
      expect(loot.xp).toBe(boar.xpReward);
      expect(Array.isArray(loot.items)).toBe(true);
    });
  });

  describe('Heraldry Crests & Guild Progression', () => {
    it('maps all 6 guild ranks to authentic CraftPix heraldry crests', () => {
      expect(GUILD_RANKS.length).toBe(6);
      GUILD_RANKS.forEach((rank) => {
        expect(rank.crest).toBeDefined();
        expect(rank.crest).toMatch(/^\/assets\/ui\/guild\/crest_/);
      });
    });

    it('correctly calculates guild rank progress with crest data', () => {
      const rankState = getGuildRankProgress(120);
      expect(rankState.currentRank.id).toBe('bronze');
      expect(rankState.currentRank.crest).toBe('/assets/ui/guild/crest_iron.png');
      expect(rankState.nextRank.id).toBe('silver');
      expect(rankState.nextRank.crest).toBe('/assets/ui/guild/crest_silver.png');
      expect(rankState.renownNeeded).toBe(30);
    });
  });

  describe('New Guild Contracts & Discovery Quests', () => {
    it('registers Cull the Bristleback Boars contract', () => {
      const contract = CONTRACT_REGISTRY.find((c) => c.id === 'guild_06_boar_cull');
      expect(contract).toBeDefined();
      expect(contract.title).toBe('Cull the Bristleback Boars');
      expect(contract.minRank).toBe('recruit');
      expect(contract.rewards.gold).toBeGreaterThan(0);
      expect(contract.rewards.renown).toBeGreaterThan(0);
      expect(contract.objectives[0].type).toBe('defeat_enemy');
      expect(contract.objectives[0].enemyType).toBe('boar_bristleback');
    });

    it('registers Secrets of the Deepforge Chest discovery quest', () => {
      const contract = CONTRACT_REGISTRY.find((c) => c.id === 'disc_05_cavern_chest');
      expect(contract).toBeDefined();
      expect(contract.title).toBe('Secrets of the Deepforge Chest');
      expect(contract.objectives[0].type).toBe('interact_prop');
      expect(contract.objectives[0].propId).toBe('prop_dungeon_chest');
      expect(contract.rewards.items['dungeon-relic']).toBe(1);
    });

    it('records contract progress when defeating Bristleback Boars', () => {
      const activeContracts = [
        {
          id: 'guild_06_boar_cull',
          objectives: [{ id: 'kill_boars', current: 0 }],
        },
      ];

      const res = recordContractProgress(
        'combat:enemy_defeated',
        { enemyType: 'boar_bristleback' },
        activeContracts
      );

      expect(res.updated).toBe(true);
      expect(res.activeContracts[0].objectives[0].current).toBe(1);
    });

    it('records contract progress when opening the cavern relic chest', () => {
      const activeContracts = [
        {
          id: 'disc_05_cavern_chest',
          objectives: [{ id: 'open_cavern_chest', current: 0 }],
        },
      ];

      const res = recordContractProgress(
        'prop:interacted',
        { propId: 'prop_dungeon_chest' },
        activeContracts
      );

      expect(res.updated).toBe(true);
      expect(res.autoCompleted).toContain('disc_05_cavern_chest');
    });
  });

  describe('Item Icons & Domain Assets', () => {
    it('maps all newly integrated CraftPix items in ITEM_ICON_MAP', () => {
      expect(ITEM_ICON_MAP['boar-meat']).toBe('/assets/items/item_meat.png');
      expect(ITEM_ICON_MAP['beast-hide']).toBe('/assets/items/item_hide.png');
      expect(ITEM_ICON_MAP['fox-pelt']).toBe('/assets/items/item_fox_pelt.png');
      expect(ITEM_ICON_MAP['dungeon-relic']).toBe('/assets/items/item_relic.png');
      expect(ITEM_ICON_MAP['wool']).toBe('/assets/items/item_wool.png');
      expect(ITEM_ICON_MAP['egg']).toBe('/assets/items/item_egg.png');
      expect(ITEM_ICON_MAP['potion-rejuvenation']).toBe('/assets/items/potion_rejuvenation.png');
    });

    it('resolves item icons via getItemIcon helper safely', () => {
      expect(getItemIcon('boar-meat')).toBe('/assets/items/item_meat.png');
      expect(getItemIcon('potion-mana')).toBe('/assets/items/potion_mana.png');
      expect(getItemIcon('unknown-mystic-potion')).toBe('/assets/items/potion_health.png');
      expect(getItemIcon(null)).toBe('/assets/items/item_seed_pouch.png');
    });
  });
});
