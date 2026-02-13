export const rarityRank = {
    Common: 1,
    Uncommon: 2,
    Rare: 3,
    Epic: 4,
    Legendary: 5,
    Mythic: 6,
    Relic: 7,
};

export const marketFilters = [
    { id: 'all', label: 'All', predicate: () => true },
    { id: 'seeds', label: 'Seeds', predicate: (item) => item.type === 'seed' },
    { id: 'farm-goods', label: 'Farm Goods', predicate: (item) => item.type === 'farm-good' },
    { id: 'farm-animals', label: 'Farm Animals', predicate: (item) => item.type === 'farm-animal' },
    { id: 'ore', label: 'Ores', predicate: (item) => item.type === 'ore' },
    { id: 'consumables', label: 'Consumables', predicate: (item) => item.type === 'consumable' },
    { id: 'crafted', label: 'Crafted', predicate: (item) => item.type === 'crafted' },
    { id: 'gear', label: 'Gear', predicate: (item) => item.type === 'gear' },
    { id: 'tokens', label: 'Tokens', predicate: (item) => item.type === 'token' },
    {
        id: 'rare',
        label: 'Rare+',
        predicate: (item) => (rarityRank[item.rarity] || 0) >= 3,
    },
];

export const groupedFilters = marketFilters.filter((filter) => !['all', 'rare'].includes(filter.id));
