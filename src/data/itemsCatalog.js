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

export const itemsCatalog = [
  ...seedItems,
  ...farmGoodsItems,
  ...farmAnimalItems,
  ...miningOreItems,
  ...miningConsumableItems,
  ...(miningTokenItem ? [miningTokenItem] : []),
  ...workshopCraftedItems,
  ...gearCatalogItems,
];

export const itemsById = itemsCatalog.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

export const getItemById = (itemId) => itemsById[itemId] || null;

export const getItemCategoryLabel = (item) => item?.category || 'Misc';

export const getItemTypeLabel = (item) => item?.type || 'misc';
