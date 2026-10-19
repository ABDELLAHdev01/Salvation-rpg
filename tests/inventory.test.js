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
