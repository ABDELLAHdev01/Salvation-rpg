export const housingTiers = [
  {
    id: 'starter-cottage',
    name: 'Starter Cottage',
    tier: 'New Player',
    levelRequired: 1,
    price: 0,
    image: '/houses/house_1.webp',
    effect: {
      name: 'Rested Comfort',
      detail: '+2% health regeneration in safe zones.',
      stat: 'Defense',
      percent: 2,
    },
    description:
      'A weather-beaten timber cottage resting on the perimeter of the settlement. Modest hearth embers ward off the night chill and provide quiet respite between frontier expeditions.',
    prompt:
      'A small medieval fantasy starter house made of old wood and rough stone, simple architecture, small door and tiny windows, slightly worn and rustic, located on the edge of a village, dirt ground, no decorations, warm natural lighting, realistic fantasy style, high detail, cinematic angle',
  },
  {
    id: 'modest-house',
    name: 'Modest House',
    tier: 'Early Progression',
    levelRequired: 4,
    price: 250,
    image: '/houses/house_2.webp',
    effect: {
      name: 'Sturdy Hearth',
      detail: '+3% shield strength on the first arena round.',
      stat: 'Defense',
      percent: 3,
    },
    description:
      'A solid stone and timber homestead fitted with cedar shutters and a chimney forged from kiln brick. Welcoming and sheltered from mountain tempest winds.',
    prompt:
      'A modest medieval fantasy house built with wood and stone, clean but simple design, small chimney, wooden shutters, surrounded by grass and a wooden fence, peaceful village atmosphere, daylight, realistic fantasy RPG style, detailed textures, cinematic framing',
  },
  {
    id: 'comfortable-house',
    name: 'Comfortable House',
    tier: 'Mid Game',
    levelRequired: 8,
    price: 700,
    image: '/houses/house_3.webp',
    effect: {
      name: 'Warmth of Home',
      detail: '+4% stamina recovery after quests.',
      stat: 'Wisdom',
      percent: 4,
    },
    description:
      'A spacious two-story estate adorned with brass sconces, blooming flower boxes, and a cellar stocked for long winters in the borderlands.',
    prompt:
      'A comfortable fantasy house with stone walls and wooden beams, tiled roof, medium size, flowers near the entrance, lanterns on the walls, well-maintained and cozy, located inside a medieval fantasy town, soft sunlight, realistic RPG environment, high detail',
  },
  {
    id: 'wealthy-house',
    name: 'Wealthy House',
    tier: 'Advanced Player',
    levelRequired: 12,
    price: 1400,
    image: '/houses/house_4.webp',
    effect: {
      name: 'Golden Wards',
      detail: '+5% defense for the first 60 seconds of combat.',
      stat: 'Defense',
      percent: 5,
    },
    description:
      'An architecturally sculpted manor of polished quarry stone, ornate oak doors, and iron-wrought balconies overlooking the bustling merchant plaza.',
    prompt:
      'A wealthy medieval fantasy house with refined stone architecture, large wooden doors, balconies, decorative carvings, glowing lanterns, clean courtyard, symbol of status, fantasy RPG style, ultra-detailed, cinematic lighting, high realism',
  },
  {
    id: 'noble-residence',
    name: 'Noble Residence',
    tier: 'Elite',
    levelRequired: 16,
    price: 2400,
    image: '/houses/house_5.webp',
    effect: {
      name: 'Courtly Blessing',
      detail: '+6% critical strike chance in arena duels.',
      stat: 'Attack',
      percent: 6,
    },
    description:
      'An aristocratic keep draped in heraldic banners and guarded by heavy portcullis gates. A testament to commanding authority and martial renown.',
    prompt:
      'An elite noble fantasy house resembling a small mansion, elegant stone structure, banners hanging from the walls, ornate windows, guarded entrance, luxurious medieval fantasy design, dramatic lighting, realistic RPG world, cinematic perspective',
  },
  {
    id: 'luxury-mansion',
    name: 'Luxury Mansion',
    tier: 'High-End',
    levelRequired: 20,
    price: 3600,
    image: '/houses/house_6.webp',
    effect: {
      name: 'Gilded Recovery',
      detail: '+7% healing received from potions.',
      stat: 'Wisdom',
      percent: 7,
    },
    description:
      'A grand palace of polished marble and gilded cornices, surrounded by private fountain courtyards and whispering arcane wardstones.',
    prompt:
      'A luxurious fantasy mansion with polished stone, gold-accented decorations, large arches, magical lanterns glowing softly, garden with statues and fountains, medieval high-fantasy setting, ultra-realistic, epic cinematic lighting',
  },
  {
    id: 'legendary-manor',
    name: 'Legendary Manor',
    tier: 'Endgame',
    levelRequired: 24,
    price: 5200,
    image: '/houses/house_7.webp',
    effect: {
      name: 'Runebound Resilience',
      detail: '+8% damage reduction after a dodge.',
      stat: 'Defense',
      percent: 8,
    },
    description:
      'An imposing citadel engraved with pulsing elder runes. Leyline energy flows through the stone arches, defying time, siege, and dark omens.',
    prompt:
      'A legendary fantasy house owned by a powerful hero, massive structure blending stone and magic, glowing runes engraved on the walls, floating elements, mystical aura, epic medieval fantasy RPG style, ultra-detailed, dramatic cinematic lighting',
  },
  {
    id: 'mythic-palace',
    name: 'Mythic Palace',
    tier: 'God-Tier',
    levelRequired: 30,
    price: 8200,
    image: '/houses/house_8.webp',
    effect: {
      name: 'Divine Shield',
      detail: '+10% max health and a radiant barrier every 3 fights.',
      stat: 'Defense',
      percent: 10,
    },
    description:
      'A sanctum forged from starlight and primordial titanite, levitating subtly above the mortal earth with radiant celestial barriers and ancient wisdom.',
    prompt:
      'A mythic fantasy residence beyond human wealth, enormous magical palace floating slightly above the ground, ancient runes, divine architecture, glowing crystals, epic scale, dark fantasy RPG style, ultra-realistic, cinematic masterpiece',
  },
];

