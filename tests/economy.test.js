import { describe, it, expect } from 'vitest';
import { workshopRecipes, workshopItems } from '../src/core/data/workshopData';
import { farmGoods } from '../src/core/data/farmData';
import { miningOres } from '../src/core/data/miningData';
import { getCityPerk } from '../src/core/data/citiesData';

describe('Economy and Crafting Balance', () => {
  const farmGoodPriceMap = farmGoods.reduce((acc, g) => {
    acc[g.id] = g.sellPrice;
    return acc;
  }, {});

  const miningOrePriceMap = miningOres.reduce((acc, o) => {
    acc[o.id] = o.price;
    return acc;
  }, {});

  it('guarantees every workshop recipe produces positive profit over raw ingredients', () => {
    workshopRecipes.forEach((recipe) => {
      let rawIngredientCost = 0;
      recipe.inputs.forEach((input) => {
        if (input.source === 'farm' || farmGoodPriceMap[input.id]) {
          rawIngredientCost += (farmGoodPriceMap[input.id] || 0) * input.amount;
        } else if (input.source === 'mining' || miningOrePriceMap[input.id]) {
          rawIngredientCost += (miningOrePriceMap[input.id] || 0) * input.amount;
        }
      });

      if (rawIngredientCost > 0) {
        // Output sellValue must exceed raw material cost
        expect(recipe.sellValue).toBeGreaterThan(rawIngredientCost);
        const margin = (recipe.sellValue - rawIngredientCost) / rawIngredientCost;
        // Verify margin is at least +18% (averaging 35-40%)
        expect(margin).toBeGreaterThanOrEqual(0.18);
      }
    });
  });

  it('contains valid workshop output catalog with positive values', () => {
    expect(workshopItems.length).toBeGreaterThan(0);
    workshopItems.forEach((item) => {
      expect(item.id).toBeDefined();
      expect(item.name).toBeDefined();
      expect(item.sellValue).toBeGreaterThan(0);
    });
  });

  it('applies the Valorian Gilded Merchant Trade perk (+12% gold on market sales)', () => {
    const perk = getCityPerk('valoria');
    expect(perk).toBeDefined();
    expect(perk.type).toBe('market-sell');
    expect(perk.value).toBe(0.12);

    const baseItemPrice = 100;
    const valoriaSellPrice = Math.round(baseItemPrice * (1 + perk.value));
    expect(valoriaSellPrice).toBe(112);
    expect(valoriaSellPrice).toBeGreaterThan(baseItemPrice);
  });
});
