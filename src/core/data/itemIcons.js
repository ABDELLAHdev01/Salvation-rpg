/**
 * Salvation Item Icon Registry
 * Maps domain item IDs to authentic, production-ready 32x32 pixel-art icons.
 */

export const ITEM_ICON_MAP = {
  // Potions & Elixirs (CraftPix authentic 32x32 pixel art)
  'health-potion': '/assets/items/potion_health.png',
  'potion-health': '/assets/items/potion_health.png',
  'mana-potion': '/assets/items/potion_mana.png',
  'potion-mana': '/assets/items/potion_mana.png',
  'stamina-tonic': '/assets/items/potion_stamina.png',
  'potion-greater': '/assets/items/potion_health_greater.png',
  'potion-rejuvenation': '/assets/items/potion_rejuvenation.png',
  'potion-stamina': '/assets/items/potion_stamina.png',
  'potion-strength': '/assets/items/potion_strength.png',

  // Raw Ores & Minerals
  iron: '/assets/items/item_iron_ore.png',
  'iron-ore': '/assets/items/item_iron_ore.png',
  copper: '/assets/items/item_copper_ore.png',
  'copper-ore': '/assets/items/item_copper_ore.png',
  gold: '/assets/items/item_gold_ore.png',
  'gold-ore': '/assets/items/item_gold_ore.png',
  'mystery-geode': '/assets/items/item_crystal_geode.png',

  // Smelted Metal Bars / Ingots
  'iron-bar': '/assets/items/item_iron_bar.png',
  'copper-bar': '/assets/items/item_copper_bar.png',
  'gold-bar': '/assets/items/item_gold_bar.png',

  // Weapons & Tools
  steel_broadsword: '/assets/items/item_sword.png',
  'steel-sword': '/assets/items/item_sword.png',
  iron_pickaxe: '/assets/items/item_pickaxe.png',
  pickaxe: '/assets/items/item_pickaxe.png',
  forged_scythe: '/assets/items/item_scythe.png',
  scythe: '/assets/items/item_scythe.png',
  oak_staff: '/assets/items/item_wand.png',
  wand: '/assets/items/item_wand.png',

  // Harvested Farm Crops & Goods
  turnip: '/assets/items/item_turnip.png',
  wheat: '/assets/items/item_wheat.png',
  herb: '/assets/items/item_herb.png',
  moonberry: '/assets/items/item_moonberry.png',
  sunroot: '/assets/items/item_sunroot.png',
  egg: '/assets/items/item_egg.png',
  wool: '/assets/items/item_wool.png',

  // Seed Varieties
  'seed-turnip': '/assets/items/item_seed_pouch.png',
  'seed-wheat': '/assets/items/item_seed_pouch.png',
  'seed-herb': '/assets/items/item_seed_pouch.png',
  'seed-moonberry': '/assets/items/item_seed_pouch.png',
  'seed-sunroot': '/assets/items/item_seed_pouch.png',

  // Monster Drops, Hunt Loot & Quests
  'slime-gel': '/assets/items/item_slime_gel.png',
  'wolf-pelt': '/assets/items/item_wolf_pelt.png',
  'boar-meat': '/assets/items/item_meat.png',
  'beast-hide': '/assets/items/item_hide.png',
  'fox-pelt': '/assets/items/item_fox_pelt.png',
  'dungeon-relic': '/assets/items/item_relic.png',
  'bone-shard': '/assets/items/item_bone_shard.png',
  'contract-sigil': '/assets/items/item_contract_sigil.png',
  'gold-coin': '/assets/items/item_gold_coin.png',
};

/**
 * Returns the verified pixel-art image path for any item ID with intelligent fallbacks
 */
export function getItemIcon(itemId) {
  if (!itemId) return '/assets/items/item_seed_pouch.png';
  if (ITEM_ICON_MAP[itemId]) return ITEM_ICON_MAP[itemId];

  const lower = String(itemId).toLowerCase();
  if (lower.startsWith('seed')) return '/assets/items/item_seed_pouch.png';
  if (lower.includes('potion') || lower.includes('elixir')) return '/assets/items/potion_health.png';
  if (lower.includes('ore') || lower.includes('stone') || lower.includes('rock')) return '/assets/items/item_iron_ore.png';
  if (lower.includes('bar') || lower.includes('ingot')) return '/assets/items/item_iron_bar.png';
  if (lower.includes('sword') || lower.includes('blade')) return '/assets/items/item_sword.png';
  if (lower.includes('pick')) return '/assets/items/item_pickaxe.png';
  if (lower.includes('scythe')) return '/assets/items/item_scythe.png';
  if (lower.includes('staff') || lower.includes('wand')) return '/assets/items/item_wand.png';
  if (lower.includes('gold') || lower.includes('coin')) return '/assets/items/item_gold_coin.png';

  return '/assets/items/item_seed_pouch.png';
}

export default getItemIcon;