export const getHousingTierById = (id) => housingTiers.find((tier) => tier.id === id);

export const estateAmenities = [
  {
    id: 'hearth-fire',
    name: 'Eternal Hearthfire',
    icon: '🔥',
    category: 'Comfort',
    price: 350,
    levelRequired: 3,
    buff: '+5% Player & Expedition XP',
    stat: 'xpBonus',
    percent: 5,
    description: 'A crackling stone hearth fueled by enchanted embers. Keeps spirits soaring and memories sharp.',
  },
  {
    id: 'delvers-trophy',
    name: "Delver's Dragonbone Trophy",
    icon: '⛏️',
    category: 'Delving',
    price: 500,
    levelRequired: 5,
    buff: '+8% Mining Ore Yield & Gem Chances',
    stat: 'miningBonus',
    percent: 8,
    description: 'Mounted upon the mantle, this fossilized beast horn honors the deep subterranean miners.',
  },
  {
    id: 'herbalist-drying-rack',
    name: 'Apothecary Herb Dry-Rack',
    icon: '🌿',
    category: 'Agriculture',
    price: 400,
    levelRequired: 4,
    buff: '+10% Crop Gold Value on Market',
    stat: 'cropBonus',
    percent: 10,
    description: 'Bundles of dried nightshade and sun-blossoms scenting the estate with botanical vigor.',
  },
  {
    id: 'training-dummy',
    name: 'Ironwood Practice Dummy',
    icon: '⚔️',
    category: 'Combat',
    price: 650,
    levelRequired: 6,
    buff: '+6% Colosseum Attack Power',
    stat: 'attackBonus',
    percent: 6,
    description: 'Reinforced with blackened iron straps, ready for midnight parrying exercises.',
  },
  {
    id: 'scrying-lectern',
    name: 'Runemaster Lectern',
    icon: '📜',
    category: 'Mysticism',
    price: 850,
    levelRequired: 8,
    buff: '+10% Max Shield Strength in Arena',
    stat: 'shieldBonus',
    percent: 10,
    description: 'An illuminated desk bearing star charts and protective incantations from ancient vales.',
  },
  {
    id: 'vault-coffer',
    name: 'Reinforced Iron Vault Coffer',
    icon: '💰',
    category: 'Economy',
    price: 1200,
    levelRequired: 10,
    buff: '+5% Gold on All Quest & Decree Claims',
    stat: 'goldBonus',
    percent: 5,
    description: 'A masterwork strongbox crafted with triple dwarven tumblers and lead lining.',
  },
];

export const getEstateAmenityById = (id) => estateAmenities.find((a) => a.id === id);

export const getActiveEstateBuffs = (profile) => {
  const ownedAmenities = Array.isArray(profile?.estateAmenities) ? profile.estateAmenities : [];
  const buffs = {
    xpBonus: 0,
    miningBonus: 0,
    cropBonus: 0,
    attackBonus: 0,
    shieldBonus: 0,
    goldBonus: 0,
  };

  ownedAmenities.forEach((id) => {
    const amenity = getEstateAmenityById(id);
    if (amenity && buffs[amenity.stat] !== undefined) {
      buffs[amenity.stat] += amenity.percent;
    }
  });

  return buffs;
};
