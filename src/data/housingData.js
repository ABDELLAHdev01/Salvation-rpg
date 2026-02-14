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
    prompt:
      'A mythic fantasy residence beyond human wealth, enormous magical palace floating slightly above the ground, ancient runes, divine architecture, glowing crystals, epic scale, dark fantasy RPG style, ultra-realistic, cinematic masterpiece',
  },
];

export const getHousingTierById = (id) => housingTiers.find((tier) => tier.id === id);
