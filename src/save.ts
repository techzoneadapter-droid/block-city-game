import { localDateKey } from "./retention";

export type SaveData = {
  level: number;
  stars: number;
  coins: number;
  district: number;
  coffeeShopStage: number;
  parkStage: number;
  riverMarketStage: number;
  boardwalkStage: number;
  population: number;
  refreshUses: number;
  hammerUses: number;
  bulldozerUses: number;

  dailyMissionDate: string;
  dailyLines: number;
  dailyPlacements: number;
  dailyBuilds: number;
  dailyMissionClaims: string[];
  dailyChallengeCompletedDate: string;
  lastCheckinDate: string;
  dailyStreak: number;
  chestProgress: number;
};

const STORAGE_KEY = "block-city-save-v1";

const defaults: SaveData = {
  level: 1,
  stars: 0,
  coins: 150,
  district: 1,
  coffeeShopStage: 0,
  parkStage: 0,
  riverMarketStage: 0,
  boardwalkStage: 0,
  population: 12,
  refreshUses: 0,
  hammerUses: 0,
  bulldozerUses: 0,

  dailyMissionDate: "",
  dailyLines: 0,
  dailyPlacements: 0,
  dailyBuilds: 0,
  dailyMissionClaims: [],
  dailyChallengeCompletedDate: "",
  lastCheckinDate: "",
  dailyStreak: 0,
  chestProgress: 0,
};

function normalizeDaily(save: SaveData) {
  const today = localDateKey();
  if (save.dailyMissionDate === today) return save;

  return {
    ...save,
    dailyMissionDate: today,
    dailyLines: 0,
    dailyPlacements: 0,
    dailyBuilds: 0,
    dailyMissionClaims: [],
  };
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const merged = raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
    const normalized = normalizeDaily(merged as SaveData);

    if (
      !raw ||
      normalized.dailyMissionDate !== (merged as SaveData).dailyMissionDate
    ) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    }

    return normalized;
  } catch {
    return { ...defaults, dailyMissionDate: localDateKey() };
  }
}

export function writeSave(next: SaveData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function updateSave(mutator: (current: SaveData) => SaveData) {
  const next = normalizeDaily(mutator(loadSave()));
  writeSave(next);
  return next;
}

export function resetSave() {
  writeSave({ ...defaults, dailyMissionDate: localDateKey() });
}

export function districtOneComplete(save: SaveData) {
  return save.coffeeShopStage >= 3 && save.parkStage >= 3;
}

export function districtTwoComplete(save: SaveData) {
  return save.riverMarketStage >= 3 && save.boardwalkStage >= 3;
}
