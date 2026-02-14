export const categories = ['All', 'Sword', 'Shield', 'Armor', 'Bow', 'Staff'];
export const levels = ['All', 'Lv 10+', 'Lv 12+', 'Lv 16+', 'Lv 18+', 'Lv 20+', 'Lv 22+'];

const MARKET_LISTINGS_KEY = 'marketListings';

export const inventoryItems = [
  {
    id: 'gear-embersteel-blade',
    name: 'Embersteel Blade',
    category: 'Sword',
    condition: 'Refined',
    level: 'Lv 18+',
    rarity: 'Epic',
    image: '/raceicon/noimage.webp',
    description: 'Forged for duels. +18% power on critical strikes.',
    estimate: 310,
  },
  {
    id: 'gear-aegis-dawn',
    name: 'Aegis of Dawn',
    category: 'Shield',
    condition: 'Used',
    level: 'Lv 22+',
    rarity: 'Rare',
    image: '/raceicon/noimage.webp',
    description: 'Blocks 12% more damage in ranked arena fights.',
    estimate: 395,
  },
  {
    id: 'gear-shadowleaf-cloak',
    name: 'Shadowleaf Cloak',
    category: 'Armor',
    condition: 'Worn',
    level: 'Lv 12+',
    rarity: 'Uncommon',
    image: '/raceicon/noimage.webp',
    description: 'Favored by scouts. +6% evasion in night zones.',
    estimate: 230,
  },
  {
    id: 'gear-stormcaller-bow',
    name: 'Stormcaller Bow',
    category: 'Bow',
    condition: 'New',
    level: 'Lv 16+',
    rarity: 'Rare',
    image: '/raceicon/noimage.webp',
    description: 'Lightning-tuned arrows. +9% critical chance.',
    estimate: 270,
  },
  {
    id: 'gear-runebound-staff',
    name: 'Runebound Staff',
    category: 'Staff',
    condition: 'Refined',
    level: 'Lv 20+',
    rarity: 'Epic',
    image: '/raceicon/noimage.webp',
    description: 'Arcane focus that amplifies spell damage by 14%.',
    estimate: 360,
  },
  {
    id: 'gear-ironfall-greaves',
    name: 'Ironfall Greaves',
    category: 'Armor',
    condition: 'Used',
    level: 'Lv 10+',
    rarity: 'Common',
    image: '/raceicon/noimage.webp',
    description: 'Reinforced boots for arena charges.',
    estimate: 190,
  },
];

export const marketListings = [
  {
    id: 'listing-embersteel-blade',
    itemId: 'gear-embersteel-blade',
    seller: 'Nyx',
    price: 320,
    state: 'New',
    createdAt: 1707200000000,
  },
  {
    id: 'listing-aegis-dawn',
    itemId: 'gear-aegis-dawn',
    seller: 'Thorin',
    price: 410,
    state: 'Used',
    createdAt: 1707286400000,
  },
  {
    id: 'listing-stormcaller-bow',
    itemId: 'gear-stormcaller-bow',
    seller: 'Lira',
    price: 275,
    state: 'New',
    createdAt: 1707372800000,
  },
  {
    id: 'listing-runebound-staff',
    itemId: 'gear-runebound-staff',
    seller: 'Sael',
    price: 360,
    state: 'Refined',
    createdAt: 1707459200000,
  },
  {
    id: 'listing-shadowleaf-cloak',
    itemId: 'gear-shadowleaf-cloak',
    seller: 'Nyx',
    price: 240,
    state: 'Worn',
    createdAt: 1707545600000,
  },
  {
    id: 'listing-ironfall-greaves',
    itemId: 'gear-ironfall-greaves',
    seller: 'Brom',
    price: 190,
    state: 'Used',
    createdAt: 1707632000000,
  },
];

export const getMarketListings = () => {
  try {
    const raw = localStorage.getItem(MARKET_LISTINGS_KEY);
    return raw ? JSON.parse(raw) : marketListings;
  } catch {
    return marketListings;
  }
};

export const saveMarketListings = (listings) => {
  try {
    localStorage.setItem(MARKET_LISTINGS_KEY, JSON.stringify(listings));
  } catch {
    // Ignore storage failures.
  }
};

export const addMarketListing = (listing) => {
  const current = getMarketListings();
  const next = [
    ...current,
    {
      createdAt: Date.now(),
      ...listing,
    },
  ];
  saveMarketListings(next);
  return next;
};

export const getListingCount = (itemId) => {
  return getMarketListings().filter((listing) => listing.itemId === itemId).length;
};
