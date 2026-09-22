export type LevelDefinition = {
  targetLines: number;
  targetPlacements?: number;
  rewardStars: number;
  rewardCoins: number;
  label: string;
  difficulty: "Easy" | "Medium" | "Hard";
  startingCells?: Array<[number, number]>;
};

const LEVELS: LevelDefinition[] = [
  {
    targetLines: 3,
    rewardStars: 1,
    rewardCoins: 35,
    label: "First Foundations",
    difficulty: "Easy",
  },
  {
    targetLines: 4,
    rewardStars: 1,
    rewardCoins: 40,
    label: "Corner Blocks",
    difficulty: "Easy",
    startingCells: [[7, 0], [7, 1], [6, 0]],
  },
  {
    targetLines: 5,
    rewardStars: 1,
    rewardCoins: 45,
    label: "Busy Street",
    difficulty: "Easy",
    startingCells: [[7, 2], [7, 3], [7, 4], [6, 3]],
  },
  {
    targetLines: 5,
    targetPlacements: 10,
    rewardStars: 1,
    rewardCoins: 50,
    label: "Tight Fit",
    difficulty: "Medium",
    startingCells: [[6, 0], [6, 1], [6, 6], [6, 7], [7, 0], [7, 7]],
  },
  {
    targetLines: 6,
    targetPlacements: 11,
    rewardStars: 1,
    rewardCoins: 55,
    label: "City Rhythm",
    difficulty: "Medium",
    startingCells: [[7, 1], [7, 2], [7, 5], [7, 6], [6, 2], [6, 5]],
  },
  {
    targetLines: 6,
    targetPlacements: 12,
    rewardStars: 2,
    rewardCoins: 60,
    label: "Builder Rush",
    difficulty: "Medium",
    startingCells: [[5, 0], [5, 7], [6, 0], [6, 7], [7, 0], [7, 3], [7, 4], [7, 7]],
  },
  {
    targetLines: 7,
    targetPlacements: 13,
    rewardStars: 1,
    rewardCoins: 65,
    label: "Downtown Grid",
    difficulty: "Medium",
    startingCells: [[5, 1], [5, 6], [6, 1], [6, 3], [6, 4], [6, 6], [7, 3], [7, 4]],
  },
  {
    targetLines: 7,
    targetPlacements: 14,
    rewardStars: 2,
    rewardCoins: 70,
    label: "Block Avenue",
    difficulty: "Hard",
    startingCells: [[4, 0], [4, 7], [5, 1], [5, 6], [6, 2], [6, 5], [7, 2], [7, 3], [7, 4], [7, 5]],
  },
  {
    targetLines: 8,
    targetPlacements: 15,
    rewardStars: 2,
    rewardCoins: 80,
    label: "Skyline Prep",
    difficulty: "Hard",
    startingCells: [[4, 1], [4, 6], [5, 1], [5, 3], [5, 4], [5, 6], [6, 2], [6, 5], [7, 0], [7, 3], [7, 4], [7, 7]],
  },
  {
    targetLines: 9,
    targetPlacements: 16,
    rewardStars: 2,
    rewardCoins: 100,
    label: "District Finale",
    difficulty: "Hard",
    startingCells: [[3, 0], [3, 7], [4, 1], [4, 6], [5, 2], [5, 5], [6, 2], [6, 3], [6, 4], [6, 5], [7, 0], [7, 1], [7, 6], [7, 7]],
  },
];

export function getLevelDefinition(level: number): LevelDefinition {
  if (level <= LEVELS.length) return LEVELS[Math.max(0, level - 1)];

  const cycle = level - LEVELS.length;
  return {
    targetLines: Math.min(12, 9 + Math.floor(cycle / 2)),
    targetPlacements: Math.min(22, 16 + Math.floor(cycle / 2)),
    rewardStars: cycle % 3 === 0 ? 2 : 1,
    rewardCoins: Math.min(180, 100 + cycle * 5),
    label: `City Expansion ${cycle}`,
    difficulty: cycle < 4 ? "Medium" : "Hard",
    startingCells: cycle % 2 === 0
      ? [[7, 1], [7, 2], [7, 5], [7, 6], [6, 2], [6, 5]]
      : [[7, 0], [7, 3], [7, 4], [7, 7], [6, 1], [6, 6]],
  };
}

export const REFRESH_BOOSTER_UNLOCK_LEVEL = 3;
export const REFRESH_BOOSTER_COST = 80;

export const HAMMER_BOOSTER_UNLOCK_LEVEL = 5;
export const HAMMER_BOOSTER_COST = 60;

export const BULLDOZER_BOOSTER_UNLOCK_LEVEL = 7;
export const BULLDOZER_BOOSTER_COST = 120;
