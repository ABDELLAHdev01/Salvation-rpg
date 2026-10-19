export const gearStatsCatalog = {
  'gear-embersteel-blade': {
    id: 'gear-embersteel-blade',
    name: 'Embersteel Blade',
    category: 'Sword',
    slot: 'weapon',
    level: 'Lv 18+',
    rarity: 'Epic',
    image: '/raceicon/noimage.webp',
    attack: 18,
    defense: 4,
    wisdom: 2,
    description: 'Forged for duels. +18% power on critical strikes.',
  },
  'gear-stormcaller-bow': {
    id: 'gear-stormcaller-bow',
    name: 'Stormcaller Bow',
    category: 'Bow',
    slot: 'weapon',
    level: 'Lv 16+',
    rarity: 'Rare',
    image: '/raceicon/noimage.webp',
    attack: 15,
    defense: 2,
    wisdom: 6,
    description: 'Lightning-tuned arrows. +9% critical chance.',
  },
  'gear-runebound-staff': {
    id: 'gear-runebound-staff',
    name: 'Runebound Staff',
    category: 'Staff',
    slot: 'weapon',
    level: 'Lv 20+',
    rarity: 'Epic',
    image: '/raceicon/noimage.webp',
    attack: 8,
    defense: 4,
    wisdom: 20,
    description: 'Arcane focus that amplifies spell damage by 14%.',
  },
  'gear-aegis-dawn': {
    id: 'gear-aegis-dawn',
    name: 'Aegis of Dawn',
    category: 'Shield',
    slot: 'shield',
    level: 'Lv 22+',
    rarity: 'Rare',
    image: '/raceicon/noimage.webp',
    attack: 2,
    defense: 18,
    wisdom: 4,
    description: 'Blocks 12% more damage in ranked arena fights.',
  },
  'gear-shadowleaf-cloak': {
    id: 'gear-shadowleaf-cloak',
    name: 'Shadowleaf Cloak',
    category: 'Armor',
    slot: 'armor',
    level: 'Lv 12+',
    rarity: 'Uncommon',
    image: '/raceicon/noimage.webp',
    attack: 4,
    defense: 10,
    wisdom: 6,
    description: 'Favored by scouts. +6% evasion in night zones.',
  },
  'gear-ironfall-greaves': {
    id: 'gear-ironfall-greaves',
    name: 'Ironfall Greaves',
    category: 'Armor',
    slot: 'boots',
    level: 'Lv 10+',
    rarity: 'Common',
    image: '/raceicon/noimage.webp',
    attack: 2,
    defense: 12,
    wisdom: 0,
    description: 'Reinforced boots for arena charges.',
  },
  'contract-sigil': {
    id: 'contract-sigil',
    name: 'Arena Sigil',
    category: 'Token',
    slot: 'trinket',
    level: 'Lv 1+',
    rarity: 'Rare',
    image: '/raceicon/noimage.webp',
    attack: 3,
    defense: 3,
    wisdom: 5,
    description: 'Conferred by the Grand Arbiter for valor in the Colosseum.',
  },
  'gem-amethyst': {
    id: 'gem-amethyst',
    name: 'Polished Amethyst',
    category: 'Relic',
    slot: 'trinket',
    level: 'Lv 3+',
    rarity: 'Rare',
    image: '/raceicon/noimage.webp',
    attack: 2,
    defense: 4,
    wisdom: 8,
    description: 'Cracked from subterranean geodes. Emits a resonant purple luminescence.',
  },
  'sunforge-codex': {
    id: 'sunforge-codex',
    name: 'Sunforge Codex',
    category: 'Relic',
    slot: 'relic',
    level: 'Lv 5+',
    rarity: 'Epic',
    image: '/raceicon/noimage.webp',
    attack: 6,
    defense: 6,
    wisdom: 18,
    description: 'Ancient celestial blueprints deciphered in the Workshop Scriptorium.',
  },
};

const defaultVanguardKit = [
  gearStatsCatalog['gear-embersteel-blade'],
  gearStatsCatalog['gear-aegis-dawn'],
  gearStatsCatalog['gear-ironfall-greaves'],
];

/**
 * Returns an array of equipped gear items based on profile inventory and explicit loadout.
 * Falls back to the default Vanguard starter set if no gear is owned.
 */
export const getPlayerEquippedGear = (profile) => {
  if (!profile) {
    return [];
  }

  const inventory = profile.inventory || {};
  const equipped = [];
  const ownedGearIds = Object.keys(inventory).filter(
    (id) => gearStatsCatalog[id] && Number(inventory[id]) > 0
  );

  if (ownedGearIds.length > 0) {
    const slots = ['weapon', 'shield', 'armor', 'boots', 'relic', 'trinket'];
    slots.forEach((slot) => {
      const matching = ownedGearIds
        .map((id) => gearStatsCatalog[id])
        .filter((item) => item.slot === slot)
        .sort(
          (a, b) =>
            b.attack + b.defense + b.wisdom - (a.attack + a.defense + a.wisdom)
        );
      if (matching[0]) {
        equipped.push(matching[0]);
      }
    });
  }

  // If no weapon, shield or armor was found in inventory, supply standard Vanguard kit
  if (equipped.length === 0) {
    return defaultVanguardKit;
  }

  return equipped;
};

/**
 * Aggregates combat stat bonuses from equipped gear.
 * If profile has no inventory and no equippedGear, returns zero bonuses (preserving test isolation).
 */
export const getGearStatTotals = (profile) => {
  if (!profile || (!profile.inventory && !profile.equippedGear)) {
    return { attack: 0, defense: 0, wisdom: 0 };
  }

  const gearList = getPlayerEquippedGear(profile);
  return gearList.reduce(
    (acc, item) => ({
      attack: acc.attack + (item.attack || 0),
      defense: acc.defense + (item.defense || 0),
      wisdom: acc.wisdom + (item.wisdom || 0),
    }),
    { attack: 0, defense: 0, wisdom: 0 }
  );
};

export const getSlotDisplay = (slot) => {
  switch (slot) {
    case 'weapon':
      return 'Weapon';
    case 'shield':
      return 'Offhand';
    case 'armor':
      return 'Chest';
    case 'boots':
      return 'Boots';
    case 'trinket':
      return 'Trinket';
    case 'relic':
      return 'Relic';
    default:
      return 'Gear';
  }
};
