/**
 * Freshwater and Cavern Fish Species of Salvation RPG
 */

export const FISH_SPECIES = [
  {
    id: 'river-trout',
    name: 'Silver River Trout',
    rarity: 'Common',
    color: '#94a3b8',
    icon: '🐟',
    weightRange: [1.2, 3.5],
    sellValue: 18,
    xpReward: 25,
    difficulty: 0.8, // Slower movement
  },
  {
    id: 'sylvan-salmon',
    name: 'Sylvan Red Salmon',
    rarity: 'Uncommon',
    color: '#f87171',
    icon: '🐠',
    weightRange: [3.0, 7.8],
    sellValue: 32,
    xpReward: 40,
    difficulty: 1.2,
  },
  {
    id: 'golden-carp',
    name: 'Imperial Sun Carp',
    rarity: 'Rare',
    color: '#fbbf24',
    icon: '🐡',
    weightRange: [4.5, 12.0],
    sellValue: 65,
    xpReward: 70,
    difficulty: 1.6,
  },
  {
    id: 'void-eel',
    name: 'Deep Cavern Void Eel',
    rarity: 'Epic',
    color: '#c084fc',
    icon: '🐍',
    weightRange: [2.0, 6.0],
    sellValue: 110,
    xpReward: 120,
    difficulty: 2.1,
  },
];
