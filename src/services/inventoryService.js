const normalizeNumber = (value, fallback = 0) => {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
};

export const normalizeInventory = (inventory) => {
  if (!inventory || typeof inventory !== 'object') {
    return {};
  }

  return Object.entries(inventory).reduce((acc, [itemId, amount]) => {
    const safeAmount = Math.max(0, Math.floor(normalizeNumber(amount, 0)));
    if (safeAmount > 0) {
      acc[itemId] = safeAmount;
    }
    return acc;
  }, {});
};

export const getItemCount = (inventory, itemId) => {
  if (!inventory || !itemId) {
    return 0;
  }
  const amount = normalizeNumber(inventory[itemId], 0);
  return Math.max(0, Math.floor(amount));
};

export const applyInventoryDelta = (inventory, delta) => {
  const nextInventory = { ...(inventory || {}) };

  if (!delta || typeof delta !== 'object') {
    return normalizeInventory(nextInventory);
  }

  Object.entries(delta).forEach(([itemId, amount]) => {
    const current = getItemCount(nextInventory, itemId);
    const nextAmount = current + normalizeNumber(amount, 0);
    if (nextAmount > 0) {
      nextInventory[itemId] = Math.floor(nextAmount);
    } else {
      delete nextInventory[itemId];
    }
  });

  return normalizeInventory(nextInventory);
};

export const addItems = (inventory, items) => applyInventoryDelta(inventory, items);

export const removeItems = (inventory, items) => {
  const delta = Object.entries(items || {}).reduce((acc, [itemId, amount]) => {
    acc[itemId] = -Math.abs(normalizeNumber(amount, 0));
    return acc;
  }, {});
  return applyInventoryDelta(inventory, delta);
};

export const canAffordItems = (inventory, requirements) => {
  if (!requirements) {
    return true;
  }
  const list = Array.isArray(requirements)
    ? requirements
    : Object.entries(requirements).map(([id, amount]) => ({ id, amount }));

  return list.every((requirement) =>
    getItemCount(inventory, requirement.id) >= Math.max(0, normalizeNumber(requirement.amount, 0))
  );
};

export const getInventoryTotal = (inventory) => {
  if (!inventory || typeof inventory !== 'object') {
    return 0;
  }
  return Object.values(inventory).reduce((sum, amount) => {
    const safeAmount = Math.max(0, Math.floor(normalizeNumber(amount, 0)));
    return sum + safeAmount;
  }, 0);
};
