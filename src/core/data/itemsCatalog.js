import { farmAnimals, farmCrops, farmGoods, getSeedImageSrc } from './farmData';
import { miningConsumables, miningContractToken, miningOres } from './miningData';
import { inventoryItems as gearItems } from './marketData';
import { workshopItems } from './workshopData';

export const getSeedItemId = (cropId) => `seed-${cropId}`;

const defaultImage = '/raceicon/noimage.webp';

const farmGoodImageMap = {
  egg: '/farm/chicken.webp',
  milk: '/farm/cow.webp',
  wool: '/farm/sheep.webp',
  cheese: '/farm/goat.webp',
  truffle: '/farm/pig.webp',
  honey: '/farm/bee.webp',
};

const getFarmGoodImage = (goodId) => {
  if (!goodId) {
    return defaultImage;
  }
  if (farmGoodImageMap[goodId]) {
    return farmGoodImageMap[goodId];
  }
  return getSeedImageSrc(goodId) || defaultImage;
};

const seedItems = farmCrops.map((crop) => ({
  id: getSeedItemId(crop.id),
  name: crop.seedName,
  category: 'Seeds',
  type: 'seed',
  price: crop.seedCost,
  image: getSeedImageSrc(crop.id),
  sourceId: crop.id,
}));

const farmGoodsItems = farmGoods.map((good) => ({
  id: good.id,
  name: good.name,
  category: 'Farm Goods',
  type: 'farm-good',
  sellPrice: good.sellPrice,
  image: getFarmGoodImage(good.id),
}));

const farmAnimalItems = farmAnimals.map((animal) => ({
  id: animal.id,
  name: animal.name,
  category: 'Farm Animals',
  type: 'farm-animal',
  price: animal.price,
  sellPrice: animal.sellPrice,
  image: `/farm/${animal.id}.webp`,
}));

const miningOreItems = miningOres.map((ore) => ({
  id: ore.id,
  name: ore.name,
  category: 'Ore',
  type: 'ore',
  sellPrice: ore.price,
  image: ore.image,
}));

const miningConsumableItems = miningConsumables.map((item) => ({
  id: item.id,
  name: item.name,
  category: 'Consumable',
  type: 'consumable',
  price: item.price,
  description: item.description,
  image: defaultImage,
}));

const miningTokenItem = miningContractToken
  ? {
      id: miningContractToken.id,
      name: miningContractToken.name,
      category: 'Token',
      type: 'token',
      price: miningContractToken.price,
      description: miningContractToken.description,
      image: defaultImage,
    }
  : null;

const workshopCraftedItems = workshopItems.map((item) => ({
  id: item.id,
  name: item.name,
  category: 'Crafted',
  type: 'crafted',
  sellPrice: item.sellValue,
  image: defaultImage,
}));

const gearCatalogItems = gearItems.map((item) => ({
  id: item.id,
  name: item.name,
  category: item.category || 'Gear',
  type: 'gear',
  rarity: item.rarity,
  description: item.description,
  estimate: item.estimate,
  image: item.image,
  condition: item.condition,
  level: item.level,
}));

const extraSalvageItems = [
  {
    id: 'mystery-geode',
    name: 'Uncracked Geode',
    category: 'Ore',
    type: 'ore',
    sellPrice: 120,
    description: 'A rough mineral nodule found deep underground. Take it to the Workshop Lapidary to crack for rare gems.',
    image: defaultImage,
  },
  {
    id: 'ancient-tablet',
    name: 'Ancient Fragmented Tablet',
    category: 'Relic',
    type: 'token',
    rarity: 'Epic',
    sellPrice: 200,
    description: 'Weathered stone tablet inscribed with pre-Emberfall runes. Can be deciphered in the Workshop Scriptorium.',
    image: defaultImage,
  },
  {
    id: 'slime-gel',
    name: 'Emerald Slime Gel',
    category: 'Monster Trophy',
    type: 'reagent',
    sellPrice: 15,
    description: 'Bouncy, gelatinous slime substance. Highly sought by alchemists for restorative draughts.',
    image: defaultImage,
  },
  {
    id: 'wolf-pelt',
    name: 'Shadow Wolf Pelt',
    category: 'Monster Trophy',
    type: 'material',
    sellPrice: 35,
    description: 'Thick shadow-infused pelt harvested from wilderness stalkers. Used for insulated armor linings.',
    image: defaultImage,
  },
  {
    id: 'bone-shard',
    name: 'Deepforge Bone Shard',
    category: 'Monster Trophy',
    type: 'material',
    sellPrice: 25,
    description: 'Calcified bone remnant hardened by subterranean pressure. Used in weapon grips and ritual charms.',
    image: defaultImage,
  },
  {
    id: 'health-potion',
    name: 'Sunforge Healing Elixir',
    category: 'Consumable',
    type: 'consumable',
    sellPrice: 30,
    price: 45,
    description: 'Golden herbal draught that immediately restores 45 Health Points.',
    image: defaultImage,
  },
];

export const itemsCatalog = [
  ...seedItems,
  ...farmGoodsItems,
  ...farmAnimalItems,
  ...miningOreItems,
  ...miningConsumableItems,
  ...(miningTokenItem ? [miningTokenItem] : []),
  ...workshopCraftedItems,
  ...gearCatalogItems,
  ...extraSalvageItems,
];

export const itemsById = itemsCatalog.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

export const getItemById = (itemId) => itemsById[itemId] || null;

export const getItemCategoryLabel = (item) => item?.category || 'Misc';

export const getItemTypeLabel = (item) => item?.type || 'misc';
