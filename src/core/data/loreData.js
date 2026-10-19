/**
 * Lore Data - The Canonical Compendium of Salvation
 * Contains World Lore, Faction Geopolitics, Dramatis Personae (Mentors), and Chronicle Entries.
 */

export const worldHistory = [
  {
    id: 'sunforge',
    title: 'The Sunforge of Aethelgard',
    era: 'The Age of Radiance',
    text: 'A millennium ago, the realm of Aethelgard basked in the warmth of the Sunforge—a colossal celestial engine situated atop the Mount of Dawn. The ancient Wardens tended its perpetual flames, holding the nocturnal frost and abyssal horrors at bay while civilization flourished in harmony with the living earth.',
    quote: 'Where the Sunforge burns, no shadow can take root.',
  },
  {
    id: 'eclipse',
    title: 'The Great Eclipse & The Shattering',
    era: 'The Cataclysm',
    text: 'Seven generations ago, the celestial alignment failed. A creeping metaphysical chill known as the Shadow Tide seeped from the subterranean chasms, freezing the Sunforge\'s core and shattering the imperial peace into three squabbling bastions of survival.',
    quote: 'The skies wept ash, and the warmth of a thousand winters was extinguished in a night.',
  },
  {
    id: 'hearthlands',
    title: 'The Desolate Hearthlands',
    era: 'The Cold Present',
    text: 'Between the survivor cities lie the Hearthlands: mist-shrouded ruins of once-fertile valleys, forgotten farmsteads, and deep mining shafts overrun by twilight frost. Yet dormant solar leylines still pulse beneath the cold soil, waiting for an Oathbound Warden to rekindle the ancestral hearths.',
    quote: 'The soil still remembers the flame, even if the world has forgotten.',
  },
  {
    id: 'salvation_meaning',
    title: 'The Meaning of Salvation',
    era: 'The Warden\'s Creed',
    text: 'Salvation is not found on the battlefield with drawn swords; it is cultivated in the furrowed dirt. It is the steady glow of an iron forge on a winter night, bread baked from harvested wheat, warm fleece sheared from pasture sheep, and pure silver drawn from the deep dark to repair the ancient wards.',
    quote: 'To bring Salvation is to rebuild the sanctuary where life can endure.',
  },
];

export const estateMentors = [
  {
    id: 'elric',
    name: 'Elric the Hearthsmith',
    title: 'Master of the Smelter & Forge',
    domain: 'Workshop & Metallurgy',
    avatar: '/raceicon/humanmale.webp',
    city: 'drakmor',
    lore: 'A weathered, one-eyed blacksmith who formerly served the Drakmor Ironfang Legion before retiring to the frontier. He believes honest metallurgy and disciplined craft are the only true shields against the creeping frost.',
    quote: 'Cold iron doesn\'t lie to you, Warden. Treat it right, and it holds your roof up when the wind screams.',
    tip: 'Crafted bars and woven textiles guarantee higher profit in the market than selling raw ore and fleece.',
  },
  {
    id: 'selyse',
    name: 'Selyse of the Sylvan Root',
    title: 'Keeper of the Ancient Seed',
    domain: 'Farming & Botanical Rites',
    avatar: '/raceicon/elfefemale.webp',
    city: 'eldoria',
    lore: 'An Eldorian herbalist draped in living moss and woven linen. She communes with dormant leylines and teaches that soil nourished with patience and seasonal care will drive back the shadow mist.',
    quote: 'The seeds remember the Sunforge even if our scholars have forgotten. Listen to the soil before you strike it with iron.',
    tip: 'Matching crops to their favorable season dramatically speeds growth and unlocks bonus yields.',
  },
  {
    id: 'moira',
    name: 'Moira Ironhoof',
    title: 'Mistress of the Pastures',
    domain: 'Animal Husbandry & Flocks',
    avatar: '/raceicon/dwarffemale.webp',
    city: 'eldoria',
    lore: 'An ex-caravan teamster who found solace raising resilient beasts on the frontier. She treats every cow, goat, and sheep as family and teaches the art of crop feeding to multiply harvest yields.',
    quote: 'Give a beast warm straw and honest grain, and it\'ll give you more loyalty than any noble in Valoria.',
    tip: 'Feed your livestock fresh turnips and wheat to cut their production cycles in half and gain husbandry XP.',
  },
  {
    id: 'bran',
    name: 'Old Bran the Delver',
    title: 'Scout of the Sunken Shafts',
    domain: 'Mines & Caverns',
    avatar: '/raceicon/dwarfmale.webp',
    city: 'drakmor',
    lore: 'A retired shaft miner with pickaxe calluses and stone-dust cough. Having survived two cave-ins, he knows the songs of the rocks and can hear the resonance of hidden geode pockets deep in the strata.',
    quote: 'Hear that deep hum beneath the copper seam? That\'s not rock settling, lad. That\'s the mountain breathing.',
    tip: 'Higher tier pickaxes not only strike harder, but also uncover rare uncracked geodes in the depths.',
  },
  {
    id: 'gideon',
    name: 'High Commissioner Gideon',
    title: 'Emissary of the Gilded Spires',
    domain: 'Market & Trade Contracts',
    avatar: '/raceicon/humanmale.webp',
    city: 'valoria',
    lore: 'An elegant, perfumed emissary from the Valorian Merchant Consortium. While cynical and strictly transactional, he recognizes that a thriving Hearthland estate is the key to reopening imperial trade routes.',
    quote: 'Gold is simply frozen confidence, Warden. Supply the city with wheat, and Valoria will fund your private kingdom.',
    tip: 'Check market demand frequently; bulk liquidating surplus goods saves trading fees.',
  },
];

