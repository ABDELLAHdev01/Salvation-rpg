/**
 * Cities Data - Defines the three starting cities for character creation
 * Each city represents a unique cultural identity and starting point
 */

export const cities = [
  {
    id: 'eldoria',
    name: 'Eldoria',
    displayName: 'Eldoria',
    theme: 'Nature & Mysticism',
    logo: '/cities/Eldoria.webp',
    lore: 'Hidden among ancient forests, Eldoria thrives in quiet strength. Its people value patience, balance, and unseen power.',
    mood: 'harmony',
    primaryColor: '#FFD700', // Gold/Yellow
    accentColor: '#FFA500',  // Orange/Yellow
    backgroundImage: '/cities/EldoriaCity.webp',
    fallbackGradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    attributes: {
      wealth: 'medium',
      trade: 'low',
      military: 'medium',
      magic: 'high',
    },
    perk: {
      id: 'sun_blessed_soil',
      name: 'Sun-Blessed Soil',
      description: '+15% crop growth speed across all estate plots.',
      type: 'farm-growth',
      value: 0.15,
    },
    description: 'The Forest Sanctuary',
  },
  {
    id: 'valoria',
    name: 'Valoria',
    displayName: 'Valoria',
    theme: 'Wealth & Ambition',
    logo: '/cities/Valoria.webp',
    lore: 'A radiant city of gold and ambition. Merchants, nobles, and fortune-seekers gather where opportunity never sleeps.',
    mood: 'prestige',
    primaryColor: '#2E7D32', // Forest Green
    accentColor: '#66BB6A',  // Light Green
    backgroundImage: '/cities/ValoriaCity.webp',
    fallbackGradient: 'linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)',
    attributes: {
      wealth: 'high',
      trade: 'high',
      military: 'medium',
      magic: 'medium',
    },
    perk: {
      id: 'gilded_merchant',
      name: 'Gilded Merchant Trade',
      description: '+12% bonus gold when selling items in the Market.',
      type: 'market-sell',
      value: 0.12,
    },
    description: 'The City of Golden Spires',
  },
  {
    id: 'drakmor',
    name: 'Drakmor',
    displayName: 'Drakmor',
    theme: 'Strength & Survival',
    logo: '/cities/Drakmor.webp',
    lore: 'Forged in hardship and conflict, Drakmor breeds resilience. Only the relentless rise to prominence.',
    mood: 'ruthless',
    primaryColor: '#B71C1C', // Dark Red
    accentColor: '#FF5252',  // Bright Red
    backgroundImage: '/cities/DarkmorCity.webp',
    fallbackGradient: 'linear-gradient(135deg, #B71C1C 0%, #FF5252 100%)',
    attributes: {
      wealth: 'low',
      trade: 'medium',
      military: 'high',
      magic: 'low',
    },
    perk: {
      id: 'deep_vein_mastery',
      name: 'Deep Vein Mastery',
      description: '+15% bonus ore yield & +5 pickaxe strike damage.',
      type: 'mining-yield',
      value: 0.15,
      damageBonus: 5,
    },
    description: 'The Forge of Warriors',
  },
];

/**
 * Get city by ID
 * @param {string} cityId - The city identifier
 * @returns {object|null} City object or null if not found
 */
export const getCityById = (cityId) => {
  if (!cityId) return null;
  return cities.find(city => city.id.toLowerCase() === String(cityId).toLowerCase()) || null;
};

/**
 * Get city by name (case-insensitive)
 * @param {string} cityName - The city name
 * @returns {object|null} City object or null if not found
 */
export const getCityByName = (cityName) => {
  return cities.find(city => 
    city.name.toLowerCase() === cityName.toLowerCase()
  ) || null;
};

/**
 * Get active faction perk for city ID
 * @param {string} cityId - The city identifier
 * @returns {object|null} Perk object or null if not found
 */
export const getCityPerk = (cityId) => {
  if (!cityId) return null;
  const city = getCityById(String(cityId).toLowerCase());
  return city?.perk || null;
};

export default cities;
