/**
 * Salvation RPG Guild & Fellowship Data
 * Connects player factions to their sworn Order halls, mentors, and tithe progression.
 */

export const guildOrders = {
  eldoria: {
    id: 'eldoria',
    cityId: 'eldoria',
    orderName: 'Verdant Order of the Spire',
    bastion: 'Eldoria Citadel',
    motto: 'Roots run deep; the harvest sustains the realm.',
    crest: '/cities/Eldoria.webp',
    bannerPerk: '+15% crop growth velocity & forage yield',
    rankThresholds: [
      { minRenown: 0, title: 'Spire Initiate' },
      { minRenown: 100, title: 'Leafwarden' },
      { minRenown: 300, title: 'Spire Sentinel' },
      { minRenown: 600, title: 'High Bloomkeeper' },
    ],
    companions: [
      {
        name: 'Lady Selyse',
        title: 'The Green Warden',
        role: 'Grand Archivist',
        avatar: '/raceicon/elf_female_1.webp',
        status: 'Overseeing the sacred nursery',
      },
      {
        name: 'Rowan Wildstride',
        title: 'Ranger Captain',
        role: 'Frontier Scout',
        avatar: '/raceicon/human_male_1.webp',
        status: 'Scouting the Mistridge border',
      },
      {
        name: 'Lyra Moonwhisper',
        title: 'Canopy Druid',
        role: 'Herbalist',
        avatar: '/raceicon/elf_female_2.webp',
        status: 'Brewing restorative tonics',
      },
    ],
  },
  valoria: {
    id: 'valoria',
    cityId: 'valoria',
    orderName: 'Dawnforged Vanguard',
    bastion: 'Valoria Sunspire',
    motto: 'In gold and sunlight we stand unyielding.',
    crest: '/cities/Valoria.webp',
    bannerPerk: '+12% merchant valuation on all exported goods',
    rankThresholds: [
      { minRenown: 0, title: 'Shieldbearer' },
      { minRenown: 100, title: 'Dawn Knight' },
      { minRenown: 300, title: 'Solar Paladin' },
      { minRenown: 600, title: 'Grand Justiciar' },
    ],
    companions: [
      {
        name: 'Master Elric',
        title: 'Arcane Smith',
        role: 'Forge Master',
        avatar: '/raceicon/human_male_2.webp',
        status: 'Hammering runic blades at the anvil',
      },
      {
        name: 'Commander Korran',
        title: 'Sunblade Marshal',
        role: 'Vanguard Commander',
        avatar: '/raceicon/orc_male_1.webp',
        status: 'Drilling legionnaires in the courtyard',
      },
      {
        name: 'Dame Vivienne',
        title: 'High Inquisitor',
        role: 'Order Treasurer',
        avatar: '/raceicon/human_female_1.webp',
        status: 'Balancing the imperial treasury',
      },
    ],
  },
  drakmor: {
    id: 'drakmor',
    cityId: 'drakmor',
    orderName: 'Deepstone Ironclad',
    bastion: 'Drakmor Chasm',
    motto: 'From the deepest darkness, we strike pure ore.',
    crest: '/cities/Drakmor.webp',
    bannerPerk: '+5 Pickaxe impact force & +15% ore shatter yields',
    rankThresholds: [
      { minRenown: 0, title: 'Mine Tender' },
      { minRenown: 100, title: 'Stonebreaker' },
      { minRenown: 300, title: 'Iron Thane' },
      { minRenown: 600, title: 'Lord of the Deeps' },
    ],
    companions: [
      {
        name: 'Old Bran',
        title: 'Deep Delver',
        role: 'Elder Patriarch',
        avatar: '/raceicon/dwarf_male_1.webp',
        status: 'Inspecting deep shaft safety supports',
      },
      {
        name: 'Kaelen Ashveil',
        title: 'Pyreclad Warden',
        role: 'Tunnel Scout',
        avatar: '/raceicon/demon_male_1.webp',
        status: 'Patrolling subterranean volcanic vents',
      },
      {
        name: 'Bruna Ironhand',
        title: 'Siege Artificer',
        role: 'Foundry Overseer',
        avatar: '/raceicon/orc_female_1.webp',
        status: 'Smelting darksteel ingots for the armory',
      },
    ],
  },
};

export const getGuildOrder = (cityId) => {
  const normalized = String(cityId || '').toLowerCase().trim();
  return guildOrders[normalized] || guildOrders.valoria;
};

export const calculateGuildRank = (renown = 0, order) => {
  const currentOrder = order || guildOrders.valoria;
  const thresholds = currentOrder.rankThresholds;
  let activeRank = thresholds[0];
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (renown >= thresholds[i].minRenown) {
      activeRank = thresholds[i];
      break;
    }
  }
  return activeRank.title;
};

export const guildTithes = [
  {
    id: 'gold-tithe',
    label: 'Imperial Gold Offering',
    description: 'Provide coins to fund order expeditions and border fortifications.',
    cost: { type: 'gold', amount: 80 },
    rewardRenown: 25,
    rewardSigils: 1,
  },
  {
    id: 'harvest-tithe',
    label: 'Harvest Grain Provision',
    description: 'Dispatch 10 Turnips to provision order garrisons during winter.',
    cost: { type: 'item', itemId: 'turnip', amount: 10 },
    rewardRenown: 30,
    rewardSigils: 1,
  },
  {
    id: 'mineral-tithe',
    label: 'Armory Ore Ingot',
    description: 'Donate 5 Iron Ore to furnish order blacksmiths with raw stock.',
    cost: { type: 'item', itemId: 'iron-ore', amount: 5 },
    rewardRenown: 35,
    rewardSigils: 1,
  },
];