export const factionLore = [
  {
    id: 'eldoria',
    name: 'Eldoria',
    kicker: 'The Forest Sanctuary',
    theme: 'Nature & Mysticism',
    logo: '/cities/Eldoria.webp',
    background: '/cities/EldoriaCity.webp',
    philosophy: 'Harmony with the wild boughs. The living earth is our armor.',
    description: 'Sheltered beneath the colossal canopy of ancient ironwood trees, Eldorians preserve pre-cataclysm botanical rites. They distrust industrial chimneys, relying instead on druidic song, root-weaving, and patient cultivation.',
    passiveName: 'Sun-Blessed Soil',
    passiveBonus: '+15% Crop Growth Speed across all estate plots.',
  },
  {
    id: 'valoria',
    name: 'Valoria',
    kicker: 'The City of Golden Spires',
    theme: 'Wealth & Enterprise',
    logo: '/cities/Valoria.webp',
    background: '/cities/ValoriaCity.webp',
    philosophy: 'Prosperity builds bastions that blades cannot pierce.',
    description: 'Rising from radiant limestone cliffs above the Sunken Bay, Valoria is an empire of merchants, bankers, and master artisans. Where others see ruin, Valorians see market opportunity, monopolizing luxury trade and naval routes.',
    passiveName: 'Gilded Merchant Trade',
    passiveBonus: '+12% Bonus Gold on all market sales.',
  },
  {
    id: 'drakmor',
    name: 'Drakmor',
    kicker: 'The Forge of Warriors',
    theme: 'Strength & Metallurgy',
    logo: '/cities/Drakmor.webp',
    background: '/cities/DarkmorCity.webp',
    philosophy: 'Only that which is forged in hardship endures the cold.',
    description: 'Perched upon volcanic crags of black basalt, Drakmor breeds warriors and master smiths. They brave the subterranean chasms to quarry void-metal, believing that unyielding discipline is the only path to survival.',
    passiveName: 'Deep Vein Mastery',
    passiveBonus: '+5 Pickaxe Strike Damage & +15% Ore Harvest Yields.',
  },
];

export const wardenOath = {
  title: 'The Oath of the Solitary Hearth',
  inscription: 'I swear by the soil beneath my feet, by the cold stone of the deep, and by the spark of the unquenched forge: I shall tend the furrow, strike the vein, shelter the beast, and uphold the hearth until the light returns to Aethelgard.',
};
