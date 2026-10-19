/**
 * Character Customization Data Model & Palette Definitions
 * Supports layered 2D fantasy character generation.
 */

export const SKIN_TONES = [
  { id: 'fair', name: 'Fair Ivory', base: '#fde8d7', shadow: '#e6b99d', highlight: '#ffffff' },
  { id: 'peach', name: 'Warm Peach', base: '#f6d5b8', shadow: '#d9a985', highlight: '#fff2e6' },
  { id: 'tan', name: 'Sun-kissed Tan', base: '#d99f6b', shadow: '#b27745', highlight: '#f0c294' },
  { id: 'bronze', name: 'Valorian Bronze', base: '#a86f40', shadow: '#7d491f', highlight: '#c78f5e' },
  { id: 'dark', name: 'Deep Earth', base: '#684025', shadow: '#452613', highlight: '#8a5937' },
  { id: 'ashen', name: 'Moon Elf Ashen', base: '#cbd5e1', shadow: '#94a3b8', highlight: '#f1f5f9' },
  { id: 'pale', name: 'Vampiric Pale', base: '#e2e8f0', shadow: '#94a3b8', highlight: '#ffffff' },
];

export const HAIR_STYLES = [
  { id: 'short_crop', name: 'Warrior Crop', desc: 'Practical military cut' },
  { id: 'flowing_locks', name: 'Flowing Locks', desc: 'Long windswept locks' },
  { id: 'braided', name: 'Delver Braid', desc: 'Intricate Nordic braid' },
  { id: 'topknot', name: 'Duelist Topknot', desc: 'Traditional blademaster knot' },
  { id: 'wild_mane', name: 'Wild Shaman Mane', desc: 'Untamed wilderness curls' },
  { id: 'elven_ponytail', name: 'Elven High Ponytail', desc: 'Disciplined high tie' },
];

export const HAIR_COLORS = [
  { id: 'golden', name: 'Sunforge Gold', base: '#f59e0b', shadow: '#b45309', highlight: '#fef08a' },
  { id: 'crimson', name: 'Crimson Flame', base: '#dc2626', shadow: '#991b1b', highlight: '#f87171' },
  { id: 'obsidian', name: 'Obsidian Black', base: '#1e293b', shadow: '#0f172a', highlight: '#475569' },
  { id: 'silver', name: 'Silver Starlight', base: '#e2e8f0', shadow: '#94a3b8', highlight: '#ffffff' },
  { id: 'chestnut', name: 'Autumn Chestnut', base: '#78350f', shadow: '#451a03', highlight: '#a16207' },
  { id: 'arcane_teal', name: 'Arcane Teal', base: '#0d9488', shadow: '#115e59', highlight: '#5eead4' },
];

export const EYE_STYLES = [
  { id: 'sapphire', name: 'Sapphire Blue', color: '#38bdf8' },
  { id: 'emerald', name: 'Forest Emerald', color: '#22c55e' },
  { id: 'amber', name: 'Molten Amber', color: '#f59e0b' },
  { id: 'amethyst', name: 'Arcane Amethyst', color: '#c084fc' },
  { id: 'ruby', name: 'Dragon Ruby', color: '#ef4444' },
  { id: 'storm', name: 'Storm Grey', color: '#94a3b8' },
];

export const OUTFITS = [
  { id: 'adventurer_tunic', name: "Warden's Linen Tunic", desc: 'Classic leather-belted tunic' },
  { id: 'mage_robe', name: 'Arcane Mystic Robe', desc: 'Embroidered robes with rune sash' },
  { id: 'ranger_leathers', name: 'Scout Padded Leathers', desc: 'Studded wilderness armor' },
  { id: 'iron_plate', name: 'Heavy Crusader Cuirass', desc: 'Interlocking steel plates' },
  { id: 'noble_garb', name: 'Valorian Silk Doublet', desc: 'Fine gilded courtly vestment' },
];

export const OUTFIT_COLORS = [
  { id: 'forest_green', name: 'Valorian Forest', primary: '#15803d', secondary: '#166534', trim: '#fef08a' },
  { id: 'royal_crimson', name: 'Imperial Crimson', primary: '#b91c1c', secondary: '#7f1d1d', trim: '#fbbf24' },
  { id: 'celestial_blue', name: 'Celestial Indigo', primary: '#1d4ed8', secondary: '#1e3a8a', trim: '#93c5fd' },
  { id: 'void_black', name: 'Shadow Charcoal', primary: '#334155', secondary: '#1e293b', trim: '#cbd5e1' },
  { id: 'sun_gold', name: 'Sunforge Amber', primary: '#d97706', secondary: '#92400e', trim: '#fef3c7' },
];

