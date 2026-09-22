import type { SaveData } from "./save";

export type DailyMissionDefinition = {
  id: "lines" | "placements" | "builds";
  title: string;
  target: number;
  rewardCoins: number;
};

export const DAILY_MISSIONS: DailyMissionDefinition[] = [
  { id: "lines", title: "Clear 5 lines", target: 5, rewardCoins: 60 },
  { id: "placements", title: "Place 12 blocks", target: 12, rewardCoins: 50 },
  { id: "builds", title: "Build 1 city stage", target: 1, rewardCoins: 80 },
];

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function previousDateKey(date = new Date()) {
  const previous = new Date(date);
  previous.setDate(previous.getDate() - 1);
  return localDateKey(previous);
}

function hashString(input: string) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getDailyChallenge(dateKey = localDateKey()) {
  let seed = hashString(dateKey);
  const next = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };

  const targetLines = 5 + (next() % 3);
  const targetPlacements = 10 + (next() % 5);
  const rewardCoins = 120 + (next() % 4) * 20;
  const startingCells: Array<[number, number]> = [];
  const seen = new Set<string>();
  const count = 8 + (next() % 5);

  while (startingCells.length < count) {
    const row = 3 + (next() % 5);
    const col = next() % 8;
    const key = `${row}:${col}`;
    if (seen.has(key)) continue;
    seen.add(key);
    startingCells.push([row, col]);
  }

  return {
    key: dateKey,
    title: "Daily City Plan",
    targetLines,
    targetPlacements,
    rewardCoins,
    rewardStars: 1,
    startingCells,
  };
}

export function getCheckinReward(streak: number) {
  const rewards = [50, 60, 70, 80, 100, 120, 200];
  const dayIndex = Math.max(0, (streak - 1) % 7);
  return {
    day: dayIndex + 1,
    coins: rewards[dayIndex],
    stars: dayIndex === 6 ? 1 : 0,
  };
}

export function missionProgress(save: SaveData, id: DailyMissionDefinition["id"]) {
  if (id === "lines") return save.dailyLines;
  if (id === "placements") return save.dailyPlacements;
  return save.dailyBuilds;
}

export function missionClaimed(save: SaveData, id: DailyMissionDefinition["id"]) {
  return save.dailyMissionClaims.includes(id);
}
