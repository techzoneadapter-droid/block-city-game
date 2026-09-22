export type SaveData = {
  level: number;
  stars: number;
  coins: number;
  district: number;
  coffeeShopStage: number;
  parkStage: number;
  population: number;
  refreshUses: number;
};

const STORAGE_KEY = "block-city-save-v1";

const defaults: SaveData = {
  level: 1,
  stars: 0,
  coins: 150,
  district: 1,
  coffeeShopStage: 0,
  parkStage: 0,
  population: 12,
  refreshUses: 0,
};

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaults };
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return { ...defaults };
  }
}

export function writeSave(next: SaveData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function updateSave(mutator: (current: SaveData) => SaveData) {
  const next = mutator(loadSave());
  writeSave(next);
  return next;
}

export function resetSave() {
  writeSave({ ...defaults });
}

export function districtOneComplete(save: SaveData) {
  return save.coffeeShopStage >= 3 && save.parkStage >= 3;
}