export const HEADWEAR = [
  { id: 'none', name: 'None (Bare Head)' },
  { id: 'iron_helm', name: 'Iron Crusader Cap', color: '#71717a' },
  { id: 'leather_cowl', name: 'Scout Padded Cowl', color: '#78350f' },
  { id: 'wizard_hat', name: 'Pointed Arcane Hat', color: '#4338ca' },
  { id: 'golden_circlet', name: 'Sun-Crest Circlet', color: '#eab308' },
  { id: 'ranger_hood', name: 'Shadowwood Hood', color: '#166534' },
];

export const ACCESSORIES = [
  { id: 'none', name: 'None' },
  { id: 'warden_cloak', name: "Warden's Traveling Cloak" },
  { id: 'scout_quiver', name: 'Leather Back Quiver' },
  { id: 'scholar_satchel', name: 'Runemaster Side Satchel' },
  { id: 'hero_scarf', name: 'Flapping Crimson Scarf' },
];

export const EQUIPPED_TOOLS = [
  { id: 'iron_pickaxe', name: 'Forged Iron Pickaxe', type: 'mining', icon: '⛏️' },
  { id: 'forged_scythe', name: 'Farmer Harvest Scythe', type: 'farming', icon: '🌾' },
  { id: 'steel_broadsword', name: 'Tempered Broadsword', type: 'combat', icon: '⚔️' },
  { id: 'oak_staff', name: 'Elder Oak Wand', type: 'magic', icon: '🪄' },
];

export const DEFAULT_CUSTOMIZATION = {
  skinTone: 'fair',
  faceStyle: 'noble',
  hairstyle: 'flowing_locks',
  hairColor: 'golden',
  eyeStyle: 'sapphire',
  outfit: 'adventurer_tunic',
  outfitColor: 'forest_green',
  headwear: 'none',
  accessory: 'warden_cloak',
  equippedTool: 'iron_pickaxe',
};

export const sanitizeCustomization = (customization) => {
  if (!customization || typeof customization !== 'object') {
    return { ...DEFAULT_CUSTOMIZATION };
  }
  return {
    skinTone: SKIN_TONES.some((s) => s.id === customization.skinTone) ? customization.skinTone : DEFAULT_CUSTOMIZATION.skinTone,
    faceStyle: customization.faceStyle || DEFAULT_CUSTOMIZATION.faceStyle,
    hairstyle: HAIR_STYLES.some((h) => h.id === customization.hairstyle) ? customization.hairstyle : DEFAULT_CUSTOMIZATION.hairstyle,
    hairColor: HAIR_COLORS.some((c) => c.id === customization.hairColor) ? customization.hairColor : DEFAULT_CUSTOMIZATION.hairColor,
    eyeStyle: EYE_STYLES.some((e) => e.id === customization.eyeStyle) ? customization.eyeStyle : DEFAULT_CUSTOMIZATION.eyeStyle,
    outfit: OUTFITS.some((o) => o.id === customization.outfit) ? customization.outfit : DEFAULT_CUSTOMIZATION.outfit,
    outfitColor: OUTFIT_COLORS.some((c) => c.id === customization.outfitColor) ? customization.outfitColor : DEFAULT_CUSTOMIZATION.outfitColor,
    headwear: HEADWEAR.some((h) => h.id === customization.headwear) ? customization.headwear : DEFAULT_CUSTOMIZATION.headwear,
    accessory: ACCESSORIES.some((a) => a.id === customization.accessory) ? customization.accessory : DEFAULT_CUSTOMIZATION.accessory,
    equippedTool: EQUIPPED_TOOLS.some((t) => t.id === customization.equippedTool) ? customization.equippedTool : DEFAULT_CUSTOMIZATION.equippedTool,
  };
};

export const getRandomCustomization = () => {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)].id;
  return {
    skinTone: pick(SKIN_TONES),
    faceStyle: 'noble',
    hairstyle: pick(HAIR_STYLES),
    hairColor: pick(HAIR_COLORS),
    eyeStyle: pick(EYE_STYLES),
    outfit: pick(OUTFITS),
    outfitColor: pick(OUTFIT_COLORS),
    headwear: pick(HEADWEAR),
    accessory: pick(ACCESSORIES),
    equippedTool: pick(EQUIPPED_TOOLS),
  };
};
