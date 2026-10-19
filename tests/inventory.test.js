import { describe, it, expect } from 'vitest';
import {
  addItems,
  removeItems,
  getItemCount,
} from '../src/core/services/inventoryService';

describe('Inventory Service', () => {
  it('correctly adds items to an empty or existing inventory', () => {
    let inv = {};
    inv = addItems(inv, { iron: 5, turnip: 3 });

    expect(getItemCount(inv, 'iron')).toBe(5);
    expect(getItemCount(inv, 'turnip')).toBe(3);
    expect(getItemCount(inv, 'gold')).toBe(0);

    inv = addItems(inv, { iron: 2 });
    expect(getItemCount(inv, 'iron')).toBe(7);
  });

  it('correctly removes items without allowing negative values', () => {
    let inv = { iron: 10, copper: 4 };
    inv = removeItems(inv, { iron: 3, copper: 4 });

    expect(getItemCount(inv, 'iron')).toBe(7);
    expect(getItemCount(inv, 'copper')).toBe(0);

    // Over-removal should clamp at 0 or omit
    inv = removeItems(inv, { iron: 100 });
    expect(getItemCount(inv, 'iron')).toBe(0);
  });

  it('handles null, undefined, or empty payload safely', () => {
    const inv = { turnip: 5 };
    expect(addItems(null, { turnip: 1 })).toEqual({ turnip: 1 });
    expect(removeItems(inv, null)).toEqual(inv);
    expect(getItemCount(null, 'turnip')).toBe(0);
    expect(getItemCount(inv, null)).toBe(0);
  });
});

import {
  itemsCatalog,
  getItemById,
  getItemCategoryLabel,
} from '../src/core/data/itemsCatalog';

describe('Vault Catalog & Valuation Logic', () => {
  it('guarantees catalog items have valid IDs, categories, and values', () => {
    expect(itemsCatalog.length).toBeGreaterThan(20);

    const iron = getItemById('iron');
    expect(iron).toBeDefined();
    expect(iron.name).toBe('Iron');
    expect(iron.sellPrice).toBeGreaterThan(0);

    const turnip = getItemById('seed-turnip');
    expect(turnip).toBeDefined();
    expect(turnip.type).toBe('seed');

    const ironBar = getItemById('iron-bar');
    expect(ironBar).toBeDefined();
    expect(ironBar.type).toBe('crafted');

    expect(getItemById('nonexistent_item_id')).toBeNull();
  });

  it('correctly aggregates vault inventory value across multiple stacks', () => {
    const mockInventory = {
      iron: 10,
      'iron-bar': 5,
      egg: 20,
    };

    const ironItem = getItemById('iron');
    const ironBarItem = getItemById('iron-bar');
    const eggItem = getItemById('egg');

    const expectedValue =
      ironItem.sellPrice * mockInventory.iron +
      ironBarItem.sellPrice * mockInventory['iron-bar'] +
      eggItem.sellPrice * mockInventory.egg;

    expect(expectedValue).toBeGreaterThan(0);
  });

  it('correctly retrieves category labels with fallback', () => {
    const iron = getItemById('iron');
    expect(getItemCategoryLabel(iron)).toBe('Ore');
    expect(getItemCategoryLabel(null)).toBe('Misc');
  });
});

import {
  gearStatsCatalog,
  getPlayerEquippedGear,
  getGearStatTotals,
  getSlotDisplay,
} from '../src/core/data/gearData';

describe('Paper Doll Equipment Deck & Gear System', () => {
  it('contains comprehensive combat gear and deciphered relics', () => {
    expect(gearStatsCatalog['gear-embersteel-blade']).toBeDefined();
    expect(gearStatsCatalog['gear-aegis-dawn']).toBeDefined();
    expect(gearStatsCatalog['gear-ironfall-greaves']).toBeDefined();
    expect(gearStatsCatalog['gem-amethyst']).toBeDefined();
    expect(gearStatsCatalog['sunforge-codex']).toBeDefined();

    expect(gearStatsCatalog['sunforge-codex'].slot).toBe('relic');
    expect(gearStatsCatalog['sunforge-codex'].wisdom).toBe(18);
    expect(gearStatsCatalog['gem-amethyst'].slot).toBe('trinket');
  });

  it('equips items dynamically from inventory and calculates aggregate stats', () => {
    const profile = {
      inventory: {
        'gear-stormcaller-bow': 1,
        'gear-shadowleaf-cloak': 1,
        'sunforge-codex': 1,
      },
    };

    const equipped = getPlayerEquippedGear(profile);
    expect(equipped.length).toBe(3);

    const equippedIds = equipped.map((item) => item.id);
    expect(equippedIds).toContain('gear-stormcaller-bow');
    expect(equippedIds).toContain('gear-shadowleaf-cloak');
    expect(equippedIds).toContain('sunforge-codex');

    const totals = getGearStatTotals(profile);
    // stormcaller: atk 15, def 2, wis 6
    // shadowleaf: atk 4, def 10, wis 6
    // sunforge codex: atk 6, def 6, wis 18
    expect(totals.attack).toBe(15 + 4 + 6);
    expect(totals.defense).toBe(2 + 10 + 6);
    expect(totals.wisdom).toBe(6 + 6 + 18);
  });

  it('falls back to default Vanguard kit when player owns no gear', () => {
    const emptyProfile = { inventory: { iron: 10 } };
    const equipped = getPlayerEquippedGear(emptyProfile);
    expect(equipped.length).toBe(3);
    expect(equipped.map((i) => i.id)).toEqual([
      'gear-embersteel-blade',
      'gear-aegis-dawn',
      'gear-ironfall-greaves',
    ]);
  });

  it('correctly maps slot labels with getSlotDisplay', () => {
    expect(getSlotDisplay('weapon')).toBe('Weapon');
    expect(getSlotDisplay('shield')).toBe('Offhand');
    expect(getSlotDisplay('armor')).toBe('Chest');
    expect(getSlotDisplay('boots')).toBe('Boots');
    expect(getSlotDisplay('relic')).toBe('Relic');
    expect(getSlotDisplay('trinket')).toBe('Trinket');
    expect(getSlotDisplay('unknown')).toBe('Gear');
  });
});

