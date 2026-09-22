export type LevelDefinition = {
  targetLines: number;
  rewardStars: number;
  rewardCoins: number;
  label: string;
  difficulty: "Easy" | "Medium" | "Hard";
};

const LEVELS: LevelDefinition[] = [
  { targetLines: 3, rewardStars: 1, rewardCoins: 35, label: "First Foundations", difficulty: "Easy" },
  { targetLines: 4, rewardStars: 1, rewardCoins: 40, label: "Corner Blocks", difficulty: "Easy" },
  { targetLines: 5, rewardStars: 1, rewardCoins: 45, label: "Busy Street", difficulty: "Easy" },
  { targetLines: 5, rewardStars: 1, rewardCoins: 50, label: "Tight Fit", difficulty: "Medium" },
  { targetLines: 6, rewardStars: 1, rewardCoins: 55, label: "City Rhythm", difficulty: "Medium" },
  { targetLines: 6, rewardStars: 2, rewardCoins: 60, label: "Builder Rush", difficulty: "Medium" },
  { targetLines: 7, rewardStars: 1, rewardCoins: 65, label: "Downtown Grid", difficulty: "Medium" },
  { targetLines: 7, rewardStars: 2, rewardCoins: 70, label: "Block Avenue", difficulty: "Hard" },
  { targetLines: 8, rewardStars: 2, rewardCoins: 80, label: "Skyline Prep", difficulty: "Hard" },
  { targetLines: 9, rewardStars: 2, rewardCoins: 100, label: "District Finale", difficulty: "Hard" },
];

export function getLevelDefinition(level: number): LevelDefinition {
  if (level <= LEVELS.length) return LEVELS[Math.max(0, level - 1)];

  const cycle = level - LEVELS.length;
  return {
    targetLines: Math.min(12, 9 + Math.floor(cycle / 2)),
    rewardStars: cycle % 3 === 0 ? 2 : 1,
    rewardCoins: Math.min(180, 100 + cycle * 5),
    label: `City Expansion ${cycle}`,
    difficulty: cycle < 4 ? "Medium" : "Hard",
  };
}

export const REFRESH_BOOSTER_UNLOCK_LEVEL = 3;
export const REFRESH_BOOSTER_COST = 80;
