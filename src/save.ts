import { localDateKey } from "./retention";
import { eventWeekKey } from "./event";

export type SaveData = {
  level: number;
  stars: number;
  coins: number;
  district: number;
  coffeeShopStage: number;
  parkStage: number;
  riverMarketStage: number;
  boardwalkStage: number;
  skylineTowerStage: number;
  rooftopGardenStage: number;
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

  xp: number;
  totalLines: number;
  totalPlacements: number;
  totalBuilds: number;
  totalLevelsCompleted: number;
  totalDailyChallenges: number;
  achievementClaims: string[];

  eventWeek: string;
  eventPoints: number;
  eventClaims: number[];

  soundEnabled: boolean;
  hapticsEnabled: boolean;
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
  skylineTowerStage: 0,
  rooftopGardenStage: 0,
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

  xp: 0,
  totalLines: 0,
  totalPlacements: 0,
  totalBuilds: 0,
  totalLevelsCompleted: 0,
  totalDailyChallenges: 0,
  achievementClaims: [],

  eventWeek: "",
  eventPoints: 0,
  eventClaims: [],

  soundEnabled: true,
  hapticsEnabled: true,
};

function normalizePeriodic(save: SaveData) {
  const currentWeek = eventWeekKey();
  let next = save;

  if (next.eventWeek !== currentWeek) {
    next = {
      ...next,
      eventWeek: currentWeek,
      eventPoints: 0,
      eventClaims: [],
    };
  }

  const today = localDateKey();
  if (next.dailyMissionDate === today) return next;

  return {
    ...next,
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
    const normalized = normalizePeriodic(merged as SaveData);

    if (
      !raw ||
      normalized.dailyMissionDate !== (merged as SaveData).dailyMissionDate ||
      normalized.eventWeek !== (merged as SaveData).eventWeek
    ) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    }

    return normalized;
  } catch {
    return {
      ...defaults,
      dailyMissionDate: localDateKey(),
      eventWeek: eventWeekKey(),
    };
  }
}

export function writeSave(next: SaveData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function updateSave(mutator: (current: SaveData) => SaveData) {
  const next = normalizePeriodic(mutator(loadSave()));
  writeSave(next);
  return next;
}

export function resetSave() {
  writeSave({
    ...defaults,
    dailyMissionDate: localDateKey(),
    eventWeek: eventWeekKey(),
  });
}

export function districtOneComplete(save: SaveData) {
  return save.coffeeShopStage >= 3 && save.parkStage >= 3;
}

export function districtTwoComplete(save: SaveData) {
  return save.riverMarketStage >= 3 && save.boardwalkStage >= 3;
}


export function districtThreeComplete(save: SaveData) {
  return save.skylineTowerStage >= 3 && save.rooftopGardenStage >= 3;
}
